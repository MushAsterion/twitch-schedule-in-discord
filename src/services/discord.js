import { Colors, EmbedBuilder, GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel, PermissionFlagsBits } from 'discord.js';
import { getLocalizedText } from '../localization.js';
import { DISCORD_EMBED_DESCRIPTION_LIMIT } from './constants.js';
import localization from '../localization.js';

/**
 * Convert a stream segment to a formatted string for Discord.
 * @param {object} segment - Stream segment from Twitch API
 * @param {string} locale - Locale for formatting dates
 * @returns {string} Formatted segment string
 */
export function segmentToString(segment, locale) {
    return `**${segment.title}**\n_${getLocalizedText('LABEL_DATE', locale)} <t:${Math.floor(new Date(segment.start_time) / 1000)}:f> - <t:${Math.floor(new Date(segment.end_time) / 1000)}:f> (<t:${Math.floor(new Date(segment.start_time) / 1000)}:R>)_\n_${getLocalizedText('LABEL_GAME', locale)} ${segment.category?.name ?? getLocalizedText('TEXT_NONE', locale)}_`;
}

/**
 * Send a notification about a stream change (create/edit/delete) to the configured channel.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction - Discord interaction
 * @param {object} channel - Twitch channel config from database
 * @param {object} segment - Updated stream segment
 * @returns {Promise<import('discord.js').Message|void>}
 */
export async function sendChange(interaction, channel, segment) {
    try {
        if (!channel.changeChannel) {
            return;
        }

        const locale = channel.changeLanguage || interaction.guildLocale;
        const subcommand = interaction.options.getSubcommand();

        /** @type {import('discord.js').TextChannel} */
        const changeChannel = await interaction.guild.channels.fetch(channel.changeChannel);

        // Determine color and title based on operation type
        let color, titleKey;
        if (subcommand === localization.COMMAND_CALENDAR_DELETE.name.default) {
            color = Colors.Red;
            titleKey = 'TEXT_STREAM_CHANGE_DELETED';
        } else if (subcommand === localization.COMMAND_CALENDAR_CREATE.name.default) {
            color = Colors.Green;
            titleKey = 'TEXT_STREAM_CHANGE_CREATED';
        } else {
            color = Colors.Orange;
            titleKey = 'TEXT_STREAM_CHANGE_EDITED';
        }

        const res = await changeChannel.send({
            embeds: [new EmbedBuilder().setTitle(getLocalizedText(titleKey, locale)).setColor(color).setDescription(segmentToString(segment, locale)).setAuthor({ name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL() }).setTimestamp(Date.now())]
        });

        return res;
    } catch (err) {
        console.error(err);
    }
}

/**
 * Sync a stream segment with Discord scheduled events.
 * Creates, updates, or deletes scheduled events based on user preference.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction - Discord interaction
 * @param {object} segment - Stream segment from Twitch API
 * @param {object} broadcasterInfo - Broadcaster login info
 * @param {boolean} shouldSync - Whether to sync to Discord (true/false/undefined)
 * @returns {Promise<void>}
 */
export async function syncDiscordScheduledEvents(interaction, segment, broadcasterInfo, shouldSync) {
    try {
        const scheduledEvents = await interaction.guild.scheduledEvents.fetch();
        const linkedEvents = Array.from(scheduledEvents.values()).filter(e => e.description.includes(segment.id));

        if (shouldSync === true) {
            const eventConfig = {
                entityType: GuildScheduledEventEntityType.External,
                privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
                scheduledStartTime: new Date(segment.start_time).getTime(),
                scheduledEndTime: new Date(segment.end_time).getTime(),
                entityMetadata: { location: `https://www.twitch.tv/${broadcasterInfo.login}` },
                name: segment.title,
                description: `[⛓](https://www.twitch.tv/${broadcasterInfo.login}/schedule?segmentID=${segment.id})`
            };

            if (linkedEvents.length) {
                await Promise.all(linkedEvents.map(e => e.edit(eventConfig)));
            } else {
                await interaction.guild.scheduledEvents.create(eventConfig);
            }
        } else if (shouldSync === false) {
            await Promise.all(linkedEvents.map(e => e.delete()));
        }
    } catch (err) {
        console.error(err);
    }
}

/**
 * Check if bot can send messages to a specific channel.
 * @param {import('discord.js').TextChannel} channel - Channel to check
 * @param {import('discord.js').GuildMember} botMember - Bot's guild member object
 * @returns {boolean} True if bot has required permissions
 */
export function canBotAccessChannel(channel, botMember) {
    return channel?.isTextBased() && channel.permissionsFor(botMember).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]);
}

/**
 * Format multiple stream segments for Discord, respecting character limits.
 * @param {string[]} formattedSegments - Pre-formatted segment strings
 * @param {string} emptyMessage - Message to show if no segments
 * @returns {string} Formatted message that fits Discord limits
 */
export function formatStreamList(formattedSegments, emptyMessage) {
    if (!formattedSegments.length) {
        return emptyMessage;
    }

    let currentLength = 0;
    let maxIndex = 0;

    for (let index = 0; index < formattedSegments.length; index++) {
        const segment = formattedSegments[index];
        const separator = index === 0 ? '' : '\n\n';
        const newLength = currentLength + separator.length + segment.length;

        if (newLength > DISCORD_EMBED_DESCRIPTION_LIMIT) {
            break;
        }

        currentLength = newLength;
        maxIndex = index;
    }

    return formattedSegments.slice(0, maxIndex + 1).join('\n\n');
}
