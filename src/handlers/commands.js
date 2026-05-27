import LZString from 'lz-string';
import { getTwitchHeaders, fetchTwitchData } from '../twitch.js';
import { getLocalizedText, localizedDate } from '../localization.js';
import { sendChange, syncDiscordScheduledEvents, canBotAccessChannel, formatStreamList, segmentToString } from '../services/discord.js';
import { TWITCH_API_BASE, TWITCH_SCHEDULE_PAGE_LIMIT } from '../commands/constants.js';
import localization from '../localization.js';

/**
 * Handle schedule list command - shows upcoming streams.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction - Discord interaction
 * @param {object} channel - Twitch channel config
 * @param {string} locale - User's locale
 * @param {object} config - Configuration object
 * @returns {Promise<void>}
 */
export async function handleList(interaction, channel, locale, config) {
    const streams = await fetchTwitchData(schedule => schedule.data?.segments, `${TWITCH_API_BASE}/schedule?broadcaster_id=${channel.twitchId}&start_time=${new Date().toISOString()}&first=${TWITCH_SCHEDULE_PAGE_LIMIT}`, { headers: await getTwitchHeaders(config.twitch.clientId, config.twitch.clientSecret) }, 2);

    const formattedStreams = streams.map(stream => segmentToString(stream, locale));
    const message = formatStreamList(formattedStreams, getLocalizedText('TEXT_NO_STREAMS', locale));

    return interaction.editReply(message);
}

/**
 * Handle schedule public command - shows upcoming streams (public version).
 * @param {import('discord.js').ChatInputCommandInteraction} interaction - Discord interaction
 * @param {object} channel - Twitch channel config
 * @param {string} locale - User's locale
 * @param {object} config - Configuration object
 * @returns {Promise<void>}
 */
export async function handlePublicSchedule(interaction, channel, locale, config) {
    const streams = await fetchTwitchData(schedule => schedule.data?.segments, `${TWITCH_API_BASE}/schedule?broadcaster_id=${channel.twitchId}&start_time=${new Date().toISOString()}&first=${TWITCH_SCHEDULE_PAGE_LIMIT}`, { headers: await getTwitchHeaders(config.twitch.clientId, config.twitch.clientSecret) }, 2);

    const formattedStreams = streams.map(stream => segmentToString(stream, locale));
    const message = formatStreamList(formattedStreams, getLocalizedText('TEXT_NO_STREAMS_PUBLIC', locale));

    return interaction.editReply(message);
}

/**
 * Handle stream create/edit command.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction - Discord interaction
 * @param {object} channel - Twitch channel config
 * @param {string} locale - User's locale
 * @param {object} config - Configuration object
 * @param {Function} getTwitchUserToken - Function to get user-specific token
 * @param {Function} generateOAuthUrl - Function to generate OAuth URL
 * @returns {Promise<void>}
 */
