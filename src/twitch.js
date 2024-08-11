/**
 * Get a fresh token and refresh refresh token.
 * @param {string} clientId - Id of the Twitch Client.
 * @param {string} clientSecret - Secret of the Twitch Client.
 * @param {string} guildId - Id of the guild that invoked the action.
 * @param {import('mongoose').Document} document - Document to use as refresh.
 * @param {string} code - Code to exchange.
 * @param {string} redirectUri - Redirect URI of the Twitch Client.
 * @param {import('mongoose').Model} Model - Twitch Model.
 * @returns {Promise<string>}
 */
export async function refreshTwitchToken(clientId, clientSecret, guildId, document, code, redirectUri, Model) {
    const { access_token, refresh_token } = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&${code ? `code=${code}&grant_type=authorization_code&redirect_uri=${encodeURIComponent(redirectUri)}` : `refresh_token=${document.refresh_token}&grant_type=refresh_token`}`, { method: 'POST' }).then(response => response.json());

    const twitchId = code
        ? await fetch('https://id.twitch.tv/oauth2/validate', { headers: await getTwitchHeaders(clientId, clientSecret, access_token) })
              .then(response => response.json())
              .then(response => response.user_id)
        : document;

    if (code && !twitchId) {
        throw new Error('Failed to authenticate user.');
    }

    const previous = code ? await Model.findOne({ guildId, twitchId }).exec() : document;
    if (previous) {
        previous.refresh_token = refresh_token;
        await previous.save();
    } else {
        new Model({ guildId, twitchId, refresh_token }).save();
    }

    return access_token;
}

export async function getTwitchHeaders(clientId, clientSecret, access_token) {
    if (!access_token) {
        access_token = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`, { method: 'POST' })
            .then(response => response.json())
            .then(response => response.access_token);
    }

    return {
        Accept: 'application/json',
        'Client-ID': clientId,
        Authorization: `Bearer ${access_token}`
    };
}

/**
 * Fetch Twitch data.
 * @param {(response: object) => *[]} getData - Function to retrieve data from fetch response.
 * @param {string} query - Fetch query string.
 * @param {object} [options] - Fetch query options.
 * @param {number|undefined} [maxPages] - Max pages to explore. Defaults to undefined (infinite).
 * @param {*[]} [output] - Output data. Defaults to an empty array.
 * @param {string|undefined} [cursor] - Cursor to start by.
 * @param {number} [page] - Current data page
 * @returns {Promise<*[]>}
 */
export async function fetchTwitchData(getData, query, options, maxPages, output = [], cursor = undefined, page = 1) {
    const { data, pagination } = await fetch(`${query}${cursor ? `&after=${cursor}` : ''}`, options)
        .then(response => response.json())
        .then(response => ({ data: getData(response) ?? [], pagination: response.pagination?.cursor }));

    output.push(...data);

    if ((typeof maxPages === 'number' && page >= maxPages) || !pagination) {
        return output;
    }

    return fetchTwitchData(getData, query, options, maxPages, output, pagination, page + 1);
}
