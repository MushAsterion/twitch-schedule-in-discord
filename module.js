import { Client, Events, IntentsBitField } from 'discord.js';
import mongoose from 'mongoose';

import { refreshTwitchToken } from './src/twitch.js';
import { getLocalizedText } from './src/localization.js';
import { CACHED_TIMEZONES } from './src/commands/constants.js';
import { buildCalendarCommand, buildScheduleCommand } from './src/commands/builders.js';
import { handleAutocomplete } from './src/handlers/autocomplete.js';
import { handleList, handlePublicSchedule, handleCreateOrEdit, handleDelete, handleTimezoneSettings, handleChangeChannelSettings } from './src/handlers/commands.js';
import { saveTwitchOAuthCode, generateTwitchOAuthUrl } from './src/services/oauth.js';
import localization from './src/localization.js';

/**
 * Export saveTwitchOAuthCode for use in HTTP server (index.js)
 * Wraps the service function to inject TwitchChannel model
 */
export async function saveTwitchOAuthCodeWrapper(clientId, clientSecret, redirectUri, url) {
    const { default: TwitchChannel } = await import('./src/schema/TwitchChannel.js');
    return saveTwitchOAuthCode(clientId, clientSecret, redirectUri, url, TwitchChannel);
}

/**
 * Initialize and start the Discord bot(s).
 * @param {object} config - Configuration to initialize the bot(s) with.
 * @param {{ protocol: string, username: string, password: string, host: string, database: string }} config.mongodb - MongoDB configuration.
 * @param {{ clientId: string, clientSecret: string, redirectUri: string, scopes: string }} config.twitch - Twitch configuration.
 * @param {string|string[]} config.token - Token(s) to use for the bot(s).
 * @param {boolean} [config.registerCommands] - Whether to register the commands.
 * @param {string} [config.timeZone] - Default timezone to apply.
 * @returns {Promise<Client<true>[]>}
 */
export default async function (config) {
    // Connect to MongoDB
    await mongoose.connect(`${config.mongodb?.protocol ?? 'mongodb+srv'}://${config.mongodb?.username ? `${config.mongodb.username}${config.mongodb?.password ? `:${config.mongodb.password}` : ''}@` : ''}${config.mongodb?.host}/${config.mongodb?.database}`);

    // Import model after MongoDB connection
    const { default: TwitchChannel } = await import('./src/schema/TwitchChannel.js');

    // Determine default timezone
    const defaultTimeZone = CACHED_TIMEZONES.includes(config.timeZone) ? config.timeZone : Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Helper to get/refresh Twitch user token
    async function getTwitchUserToken(interaction, document) {
        return refreshTwitchToken(config.twitch.clientId, config.twitch.clientSecret, interaction.guildId, document, undefined, config.twitch.redirectUri, TwitchChannel);
    }

    // Helper to generate OAuth URL for reconnection
    function generateOAuthUrl(guildId) {
        return generateTwitchOAuthUrl(config.twitch.clientId, config.twitch.redirectUri, config.twitch.scopes, guildId);
    }

    // Create bot instance(s)
    return Promise.all(
        (config.token instanceof Array ? config.token : [config.token]).map(async token => {
            const client = new Client({ intents: [IntentsBitField.Flags.Guilds] }).on(Events.InteractionCreate, handleInteraction).on(Events.ClientReady, handleClientReady);

            /**
             * Route interaction to appropriate handler
             */
            async function handleInteraction(interaction) {
                const locale = interaction.locale;

                try {
                    const commandName = interaction.commandName;

                    // Only handle calendar and schedule commands
                    if (commandName !== localization.COMMAND_CALENDAR.name.default && commandName !== localization.COMMAND_SCHEDULE.name.default) {
                        return;
                    }

                    // Route to autocomplete or command handler
                    if (interaction.isAutocomplete()) {
                        const channel = await TwitchChannel.findOne({ guildId: interaction.guildId }).exec();
                        return handleAutocomplete(interaction, config, channel, CACHED_TIMEZONES);
                    } else if (interaction.isChatInputCommand()) {
                        return handleChatCommand(interaction, locale, commandName);
                    }
                } catch (err) {
                    console.error(err);
                    try {
                        return interaction[interaction.deferred ? 'editReply' : 'reply']({
                            ephemeral: true,
                            content: getLocalizedText('TEXT_ERROR', locale)
                        });
                    } catch (err) {}
                }
            }

            /**
             * Handle chat input commands
             */
            async function handleChatCommand(interaction, locale, commandName) {
                await interaction.deferReply({
                    ephemeral: interaction.options.getBoolean(localization.OPTION_STREAM_EPHEMERAL.name.default) !== false
                });

                // Fetch channel config
                const channel = await TwitchChannel.findOne({ guildId: interaction.guildId }).exec();

                // Handle not connected
                if (!channel) {
                    if (commandName === localization.COMMAND_SCHEDULE.name.default) {
                        return interaction.editReply(getLocalizedText('TEXT_NOT_CONNECTED_PUBLIC', locale));
                    }
                    const oauthUrl = generateOAuthUrl(interaction.guildId);
                    return interaction.editReply(getLocalizedText('TEXT_NOT_CONNECTED', locale).replaceAll('$url', oauthUrl));
                }

                // Initialize timezone if not set
                if (!channel.timeZone) {
                    channel.timeZone = defaultTimeZone;
                }

                // Route to subcommand handler
                const subcommand = commandName === localization.COMMAND_SCHEDULE.name.default ? commandName : interaction.options.getSubcommand();

                if (subcommand === localization.COMMAND_SCHEDULE.name.default || subcommand === localization.COMMAND_CALENDAR_LIST.name.default) {
                    return commandName === localization.COMMAND_SCHEDULE.name.default ? handlePublicSchedule(interaction, channel, locale, config) : handleList(interaction, channel, locale, config);
                } else if (subcommand === localization.COMMAND_CALENDAR_CREATE.name.default || subcommand === localization.COMMAND_CALENDAR_EDIT.name.default) {
                    return handleCreateOrEdit(interaction, channel, locale, config, getTwitchUserToken, generateOAuthUrl);
                } else if (subcommand === localization.COMMAND_CALENDAR_DELETE.name.default) {
                    return handleDelete(interaction, channel, locale, config, getTwitchUserToken);
                } else if (subcommand === localization.COMMAND_CALENDAR_SETTINGS_TIMEZONE.name.default) {
                    return handleTimezoneSettings(interaction, channel, locale, defaultTimeZone, CACHED_TIMEZONES);
                } else if (subcommand === localization.COMMAND_CALENDAR_SETTINGS_CHANGECHANNEL.name.default) {
                    return handleChangeChannelSettings(interaction, channel, locale);
                }
            }

            /**
             * Register slash commands when bot is ready
             */
            async function handleClientReady(readyClient) {
                if (!config.registerCommands) {
                    return;
                }

                try {
                    await Promise.all([readyClient.application.commands.create(buildCalendarCommand()), readyClient.application.commands.create(buildScheduleCommand())]);
                } catch (err) {
                    console.error('Failed to register commands:', err);
                }
            }

            await client.login(token);
            return client;
        })
    );
}
