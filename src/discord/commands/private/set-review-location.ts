import type {AutocompleteInteraction, ChatInputCommandInteraction} from 'discord.js';
import {PermissionsBitField} from 'discord.js';
import {ApplicationCommandOptionType, ApplicationCommandType} from 'discord-api-types/v10';

import type ReviewBot from '../../reviewBot';
import KingsDevEmbedBuilder from '../../utils/kingsDevEmbedBuilder';
import BaseCommand from '../base.command';

export default class SetReviewLocationCommand extends BaseCommand {
    constructor(client: ReviewBot) {
        super(client, {
            name: 'set-review-location',
            description: 'Set the channel where reviews will be posted.',
            type: ApplicationCommandType.ChatInput,
            default_member_permissions: PermissionsBitField.Flags.Administrator.toString(),
            options: [
                {
                    name: 'channel',
                    description: 'The channel where reviews will be posted.',
                    type: ApplicationCommandOptionType.Channel,
                    required: true,
                },
            ],
        });
    }

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const channel = interaction.options.getChannel('channel', true);
        await this.client.main.mongo.setReviewChannel(interaction.guildId!, channel.id);

        return interaction.replySuccess(`Reviews will now be posted in <#${channel.id}>.`);
    }

}