export async function handleCreateOrEdit(interaction, channel, locale, config, getTwitchUserToken, generateOAuthUrl) {
    const subcommand = interaction.options.getSubcommand();
    const body = {};

    // Parse time options
    const option_date = interaction.options.getString(localization.OPTION_STREAM_DATE.name.default);
    const option_time = interaction.options.getString(localization.OPTION_STREAM_TIME.name.default);
    const option_timezone = interaction.options.getString(localization.OPTION_STREAM_TIMEZONE.name.default) ?? channel.timeZone;

    if (option_date && option_time && option_timezone) {
        body.start_time = localizedDate(`${option_date}T${option_time}Z`, option_timezone);
        body.timezone = option_timezone;
    } else if (option_date || option_time) {
        return interaction.editReply(getLocalizedText('TEXT_TIME_INCOMPLETE', locale));
    }

    // Parse duration
    const option_duration = interaction.options.getInteger(localization.OPTION_STREAM_DURATION.name.default);
    if (option_duration) {
        body.duration = option_duration;
    }

    // Parse recurring
    const option_recurring = interaction.options.getBoolean(localization.OPTION_STREAM_RECURRING.name.default);
    if (typeof option_recurring === 'boolean') {
        body.is_recurring = option_recurring;
    }

    // Parse game
    const option_game = interaction.options.getString(localization.OPTION_STREAM_GAME.name.default);
    if (option_game) {
        body.category_id = option_game;
    }

    // Parse title
    const option_title = interaction.options.getString(localization.OPTION_STREAM_TITLE.name.default);
    if (option_title) {
        body.title = option_title;
    }

    // Parse cancelled status (edit only)
    const option_cancelled = interaction.options.getBoolean(localization.OPTION_STREAM_CANCELLED.name.default);
    if (typeof option_cancelled === 'boolean') {
        body.is_canceled = option_cancelled;
    }

    // Get stream ID for edit
    let segmentId = '';
    if (subcommand === localization.COMMAND_CALENDAR_EDIT.name.default) {
        segmentId = LZString.decompressFromUTF16(interaction.options.getString(localization.OPTION_STREAM_STREAM.name.default) ?? '');
    }

    const userToken = await getTwitchUserToken(interaction, channel);
    const method = subcommand === localization.COMMAND_CALENDAR_CREATE.name.default ? 'POST' : 'PATCH';
    const url = `${TWITCH_API_BASE}/schedule/segment?broadcaster_id=${channel.twitchId}${subcommand === localization.COMMAND_CALENDAR_EDIT.name.default ? `&id=${segmentId}` : ''}`;

    try {
        const response = await fetch(url, {
            method,
            headers: Object.assign(await getTwitchHeaders(config.twitch.clientId, config.twitch.clientSecret, userToken), { 'Content-Type': 'application/json' }),
            body: JSON.stringify(body)
        });

        if (response.status === 401 || response.status === 403) {
            return interaction.editReply(getLocalizedText('TEXT_NOT_CONNECTED', locale).replaceAll('$url', generateOAuthUrl(channel.guildId)));
        }

        if (!(response.status >= 200 && response.status < 300)) {
            console.error(response.statusText);
            try {
                console.error(await response.json());
            } catch (err) {}
            return interaction.editReply(getLocalizedText('TEXT_ERROR', locale));
        }

        const res = await response.json();
        const segment = res.data.segments[0];
        const discordOption = interaction.options.getBoolean(localization.OPTION_STREAM_DISCORD.name.default);

        // Sync with Discord scheduled events
        await syncDiscordScheduledEvents(interaction, segment, res.data, discordOption);

        // Send change notification
        await sendChange(interaction, channel, segment);

        const messageKey = subcommand === localization.COMMAND_CALENDAR_CREATE.name.default ? 'TEXT_STREAM_CREATED' : 'TEXT_STREAM_EDITED';

        return interaction.editReply(getLocalizedText(messageKey, locale));
    } catch (err) {
        console.error(err);
        return interaction.editReply(getLocalizedText('TEXT_ERROR', locale));
    }
}

/**
 * Handle stream delete command.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction - Discord interaction
 * @param {object} channel - Twitch channel config
 * @param {string} locale - User's locale
 * @param {object} config - Configuration object
 * @param {Function} getTwitchUserToken - Function to get user-specific token
 * @returns {Promise<void>}
 */
export async function handleDelete(interaction, channel, locale, config, getTwitchUserToken) {
    const segmentId = LZString.decompressFromUTF16(interaction.options.getString(localization.OPTION_STREAM_STREAM.name.default) ?? '');
    const userToken = await getTwitchUserToken(interaction, channel);

    try {
        // Fetch segment info before deletion
        const segmentRes = await fetch(`${TWITCH_API_BASE}/schedule?broadcaster_id=${channel.twitchId}&id=${segmentId}`, { headers: await getTwitchHeaders(config.twitch.clientId, config.twitch.clientSecret, userToken) })
            .then(res => res.json())
            .catch(() => undefined);

        // Delete the segment
        const response = await fetch(`${TWITCH_API_BASE}/schedule/segment?broadcaster_id=${channel.twitchId}&id=${segmentId}`, {
            method: 'DELETE',
            headers: await getTwitchHeaders(config.twitch.clientId, config.twitch.clientSecret, userToken)
        });

        if (!(response.status >= 200 && response.status < 300)) {
            console.error(response.statusText);
            try {
                console.error(await response.json());
            } catch (err) {}
            return interaction.editReply(getLocalizedText('TEXT_ERROR', locale));
        }

        // Delete linked Discord scheduled events
        const scheduledEvents = await interaction.guild.scheduledEvents.fetch();
        const linkedEventDeletions = Array.from(scheduledEvents.values())
            .filter(e => e.description.includes(segmentId))
            .map(e => e.delete());

        await Promise.all(linkedEventDeletions).catch(console.error);

        // Send change notification
        await sendChange(interaction, channel, segmentRes?.data?.segments?.[0]);

        return interaction.editReply(getLocalizedText('TEXT_STREAM_DELETED', locale));
    } catch (err) {
        console.error(err);
        return interaction.editReply(getLocalizedText('TEXT_ERROR', locale));
    }
}

