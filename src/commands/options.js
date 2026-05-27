import { CACHED_HOURS, CACHED_MINUTES, TIME_SLOT_SEPARATOR, SCHEDULE_DAYS_AHEAD, DISCORD_MAX_AUTOCOMPLETE_CHOICES } from './constants.js';

/**
 * Generate time slot options for autocomplete (HH:MM format).
 * Uses cached hours and minutes to avoid array recreation.
 * @returns {string[]} Array of time slots in HH:MM format
 */
export function generateTimeSlots() {
    const slots = [];
    for (let i = 0; i < 24; i++) {
        const hour = CACHED_HOURS[i];
        for (let j = 0; j < 60; j++) {
            slots.push(`${hour}${TIME_SLOT_SEPARATOR}${CACHED_MINUTES[j]}`);
        }
    }
    return slots;
}

/**
 * Generate date options for autocomplete.
 * Creates array of future dates up to SCHEDULE_DAYS_AHEAD.
 * @param {string} locale - Locale for date formatting
 * @returns {Array<{name: string, value: string}>} Array of date options
 */
export function generateDateOptions(locale) {
    const dates = [];
    for (let i = 0; i < SCHEDULE_DAYS_AHEAD; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        dates.push({
            name: `${date.toLocaleDateString(locale)} (${date.toLocaleDateString(locale, { dateStyle: 'long' })})`,
            value: date.toISOString().slice(0, 10)
        });
    }
    return dates;
}

/**
 * Filter time slot options by user input.
 * @param {string} input - User's focused input
 * @returns {Array<{name: string, value: string}>} Filtered time slots
 */
export function filterTimeSlots(input) {
    const timeSlots = generateTimeSlots();
    return timeSlots
        .filter(h => h.startsWith(input))
        .slice(0, DISCORD_MAX_AUTOCOMPLETE_CHOICES)
        .map(h => ({ name: h, value: h }));
}

/**
 * Filter date options by user input.
 * @param {string} locale - Locale for date formatting
 * @param {string} input - User's focused input
 * @returns {Array<{name: string, value: string}>} Filtered date options
 */
export function filterDateOptions(locale, input) {
    const dateOptions = generateDateOptions(locale);
    return dateOptions.filter(d => d.name.match(input) || d.value.match(input)).slice(0, DISCORD_MAX_AUTOCOMPLETE_CHOICES);
}

/**
 * Filter timezone options by user input.
 * @param {string[]} timezones - Available timezones
 * @param {string} input - User's focused input
 * @returns {Array<{name: string, value: string}>} Filtered timezone options
 */
export function filterTimezoneOptions(timezones, input) {
    const timezoneRegex = new RegExp(input, 'i');
    return timezones
        .filter(t => timezoneRegex.test(t))
        .slice(0, DISCORD_MAX_AUTOCOMPLETE_CHOICES)
        .map(t => ({ name: t, value: t }));
}

/**
 * Filter stream segment options by user input.
 * @param {Array} segments - Available stream segments from Twitch
 * @param {string} locale - Locale for date formatting
 * @param {string} input - User's focused input
 * @returns {Array<{name: string, value: string}>} Filtered stream options
 */
export function filterStreamOptions(segments, locale, input) {
    const focusedRegex = new RegExp(input, 'gi');
    return segments
        .map(segment => {
            const displayTitle = segment.title.length > 60 ? segment.title.slice(0, 60) + '...' : segment.title;
            return {
                name: `${displayTitle} (${new Date(segment.start_time).toLocaleDateString(locale, {
                    hour: '2-digit',
                    minute: '2-digit'
                })})`,
                value: segment.id
            };
        })
        .filter(choice => focusedRegex.test(choice.name))
        .slice(0, DISCORD_MAX_AUTOCOMPLETE_CHOICES);
}
