/**
 * Sort an array by relevance.
 * @template T=string|object
 * @param {T[]} array - Array to sort.
 * @param {string} searchString - Search string to sort by.
 * @param {string} [property] - Property to sort by if array is an array of objects.
 * @returns {T}
 */
export function sortByRelevance(array, searchString, property) {
    const searchTokens = searchString.toLowerCase().split(' ');

    return array.sort((a, b) => {
        const titleA = (property ? a[property] : a).toLowerCase();
        const titleB = (property ? b[property] : b).toLowerCase();

        const matchesA = searchTokens.filter(token => titleA.includes(token)).length;
        const matchesB = searchTokens.filter(token => titleB.includes(token)).length;

        // Prioritize exact matches
        const exactMatchA = titleA === searchString.toLowerCase();
        const exactMatchB = titleB === searchString.toLowerCase();

        if (exactMatchA && !exactMatchB) return -1;
        if (!exactMatchA && exactMatchB) return 1;

        // Prioritize more matches
        if (matchesA > matchesB) return -1;
        if (matchesA < matchesB) return 1;

        // Prioritize earlier matches
        const indexA = titleA.indexOf(searchTokens[0]);
        const indexB = titleB.indexOf(searchTokens[0]);

        if (indexA < indexB) return -1;
        if (indexA > indexB) return 1;

        return 0;
    });
}
