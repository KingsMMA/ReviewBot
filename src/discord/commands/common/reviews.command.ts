import type { ChatInputCommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';

import type ReviewBot from '../../reviewBot';
import KingsDevEmbedBuilder from '../../utils/kingsDevEmbedBuilder';
import BaseCommand from '../base.command';

export default class reviewsCommand extends BaseCommand {
    constructor(client: ReviewBot) {
        super(client, {
            name: 'reviews',
            description: 'View a user\'s reviews.',
            type: ApplicationCommandType.ChatInput,
            options: [
                {
                    name: 'user',
                    description: 'The user you want to view reviews for.',
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
            ],
        });
    }

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const user = interaction.options.getUser('user', true);
        const member = await interaction.guild!.members.fetch(user.id)
            .catch(() => null);
        if (!member)
            return interaction.replyError('User not found.');

        const guildData = await this.client.main.mongo.getGuildData(interaction.guildId!);
        if (!guildData || !guildData.reviews || !guildData.reviews[user.id])
            return interaction.replyError('No reviews found for this user.');

        const reviews = guildData.reviews[user.id];
        const averageRating =
            (Object.values(reviews)
                .reduce((total, review_data) => total + review_data.rating, 0)) / Object.keys(reviews).length;
        const embed = new KingsDevEmbedBuilder()
            .setTitle(`${member.displayName}'s Reviews`)
            .setColor(member.displayColor)
            .setThumbnail(member.user.displayAvatarURL())
            .setDescription(`**Total Reviews:** ${Object.keys(reviews).length
            }\n**Average Rating:** ${'⭐'.repeat(Math.round(averageRating))} (${averageRating.toFixed(2)})`)
            .addFields(
                await Promise.all(
                    Object.entries(reviews)
                        .map(async ([
                            authorId, review_data
                        ]) => ({
                            name: `${
                                (await interaction.guild!.members.fetch(authorId)
                                    .catch(() => null))?.displayName || 'Unknown'
                            } (${authorId})`,
                            value: `**Rating:** ${'⭐'.repeat(review_data.rating)} (${review_data.rating})\n**Review:** ${review_data.review}`,
                        }))
                )
            );
        return interaction.editReply({ embeds: [
            embed
        ] });
    }

}
