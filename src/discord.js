import { SlashCommandBooleanOption, SlashCommandIntegerOption, SlashCommandStringOption, SlashCommandChannelOption, SlashCommandRoleOption, SlashCommandUserOption, SlashCommandNumberOption, SlashCommandAttachmentOption, SlashCommandMentionableOption, SlashCommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import localizations from './localization.js';

/** @typedef {(keyof localizations)|{ name: { default: string, localization?: import('discord.js').LocalizationMap }, description: { default: string, localization?: import('discord.js').LocalizationMap } }} localizationConfig */

/**
 * Localize name and description of an element.
 * @param target - Element to localize.
 * @param {localizationConfig} localization - Localization to use.
 * @returns {target} - Element with name and description localized.
 */
export function localize(target, localization) {
    if (typeof localization === 'string') {
        localization = localizations[localization];
    }

    if (!localization || typeof localization !== 'object') {
        return target;
    }

    if (typeof localization.name === 'string') {
        localization.name = { default: localization.name };
    }

    if (typeof localization.description === 'string') {
        localization.description = { default: localization.description };
    }

    return target
        .setName(localization.name.default)
        .setNameLocalizations(localization.name.localization ?? null)
        .setDescription(localization.description.default)
        .setDescriptionLocalizations(localization.description.localization ?? null);
}

export class LocalizedSlashCommandBooleanOption extends SlashCommandBooleanOption {
    /** @param {localizationConfig} localization */
    constructor(localization, ...args) {
        super(...args);
        localize(this, localization);
    }
}

export class LocalizedSlashCommandIntegerOption extends SlashCommandIntegerOption {
    /** @param {localizationConfig} localization */
    constructor(localization, ...args) {
        super(...args);
        localize(this, localization);
    }
}

export class LocalizedSlashCommandStringOption extends SlashCommandStringOption {
    /** @param {localizationConfig} localization */
    constructor(localization, ...args) {
        super(...args);
        localize(this, localization);
    }
}

export class LocalizedSlashCommandChannelOption extends SlashCommandChannelOption {
    /** @param {localizationConfig} localization */
    constructor(localization, ...args) {
        super(...args);
        localize(this, localization);
    }
}

export class LocalizedSlashCommandRoleOption extends SlashCommandRoleOption {
    /** @param {localizationConfig} localization */
    constructor(localization, ...args) {
        super(...args);
        localize(this, localization);
    }
}

export class LocalizedSlashCommandUserOption extends SlashCommandUserOption {
    /** @param {localizationConfig} localization */
    constructor(localization, ...args) {
        super(...args);
        localize(this, localization);
    }
}

export class LocalizedSlashCommandNumberOption extends SlashCommandNumberOption {
    /** @param {localizationConfig} localization */
    constructor(localization, ...args) {
        super(...args);
        localize(this, localization);
    }
}

export class LocalizedSlashCommandAttachmentOption extends SlashCommandAttachmentOption {
    /** @param {localizationConfig} localization */
    constructor(localization, ...args) {
        super(...args);
        localize(this, localization);
    }
}

export class LocalizedSlashCommandMentionableOption extends SlashCommandMentionableOption {
    /** @param {localizationConfig} localization */
    constructor(localization, ...args) {
        super(...args);
        localize(this, localization);
    }
}

export class LocalizedSlashCommandBuilder extends SlashCommandBuilder {
    /** @param {localizationConfig} localization */
    constructor(localization, ...args) {
        super(...args);
        localize(this, localization);
    }
}

export class LocalizedSlashCommandSubcommandGroupBuilder extends SlashCommandSubcommandGroupBuilder {
    /** @param {localizationConfig} localization */
    constructor(localization, ...args) {
        super(...args);
        localize(this, localization);
    }
}

export class LocalizedSlashCommandSubcommandBuilder extends SlashCommandSubcommandBuilder {
    /** @param {localizationConfig} localization */
    constructor(localization, ...args) {
        super(...args);
        localize(this, localization);
    }
}
