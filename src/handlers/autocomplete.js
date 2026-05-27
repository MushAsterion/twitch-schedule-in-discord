import { getTwitchHeaders, fetchTwitchData } from '../twitch.js';
import { sortByRelevance } from '../string.js';
import { filterTimeSlots, filterDateOptions, filterTimezoneOptions, filterStreamOptions } from '../commands/options.js';
import { TWITCH_API_BASE, TWITCH_GAMES_PAGE_LIMIT, TWITCH_SCHEDULE_PAGE_LIMIT, IGDB_API_URL, DISCORD_MAX_AUTOCOMPLETE_CHOICES } from '../commands/constants.js';
import localization from '../localization.js';

/**
 * Handle autocomplete for game/category search.
 * Fetches from IGDB and maps to Twitch game IDs.
 * @param {import('discord.js').AutocompleteInteraction} interaction - Discord interaction
 * @param {string} clientId - Twitch client ID
 * @param {string} clientSecret - Twitch client secret
 * @returns {Promise<void>}
 */
export async function handleGameAutocomplete(interaction, clientId, clientSecret) {
    const focused = interaction.options.getFocused(true);
    const twitch_headers = await getTwitchHeaders(clientId, clientSecret);

    try {
        const igdbResponse = await fetch(IGDB_API_URL, {
            method: 'POST',
            headers: twitch_headers,
            body: `search "${focused.value}";fields id;limit ${TWITCH_GAMES_PAGE_LIMIT};`
        });

        const igdbGames = await igdbResponse.json();

        if (!igdbGames?.length) {
            return interaction.respond([]);
        }

        const twitchResponse = await fetch(`${TWITCH_API_BASE}/games?${igdbGames.map(game => `igdb_id=${game.id}`).join('&')}`, { headers: twitch_headers });

        const games = await twitchResponse.json();

        const choices = sortByRelevance(games?.data ?? [], focused.value, 'name')
            .slice(0, DISCORD_MAX_AUTOCOMPLETE_CHOICES)
            .map(game => ({ name: game.name, value: game.id }));

        return interaction.respond(choices);
    } catch (err) {
        console.error('Error in game autocomplete:', err);
        interaction.respond([]);
    }
}

/**
 * Handle autocomplete for stream selection.
 * Fetches upcoming streams from Twitch schedule.
 * @param {import('discord.js').AutocompleteInteraction} interaction - Discord interaction
 * @param {object} channel - Twitch channel config
 * @param {string} clientId - Twitch client ID
 * @param {string} clientSecret - Twitch client secret
 * @returns {Promise<void>}
 */
export async function handleStreamAutocomplete(interaction, channel, clientId, clientSecret) {
    const focused = interaction.options.getFocused(true);
    const locale = interaction.locale;

    if (!channel) {
        return interaction.respond([]);
    }

    try {
        const segments = await fetchTwitchData(schedule => schedule.data?.segments, `${TWITCH_API_BASE}/schedule?broadcaster_id=${channel.twitchId}&start_time=${new Date().toISOString()}&first=${TWITCH_SCHEDULE_PAGE_LIMIT}`, { headers: await getTwitchHeaders(clientId, clientSecret) }, 2);

        const options = filterStreamOptions(segments, locale, focused.value);
        return interaction.respond(options);
    } catch (err) {
        console.error('Error in stream autocomplete:', err);
        interaction.respond([]);
    }
}

/**
 * Handle autocomplete for date selection.
 * @param {import('discord.js').AutocompleteInteraction} interaction - Discord interaction
 * @returns {Promise<void>}
 */
export async function handleDateAutocomplete(interaction) {
    const focused = interaction.options.getFocused(true);
    const locale = interaction.locale;

    try {
        const options = filterDateOptions(locale, focused.value);
        return interaction.respond(options);
    } catch (err) {
        console.error('Error in date autocomplete:', err);
        interaction.respond([]);
    }
}

/**
 * Handle autocomplete for time selection.
 * @param {import('discord.js').AutocompleteInteraction} interaction - Discord interaction
 * @returns {Promise<void>}
 */
export async function handleTimeAutocomplete(interaction) {
    const focused = interaction.options.getFocused(true);

    try {
        const options = filterTimeSlots(focused.value);
        return interaction.respond(options);
    } catch (err) {
        console.error('Error in time autocomplete:', err);
        interaction.respond([]);
    }
}

/**
 * Handle autocomplete for timezone selection.
 * @param {import('discord.js').AutocompleteInteraction} interaction - Discord interaction
 * @param {string[]} timezones - Available timezones
 * @returns {Promise<void>}
 */
export async function handleTimezoneAutocomplete(interaction, timezones) {
    const focused = interaction.options.getFocused(true);

    try {
        const options = filterTimezoneOptions(timezones, focused.value);
        return interaction.respond(options);
    } catch (err) {
        console.error('Error in timezone autocomplete:', err);
        interaction.respond([]);
    }
}

/**
 * Route autocomplete requests to appropriate handler.
 * @param {import('discord.js').AutocompleteInteraction} interaction - Discord interaction
 * @param {object} config - Configuration object with Twitch credentials
 * @param {object} channel - Twitch channel config from database
 * @param {string[]} cachedTimezones - Pre-cached timezones
 * @returns {Promise<void>}
 */
export async function handleAutocomplete(interaction, config, channel, cachedTimezones) {
    const focused = interaction.options.getFocused(true);

    if (focused.name === localization.OPTION_STREAM_GAME.name.default) {
        return handleGameAutocomplete(interaction, config.twitch.clientId, config.twitch.clientSecret);
    } else if (focused.name === localization.OPTION_STREAM_STREAM.name.default) {
        return handleStreamAutocomplete(interaction, channel, config.twitch.clientId, config.twitch.clientSecret);
    } else if (focused.name === localization.OPTION_STREAM_DATE.name.default) {
        return handleDateAutocomplete(interaction);
    } else if (focused.name === localization.OPTION_STREAM_TIME.name.default) {
        return handleTimeAutocomplete(interaction);
    } else if (focused.name === localization.OPTION_STREAM_TIMEZONE.name.default) {
        return handleTimezoneAutocomplete(interaction, cachedTimezones);
    }
}
