import LZString from 'lz-string';
import { refreshTwitchToken } from '../twitch.js';

/**
 * Handle Twitch OAuth callback and save authorization code.
 * Validates the callback URL matches expected redirect URI and contains required parameters.
 * @param {string} clientId - Twitch application client ID
 * @param {string} clientSecret - Twitch application client secret
 * @param {string} redirectUri - Registered redirect URI for OAuth
 * @param {string|URL} url - Full callback URL from Twitch
 * @param {typeof import('../schema/TwitchChannel.js')} TwitchChannel - Mongoose model for channel data
 * @returns {Promise<boolean>} True if OAuth code was successfully saved, false otherwise
 */
export async function saveTwitchOAuthCode(clientId, clientSecret, redirectUri, url, TwitchChannel) {
    try {
        // Normalize URL to URL object
        if (typeof url === 'string') {
            url = new URL(url);
        }

        const expectedUri = new URL(redirectUri);

        // Validate callback matches expected redirect URI
        if (url.host !== expectedUri.host || url.pathname !== expectedUri.pathname || !url.searchParams.has('code') || !url.searchParams.has('state')) {
            return false;
        }

        // Extract guild ID from state parameter (compressed)
        const state = JSON.parse(LZString.decompressFromBase64(url.searchParams.get('state')));

        // Exchange authorization code for access token
        await refreshTwitchToken(clientId, clientSecret, state.guildId, undefined, url.searchParams.get('code'), redirectUri, TwitchChannel);

        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

/**
 * Generate a Twitch OAuth authorization URL for user consent.
 * @param {string} clientId - Twitch application client ID
 * @param {string} redirectUri - Registered redirect URI for OAuth
 * @param {string} scopes - Space-separated list of requested scopes
 * @param {string} guildId - Discord guild ID to store in state
 * @returns {string} OAuth authorization URL
 */
export function generateTwitchOAuthUrl(clientId, redirectUri, scopes, guildId) {
    const state = LZString.compressToBase64(JSON.stringify({ guildId }));

    return `https://id.twitch.tv/oauth2/authorize?` + `client_id=${clientId}&` + `redirect_uri=${encodeURIComponent(redirectUri)}&` + `response_type=code&` + `scope=${encodeURIComponent(scopes)}&` + `force_verify=true&` + `state=${state}`;
}
