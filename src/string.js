/**
 * Sort an array by relevance.
 * @template T=string|object
 * @param {T[]} array - Array to sort.
 * @param {string} searchString - Search string to sort by.
 * @param {string} [property] - Property to sort by if array is an array of objects.
 * @returns {T}
 */
export function sortByRelevance(array, searchString, property) {
    const searchStringLower = searchString.toLowerCase();
    const searchTokens = searchStringLower.split(' ');
    const firstToken = searchTokens[0];

    return array.sort((a, b) => {
        const titleA = (property ? a[property] : a).toLowerCase();
        const titleB = (property ? b[property] : b).toLowerCase();

        const matchesA = searchTokens.filter(token => titleA.includes(token)).length;
        const matchesB = searchTokens.filter(token => titleB.includes(token)).length;

        // Prioritize exact matches
        if (titleA === searchStringLower && titleB !== searchStringLower) return -1;
        if (titleA !== searchStringLower && titleB === searchStringLower) return 1;

        // Prioritize more matches
        if (matchesA > matchesB) return -1;
        if (matchesA < matchesB) return 1;

        // Prioritize earlier matches
        const indexA = titleA.indexOf(firstToken);
        const indexB = titleB.indexOf(firstToken);

        if (indexA < indexB) return -1;
        if (indexA > indexB) return 1;

        return 0;
    });
}
