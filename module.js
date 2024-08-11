import LZString from 'lz-string';
import { Client, Events, IntentsBitField, SlashCommandBooleanOption, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, Locale, PermissionFlagsBits } from 'discord.js';
import mongoose from 'mongoose';

import { getTwitchHeaders, fetchTwitchData, refreshTwitchToken } from './src/twitch.js';
import localization, { getLocalizedText, localizedDate } from './src/localization.js';

/**
 * Add stream options to builder.
 * @param {SlashCommandSubcommandBuilder} builder - Builder to extend.
 * @param {boolean} [required] - Whether options are due to be required.
 * @returns
 */
function addStreamOptions(builder, required = false) {
    return builder
        .addStringOption(
            new SlashCommandStringOption()
                .setName(localization.OPTION_STREAM_TITLE.name.default)
                .setNameLocalizations(localization.OPTION_STREAM_TITLE.name.localization ?? null)
                .setDescription(localization.OPTION_STREAM_TITLE.description.default)
                .setDescriptionLocalizations(localization.OPTION_STREAM_TITLE.description.localization ?? null)
                .setMaxLength(140)
                .setRequired(required)
        )
        .addStringOption(
            new SlashCommandStringOption()
                .setName(localization.OPTION_STREAM_GAME.name.default)
                .setNameLocalizations(localization.OPTION_STREAM_GAME.name.localization ?? null)
                .setDescription(localization.OPTION_STREAM_GAME.description.default)
                .setDescriptionLocalizations(localization.OPTION_STREAM_GAME.description.localization ?? null)
                .setAutocomplete(true)
                .setRequired(required)
        )
        .addStringOption(
            new SlashCommandStringOption()
                .setName(localization.OPTION_STREAM_DATE.name.default)
                .setNameLocalizations(localization.OPTION_STREAM_DATE.name.localization ?? null)
                .setDescription(localization.OPTION_STREAM_DATE.description.default)
                .setDescriptionLocalizations(localization.OPTION_STREAM_DATE.description.localization ?? null)
                .setAutocomplete(true)
                .setRequired(required)
        )
        .addStringOption(
            new SlashCommandStringOption()
                .setName(localization.OPTION_STREAM_TIME.name.default)
                .setNameLocalizations(localization.OPTION_STREAM_TIME.name.localization ?? null)
                .setDescription(localization.OPTION_STREAM_TIME.description.default)
                .setDescriptionLocalizations(localization.OPTION_STREAM_TIME.description.localization ?? null)
                .setAutocomplete(true)
                .setRequired(required)
        )
        .addStringOption(
            new SlashCommandStringOption()
                .setName(localization.OPTION_STREAM_TIMEZONE.name.default)
                .setNameLocalizations(localization.OPTION_STREAM_TIMEZONE.name.localization ?? null)
                .setDescription(localization.OPTION_STREAM_TIMEZONE.description.default)
                .setDescriptionLocalizations(localization.OPTION_STREAM_TIMEZONE.description.localization ?? null)
                .setAutocomplete(true)
                .setRequired(required)
        )
        .addIntegerOption(
            new SlashCommandIntegerOption()
                .setName(localization.OPTION_STREAM_DURATION.name.default)
                .setNameLocalizations(localization.OPTION_STREAM_DURATION.name.localization ?? null)
                .setDescription(localization.OPTION_STREAM_DURATION.description.default)
                .setDescriptionLocalizations(localization.OPTION_STREAM_DURATION.description.localization ?? null)
                .setMinValue(30)
                .setMaxValue(1380)
                .setRequired(required)
        );
}

/**
 * Save Twitch OAuth code
 * @param {string} clientId - Id of the Twitch Client.
 * @param {string} clientSecret - Secret of the Twitch Client.
 * @param {string} redirectUri - Redirect URI of the Twitch Client.
 * @param {string|URL} url - Url of the page.
 * @returns {Promise<boolean>}
 */
