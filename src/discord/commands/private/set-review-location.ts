import type { ChatInputCommandInteraction } from 'discord.js';
import { PermissionsBitField } from 'discord.js';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';

import type ReviewBot from '../../reviewBot';
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

        const channelOpt = interaction.options.getChannel('channel', true);
        const channel = await interaction.guild!.channels.fetch(channelOpt.id)
            .catch(() => null);
        if (!channel)
            return interaction.replyError('Invalid channel.');
        if (!channel.isTextBased() || channel.isVoiceBased())
            return interaction.replyError('Reviews can only be posted in text channels.');

        await this.client.main.mongo.setReviewChannel(interaction.guildId!, channel.id);

        return interaction.replySuccess(`Reviews will now be posted in <#${channel.id}>.`);
    }

}