/**
 * Handle timezone settings command.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction - Discord interaction
 * @param {object} channel - Twitch channel config
 * @param {string} locale - User's locale
 * @param {string} defaultTimeZone - Default timezone for server
 * @param {string[]} cachedTimezones - Pre-cached timezones
 * @returns {Promise<void>}
 */
export async function handleTimezoneSettings(interaction, channel, locale, defaultTimeZone, cachedTimezones) {
    const newTimezone = interaction.options.getString(localization.OPTION_STREAM_NEW_TIMEZONE.name.default);
    const resetTimezone = interaction.options.getBoolean(localization.OPTION_STREAM_RESET_TIMEZONE.name.default);

    if (newTimezone) {
        if (!cachedTimezones.includes(newTimezone)) {
            return interaction.editReply(getLocalizedText('TEXT_ERROR', locale));
        }

        channel.timeZone = newTimezone;
        await channel.save();
        return interaction.editReply(getLocalizedText('TEXT_CHANGED_TIMEZONE', locale, channel));
    } else if (resetTimezone) {
        channel.timeZone = defaultTimeZone;
        await channel.save();
        return interaction.editReply(getLocalizedText('TEXT_CHANGED_TIMEZONE', locale, channel));
    }

    return interaction.editReply(getLocalizedText('TEXT_CURRENT_TIMEZONE', locale, channel));
}

/**
 * Handle change channel settings command.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction - Discord interaction
 * @param {object} channel - Twitch channel config
 * @param {string} locale - User's locale
 * @returns {Promise<void>}
 */
export async function handleChangeChannelSettings(interaction, channel, locale) {
    const newChannel = interaction.options.getChannel(localization.OPTION_STREAM_NEW_CHANGECHANNEL.name.default);
    const newLanguage = interaction.options.getString(localization.OPTION_LOCALE.name.default);
    const resetChannel = interaction.options.getBoolean(localization.OPTION_STREAM_RESET_CHANGECHANNEL.name.default);

    if (newChannel) {
        if (!canBotAccessChannel(newChannel, interaction.guild.members.me)) {
            return interaction.editReply(getLocalizedText('TEXT_NOACCESS_CHANGECHANNEL', locale, { changeChannel: newChannel, changeLanguage: newLanguage }));
        }

        channel.changeChannel = newChannel.id;

        if (typeof newLanguage === 'string') {
            channel.changeLanguage = newLanguage;
        }

        await channel.save();
        return interaction.editReply(getLocalizedText('TEXT_CHANGED_CHANGECHANNEL', locale, channel));
    } else if (newLanguage) {
        channel.changeLanguage = newLanguage;
        await channel.save();
        return interaction.editReply(getLocalizedText('TEXT_CHANGED_CHANGECHANNEL', locale, channel));
    } else if (resetChannel) {
        channel.changeChannel = null;
        delete channel.changeChannel;
        await channel.save();
        return interaction.editReply(getLocalizedText('TEXT_CHANGED_NO_CHANGECHANNEL', locale, channel));
    }

    return interaction.editReply(getLocalizedText(channel.changeChannel ? 'TEXT_CURRENT_CHANGECHANNEL' : 'TEXT_NOCURRENT_CHANGECHANNEL', locale, channel));
}