export async function saveTwitchOAuthCode(clientId, clientSecret, redirectUri, url) {
    try {
        if (typeof url === 'string') {
            url = new URL(url);
        }

        const expectedUri = new URL(redirectUri);

        if (url.host !== expectedUri.host || url.pathname !== expectedUri.pathname || !url.searchParams.has('code') || !url.searchParams.has('state')) {
            return false;
        }

        const { default: TwitchChannel } = await import('./src/schema/TwitchChannel.js');
        await refreshTwitchToken(clientId, clientSecret, JSON.parse(LZString.decompressFromBase64(url.searchParams.get('state'))).guildId, undefined, url.searchParams.get('code'), redirectUri, TwitchChannel);

        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

/**
 *
 * @param {object} config - Configuration to initialize the bot(s) with.
 * @param {{ protocol: string, username: string, password: string, host: string, database: string }} config.mongodb - MongoDB configuration.
 * @param {{ clientId: string, clientSecret: string, redirectUri: string, scopes: string }} config.twitch - Twitch configuration.
 * @param {string|string[]} config.token - Token(s) to use for the bot(s).
 * @param {boolean} [config.registerCommands] - Whether to register the commands.
 * @returns {Promise<Client<true>>}
 */
export default async function (config) {
    await mongoose.connect(`${config.mongodb?.protocol ?? 'mongodb+srv'}://${config.mongodb?.username ? `${config.mongodb?.username}${config.mongodb?.password ? `:${config.mongodb.password}` : ''}@` : ''}${config.mongodb?.host}/${config.mongodb?.database}`);
    const { default: TwitchChannel } = await import('./src/schema/TwitchChannel.js');
    const connectUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${config.twitch.clientId}&redirect_uri=${encodeURIComponent(config.twitch.redirectUri)}&response_type=code&scope=${encodeURIComponent(config.twitch.scopes)}&force_verify=true`;

    /**
     * Get a fresh user token.
     * @param {import('discord.js').BaseInteraction} interaction - Interaction to get the token for.
     * @param {import('mongoose').Document} document - Document to get the token for.
     * @returns
     */
    async function getTwitchUserToken(interaction, document) {
        return refreshTwitchToken(config.twitch.clientId, config.twitch.clientSecret, interaction.guildId, document, undefined, config.twitch.redirectUri, TwitchChannel);
    }

    return Promise.all(
        (config.token instanceof Array ? config.token : [config.token]).map(async token => {
            const client = new Client({ intents: [IntentsBitField.Flags.Guilds] })
                .on(Events.InteractionCreate, async interaction => {
                    const commandName = interaction.commandName;
                    if (commandName !== localization.COMMAND_CALENDAR.name.default) {
                        return;
                    }

                    const locale = interaction.locale;

                    if (interaction.isAutocomplete()) {
                        const focused = interaction.options.getFocused(true);

                        if (focused.name === localization.OPTION_STREAM_GAME.name.default) {
                            const twitch_headers = await getTwitchHeaders(config.twitch.clientId, config.twitch.clientSecret);

                            return fetch('https://api.igdb.com/v4/games', {
                                method: 'POST',
                                headers: twitch_headers,
                                body: `search "${focused.value}";fields id;limit 100;`
                            })
                                .then(response => response.json())
                                .then(igdbGames =>
                                    igdbGames?.length
                                        ? fetch(`https://api.twitch.tv/helix/games?${igdbGames.map(game => `igdb_id=${game.id}`).join('&')}`, { headers: twitch_headers })
                                              .then(response => response.json())
                                              .then(games =>
                                                  interaction.respond(
                                                      (games?.data ?? []).slice(0, 25).map(game => ({
                                                          name: game.name,
                                                          value: game.id
                                                      }))
                                                  )
                                              )
                                        : interaction.respond([])
                                );
                        } else if (focused.name === localization.OPTION_STREAM_STREAM.name.default) {
                            const channel = await TwitchChannel.findOne({ guildId: interaction.guildId }).exec();

                            if (!channel) {
                                return interaction.respond([]);
                            }

                            return interaction.respond(
                                (await fetchTwitchData(schedule => schedule.data?.segments, `https://api.twitch.tv/helix/schedule?broadcaster_id=${channel.twitchId}&start_time=${new Date().toISOString()}&first=25`, { headers: await getTwitchHeaders(config.twitch.clientId, config.twitch.clientSecret) }, 2))
                                    .map(segment => ({
                                        name: `${segment.title.slice(0, 60)}${segment.title.length > 60 ? '...' : ''} (${new Date(segment.start_time).toLocaleDateString(locale, {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })})`,
                                        value: LZString.compressToUTF16(segment.id)
                                    }))
                                    .filter(choice => choice.name.match(new RegExp(`${focused.value}`, 'gi')))
                                    .slice(0, 25)
                            );
                        } else if (focused.name === localization.OPTION_STREAM_DATE.name.default) {
                            return interaction.respond(
                                new Array(365)
                                    .fill(undefined)
                                    .map((_, i) => {
                                        const date = new Date();
                                        date.setDate(date.getDate() + i);

                                        return {
                                            name: `${date.toLocaleDateString(locale)} (${date.toLocaleDateString(locale, { dateStyle: 'long' })})`,
                                            value: date.toLocaleDateString('az')
                                        };
                                    })
                                    .filter(d => d.name.match(focused.value) || d.value.match(focused.value))
                                    .slice(0, 25)
                            );
                        } else if (focused.name === localization.OPTION_STREAM_TIME.name.default) {
                            return interaction.respond(
                                new Array(24)
                                    .fill(undefined)
                                    .map((_, i) => new Array(60).fill(undefined).map((_, j) => `${i < 10 ? '0' : ''}${i}:${j < 10 ? '0' : ''}${j}`))
                                    .flat(1)
                                    .filter(h => h.startsWith(focused.value))
                                    .slice(0, 25)
                                    .map(h => ({ name: h, value: h }))
                            );
                        } else if (focused.name === localization.OPTION_STREAM_TIMEZONE.name.default) {
                            return interaction.respond(
                                Intl.supportedValuesOf('timeZone')
                                    .filter(t => t.match(focused.value))
                                    .slice(0, 25)
                                    .map(t => ({ name: t, value: t }))
                            );
                        }
                    } else if (interaction.isChatInputCommand()) {
                        const subcommand = interaction.options.getSubcommand();
                        await interaction.deferReply({ ephemeral: interaction.options.getBoolean(localization.OPTION_STREAM_EPHEMERAL.name.default) !== false });

                        const channel = await TwitchChannel.findOne({ guildId: interaction.guildId }).exec();
                        if (!channel) {
                            return interaction.editReply(getLocalizedText('TEXT_NOT_CONNECTED', locale).replaceAll('$url', `${connectUrl}&state=${LZString.compressToBase64(JSON.stringify({ guildId: interaction.guildId }))}`));
                        }

                        switch (subcommand) {
                            case localization.COMMAND_CALENDAR_LIST.name.default:
                                return fetchTwitchData(schedule => schedule.data?.segments, `https://api.twitch.tv/helix/schedule?broadcaster_id=${channel.twitchId}&start_time=${new Date().toISOString()}&first=25`, { headers: await getTwitchHeaders(config.twitch.clientId, config.twitch.clientSecret, await getTwitchUserToken(interaction, channel)) }, 2)
                                    .then(streams => streams.map(stream => `**${stream.title}**\n_${getLocalizedText('LABEL_DATE', locale)} <t:${Math.floor(new Date(stream.start_time) / 1000)}:f> - <t:${Math.floor(new Date(stream.end_time) / 1000)}:f> (<t:${Math.floor(new Date(stream.start_time) / 1000)}:R>)_\n_${getLocalizedText('LABEL_GAME', locale)} ${stream.category?.name ?? getLocalizedText('TEXT_NONE', locale)}_`))
                                    .then(streams =>
                                        interaction.editReply(
                                            streams.length
                                                ? streams
                                                      .slice(
                                                          0,
                                                          streams.reduce(
                                                              (value, b, index) => ({
                                                                  length: value.length + '\n\n'.length + b.length,
                                                                  index: value.length + b.length + '\n\n'.length > 2000 ? value.index : index
                                                              }),
                                                              {
                                                                  length: 0,
                                                                  index: 0
                                                              }
                                                          ).index
                                                      )
                                                      .join('\n\n')
                                                : getLocalizedText('TEXT_NO_STREAMS', locale)
                                        )
                                    );
                            case localization.COMMAND_CALENDAR_CREATE.name.default:
                            case localization.COMMAND_CALENDAR_EDIT.name.default:
                                const body = {};

                                const option_date = interaction.options.getString(localization.OPTION_STREAM_DATE.name.default);
                                const option_time = interaction.options.getString(localization.OPTION_STREAM_TIME.name.default);
                                const option_timezone = interaction.options.getString(localization.OPTION_STREAM_TIMEZONE.name.default);
                                if (option_date && option_time && option_timezone) {
                                    body.start_time = localizedDate(`${option_date}T${option_time}Z`, option_timezone);
                                    body.timezone = option_timezone;
                                } else if (option_date || option_time || option_timezone) {
                                    return interaction.editReply(getLocalizedText('TEXT_TIME_INCOMPLETE', locale));
                                }

                                const option_duration = interaction.options.getInteger(localization.OPTION_STREAM_DURATION.name.default);
                                if (option_duration) {
                                    body.duration = option_duration;
                                }

                                const option_recurring = interaction.options.getBoolean(localization.OPTION_STREAM_RECURRING.name.default);
                                if (typeof option_recurring === 'boolean') {
                                    body.is_recurring = option_recurring;
                                }

                                const option_game = interaction.options.getString(localization.OPTION_STREAM_GAME.name.default);
                                if (option_game) {
                                    body.category_id = option_game;
                                }

                                const option_title = interaction.options.getString(localization.OPTION_STREAM_TITLE.name.default);
                                if (option_title) {
                                    body.title = option_title;
                                }

                                const option_cancelled = interaction.options.getBoolean(localization.OPTION_STREAM_CANCELLED.name.default);
                                if (typeof option_cancelled === 'boolean') {
                                    body.is_canceled = option_cancelled;
                                }

                                return fetch(`https://api.twitch.tv/helix/schedule/segment?broadcaster_id=${channel.twitchId}${subcommand === localization.COMMAND_CALENDAR_EDIT.name.default ? `&id=${LZString.decompressFromUTF16(interaction.options.getString(localization.OPTION_STREAM_STREAM.name.default))}` : ''}`, {
                                    method: subcommand === localization.COMMAND_CALENDAR_CREATE.name.default ? 'POST' : 'PATCH',
                                    headers: await getTwitchHeaders(config.twitch.clientId, config.twitch.clientSecret, await getTwitchUserToken(interaction, channel)),
                                    body: JSON.stringify(body)
                                }).then(response => {
                                    if (response.status === 401 || response.status === 403) {
                                        return interaction.editReply(getLocalizedText('TEXT_NOT_CONNECTED', locale).replaceAll('$url', `${connectUrl}&state=${LZString.compressToBase64(JSON.stringify({ guildId: interaction.guildId }))}`));
                                    } else if (response.status >= 200 && response.status < 300) {
                                        return interaction.editReply(getLocalizedText(subcommand === localization.COMMAND_CALENDAR_CREATE.name.default ? 'TEXT_STREAM_CREATED' : 'TEXT_STREAM_EDITED', locale));
                                    } else {
                                        console.error(response.statusText);
                                        return interaction.editReply(getLocalizedText('TEXT_ERROR', locale));
                                    }
                                });
                            case localization.COMMAND_CALENDAR_DELETE.name.default:
                                return fetch(`https://api.twitch.tv/helix/schedule/segment?broadcaster_id=${channel.twitchId}&id=${LZString.decompressFromUTF16(interaction.options.getString(localization.OPTION_STREAM_STREAM.name.default) ?? '')}`, {
                                    method: 'DELETE',
                                    headers: await getTwitchHeaders(config.twitch.clientId, config.twitch.clientSecret, await getTwitchUserToken(interaction, channel))
                                }).then(response => {
                                    if (response.status >= 200 && response.status < 300) {
                                        return interaction.editReply(getLocalizedText('TEXT_STREAM_DELETED', locale));
                                    }

                                    console.error(response.statusText);
                                    return interaction.editReply(getLocalizedText('TEXT_ERROR', locale));
                                });
                        }
                    }
                })
                .on(Events.ClientReady, client => {
                    if (config.registerCommands) {
                        client.application.commands.create(
                            new SlashCommandBuilder()
                                .setName(localization.COMMAND_CALENDAR.name.default)
                                .setNameLocalizations(localization.COMMAND_CALENDAR.name.localization ?? null)
                                .setDescription(localization.COMMAND_CALENDAR.description.default)
                                .setDescriptionLocalizations(localization.COMMAND_CALENDAR.description.localization ?? null)
                                .addSubcommand(
                                    addStreamOptions(
                                        new SlashCommandSubcommandBuilder()
                                            .setName(localization.COMMAND_CALENDAR_CREATE.name.default)
                                            .setNameLocalizations(localization.COMMAND_CALENDAR_CREATE.name.localization ?? null)
                                            .setDescription(localization.COMMAND_CALENDAR_CREATE.description.default)
                                            .setDescriptionLocalizations(localization.COMMAND_CALENDAR_CREATE.description.localization ?? null),
                                        true
                                    ).addBooleanOption(
                                        new SlashCommandBooleanOption()
                                            .setName(localization.OPTION_STREAM_RECURRING.name.default)
                                            .setNameLocalizations(localization.OPTION_STREAM_RECURRING.name.localization ?? null)
                                            .setDescription(localization.OPTION_STREAM_RECURRING.description.default)
                                            .setDescriptionLocalizations(localization.OPTION_STREAM_RECURRING.description.localization ?? null)
                                            .setRequired(false)
                                    )
                                )
                                .addSubcommand(
                                    addStreamOptions(
                                        new SlashCommandSubcommandBuilder()
                                            .setName(localization.COMMAND_CALENDAR_EDIT.name.default)
                                            .setNameLocalizations(localization.COMMAND_CALENDAR_EDIT.name.localization ?? null)
                                            .setDescription(localization.COMMAND_CALENDAR_EDIT.description.default)
                                            .setDescriptionLocalizations(localization.COMMAND_CALENDAR_EDIT.description.localization ?? null)
                                            .addStringOption(
                                                new SlashCommandStringOption()
                                                    .setName(localization.OPTION_STREAM_STREAM.name.default)
                                                    .setNameLocalizations(localization.OPTION_STREAM_STREAM.name.localization ?? null)
                                                    .setDescription(localization.OPTION_STREAM_STREAM.description.default)
                                                    .setDescriptionLocalizations(localization.OPTION_STREAM_STREAM.description.localization ?? null)
                                                    .setAutocomplete(true)
                                                    .setRequired(true)
                                            )
                                    ).addBooleanOption(
                                        new SlashCommandBooleanOption()
                                            .setName(localization.OPTION_STREAM_CANCELLED.name.default)
                                            .setNameLocalizations(localization.OPTION_STREAM_CANCELLED.name.localization ?? null)
                                            .setDescription(localization.OPTION_STREAM_CANCELLED.description.default)
                                            .setDescriptionLocalizations(localization.OPTION_STREAM_CANCELLED.description.localization ?? null)
                                            .setRequired(false)
                                    )
                                )
                                .addSubcommand(
                                    new SlashCommandSubcommandBuilder()
                                        .setName(localization.COMMAND_CALENDAR_DELETE.name.default)
                                        .setNameLocalizations(localization.COMMAND_CALENDAR_DELETE.name.localization ?? null)
                                        .setDescription(localization.COMMAND_CALENDAR_DELETE.description.default)
                                        .setDescriptionLocalizations(localization.COMMAND_CALENDAR_DELETE.description.localization ?? null)
                                        .addStringOption(
                                            new SlashCommandStringOption()
                                                .setName(localization.OPTION_STREAM_STREAM.name.default)
                                                .setNameLocalizations(localization.OPTION_STREAM_STREAM.name.localization ?? null)
                                                .setDescription(localization.OPTION_STREAM_STREAM.description.default)
                                                .setDescriptionLocalizations(localization.OPTION_STREAM_STREAM.description.localization ?? null)
                                                .setAutocomplete(true)
                                                .setRequired(true)
                                        )
                                )
                                .addSubcommand(
                                    new SlashCommandSubcommandBuilder()
                                        .setName(localization.COMMAND_CALENDAR_LIST.name.default)
                                        .setNameLocalizations(localization.COMMAND_CALENDAR_LIST.name.localization ?? null)
                                        .setDescription(localization.COMMAND_CALENDAR_LIST.description.default)
                                        .setDescriptionLocalizations(localization.COMMAND_CALENDAR_LIST.description.localization ?? null)
                                        .addBooleanOption(
                                            new SlashCommandBooleanOption()
                                                .setName(localization.OPTION_STREAM_EPHEMERAL.name.default)
                                                .setNameLocalizations(localization.OPTION_STREAM_EPHEMERAL.name.localization ?? null)
                                                .setDescription(localization.OPTION_STREAM_EPHEMERAL.description.default)
                                                .setDescriptionLocalizations(localization.OPTION_STREAM_EPHEMERAL.description.localization ?? null)
                                                .setRequired(false)
                                        )
                                )
                                .setDMPermission(false)
                                .setNSFW(false)
                                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
                        );
                    }
                });

            await client.login(token);
            return client;
        })
    );
}
