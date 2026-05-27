/**
 * Cached constants for performance optimization
 * Prevents repeated expensive operations like Intl.supportedValuesOf() calls
 */

// Cache timezones once at module load
export const CACHED_TIMEZONES = Intl.supportedValuesOf('timeZone');

// Cache hours (00-23) to avoid array recreation on every time slot generation
export const CACHED_HOURS = Array.from({ length: 24 }, (_, i) => `${i < 10 ? '0' : ''}${i}`);

// Cache minutes (00-59) to avoid array recreation on every time slot generation
export const CACHED_MINUTES = Array.from({ length: 60 }, (_, j) => `${j < 10 ? '0' : ''}${j}`);

// Time slot separator for consistency
export const TIME_SLOT_SEPARATOR = ':';

// Twitch API endpoints
export const TWITCH_API_BASE = 'https://api.twitch.tv/helix';
export const IGDB_API_URL = 'https://api.igdb.com/v4/games';

// Twitch Oauth URL template
export const TWITCH_OAUTH_URL_TEMPLATE = 'https://id.twitch.tv/oauth2/authorize';

// Discord embed metadata
export const DISCORD_EMBED_DESCRIPTION_LIMIT = 2000;
export const DISCORD_MAX_AUTOCOMPLETE_CHOICES = 25;

// Stream options constraints
export const STREAM_TITLE_MAX_LENGTH = 140;
export const STREAM_DURATION_MIN = 30;
export const STREAM_DURATION_MAX = 1380;

// Date range for scheduling (days into future)
export const SCHEDULE_DAYS_AHEAD = 365;

// Pagination limits
export const TWITCH_SCHEDULE_PAGE_LIMIT = 25;
export const TWITCH_GAMES_PAGE_LIMIT = 100;
