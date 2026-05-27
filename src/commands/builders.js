import { PermissionFlagsBits } from 'discord.js';
import { LocalizedSlashCommandBooleanOption, LocalizedSlashCommandBuilder, LocalizedSlashCommandChannelOption, LocalizedSlashCommandIntegerOption, LocalizedSlashCommandStringOption, LocalizedSlashCommandSubcommandBuilder, LocalizedSlashCommandSubcommandGroupBuilder } from '../discord.js';
import localization from '../localization.js';
import { STREAM_TITLE_MAX_LENGTH, STREAM_DURATION_MIN, STREAM_DURATION_MAX } from './constants.js';

/**
 * Add stream options to a command builder.
 * Includes: title, game, date, time, duration, timezone
 * @param {LocalizedSlashCommandSubcommandBuilder} builder - Builder to extend.
 * @param {boolean} [required=false] - Whether options are required.
 * @returns {LocalizedSlashCommandSubcommandBuilder}
 */
export function addStreamOptions(builder, required = false) {
    return builder.addStringOption(new LocalizedSlashCommandStringOption('OPTION_STREAM_TITLE').setMaxLength(STREAM_TITLE_MAX_LENGTH).setRequired(required)).addStringOption(new LocalizedSlashCommandStringOption('OPTION_STREAM_GAME').setAutocomplete(true).setRequired(required)).addStringOption(new LocalizedSlashCommandStringOption('OPTION_STREAM_DATE').setAutocomplete(true).setRequired(required)).addStringOption(new LocalizedSlashCommandStringOption('OPTION_STREAM_TIME').setAutocomplete(true).setRequired(required)).addIntegerOption(new LocalizedSlashCommandIntegerOption('OPTION_STREAM_DURATION').setMinValue(STREAM_DURATION_MIN).setMaxValue(STREAM_DURATION_MAX).setRequired(required)).addStringOption(new LocalizedSlashCommandStringOption('OPTION_STREAM_TIMEZONE').setAutocomplete(true).setRequired(false));
}

/**
 * Build the calendar slash command with all subcommands and options.
 * @returns {LocalizedSlashCommandBuilder}
 */
export function buildCalendarCommand() {
    return new LocalizedSlashCommandBuilder('COMMAND_CALENDAR')
        .addSubcommand(addStreamOptions(new LocalizedSlashCommandSubcommandBuilder('COMMAND_CALENDAR_CREATE'), true).addBooleanOption(new LocalizedSlashCommandBooleanOption('OPTION_STREAM_RECURRING').setRequired(false)).addBooleanOption(new LocalizedSlashCommandBooleanOption('OPTION_STREAM_DISCORD').setRequired(false)))
        .addSubcommand(
            addStreamOptions(new LocalizedSlashCommandSubcommandBuilder('COMMAND_CALENDAR_EDIT').addStringOption(new LocalizedSlashCommandStringOption('OPTION_STREAM_STREAM').setAutocomplete(true).setRequired(true)))
                .addBooleanOption(new LocalizedSlashCommandBooleanOption('OPTION_STREAM_CANCELLED').setRequired(false))
                .addBooleanOption(new LocalizedSlashCommandBooleanOption('OPTION_STREAM_DISCORD').setRequired(false))
        )
        .addSubcommand(new LocalizedSlashCommandSubcommandBuilder('COMMAND_CALENDAR_DELETE').addStringOption(new LocalizedSlashCommandStringOption('OPTION_STREAM_STREAM').setAutocomplete(true).setRequired(true)))
        .addSubcommand(new LocalizedSlashCommandSubcommandBuilder('COMMAND_CALENDAR_LIST').addBooleanOption(new LocalizedSlashCommandBooleanOption('OPTION_STREAM_EPHEMERAL').setRequired(false)))
        .addSubcommandGroup(
            new LocalizedSlashCommandSubcommandGroupBuilder('COMMAND_CALENDAR_SETTINGS').addSubcommand(new LocalizedSlashCommandSubcommandBuilder('COMMAND_CALENDAR_SETTINGS_TIMEZONE').addStringOption(new LocalizedSlashCommandStringOption('OPTION_STREAM_NEW_TIMEZONE').setAutocomplete(true).setRequired(false)).addBooleanOption(new LocalizedSlashCommandBooleanOption('OPTION_STREAM_RESET_TIMEZONE').setRequired(false))).addSubcommand(
                new LocalizedSlashCommandSubcommandBuilder('COMMAND_CALENDAR_SETTINGS_CHANGECHANNEL')
                    .addChannelOption(new LocalizedSlashCommandChannelOption('OPTION_STREAM_NEW_CHANGECHANNEL').setRequired(false))
                    .addStringOption(new LocalizedSlashCommandStringOption('OPTION_LOCALE').setChoices(localization.OPTION_LOCALE.options ?? []).setRequired(false))
                    .addBooleanOption(new LocalizedSlashCommandBooleanOption('OPTION_STREAM_RESET_CHANGECHANNEL').setRequired(false))
            )
        )
        .setDMPermission(false)
        .setNSFW(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
}

/**
 * Build the schedule slash command (public calendar view).
 * @returns {LocalizedSlashCommandBuilder}
 */
export function buildScheduleCommand() {
    return new LocalizedSlashCommandBuilder('COMMAND_SCHEDULE').setDMPermission(false).setNSFW(false).setDefaultMemberPermissions(null);
}
