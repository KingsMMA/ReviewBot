import type { ChatInputCommandInteraction, GuildTextBasedChannel } from 'discord.js';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';

import type ReviewBot from '../../reviewBot';
import KingsDevEmbedBuilder from '../../utils/kingsDevEmbedBuilder';
import BaseCommand from '../base.command';

export default class ReviewCommand extends BaseCommand {
    constructor(client: ReviewBot) {
        super(client, {
            name: 'review',
            description: 'Place a review for a user.',
            type: ApplicationCommandType.ChatInput,
            options: [
                {
                    name: 'user',
                    description: 'The user you want to review.',
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: 'rating',
                    description: 'The rating you want to give.',
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                },
                {
                    name: 'review',
                    description: 'The review you want to give.',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        });
    }

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const user = interaction.options.getUser('user', true);
        const rating = interaction.options.getInteger('rating', true);
        const review = interaction.options.getString('review', true);

        if (user.id === interaction.user.id)
            return interaction.replyError('You cannot review yourself.');

        if (rating < 1 || rating > 5) {
            return interaction.replyError('Rating must be between 1 and 5.');
        }

        const guildData = await this.client.main.mongo.getGuildData(interaction.guildId!);
        if (!guildData || !guildData.channel_id) {
            return interaction.replyError('No review channel has been set.  Please ask an administrator to set one.');
        }
        if (!guildData.reviews) guildData.reviews = {};

        const reviewData = guildData.reviews[user.id] || {};

        const authorData = reviewData[interaction.user.id];
        if (authorData) {
            const [
                channelId, messageId
            ] = authorData.message_url.split('/')
                .slice(-2);
            const channel = await this.client.channels.fetch(channelId)
                .catch(() => null);
            if (!channel)
                return interaction.replyError('Failed to fetch old review channel.');
            const message = await (channel as GuildTextBasedChannel).messages.fetch(messageId)
                .catch(() => null);
            if (!message)
                return interaction.replyError('Failed to fetch old review message.');
            await message.delete()
                .catch(() => null);

            delete reviewData[interaction.user.id];
        }

        const averageRating =
            (Object.values(reviewData)
                .reduce((total, review_data) => total + review_data.rating, 0) + rating) / (Object.keys(reviewData).length + 1);
        const embed = new KingsDevEmbedBuilder()
            .setAuthor({
                name: user.tag,
                iconURL: user.displayAvatarURL()
            })
            .addFields(
                { name: 'Rating:', value: '⭐'.repeat(rating), inline: true },
                { name: 'Overall rating:', value: `${'⭐'.repeat(Math.round(averageRating))} (${Math.round(averageRating * 10) / 10}/5)`, inline: true },
                { name: 'Reviewer:', value: interaction.user.tag },
                { name: 'Review:', value: review },
            );

        const reviewChannel = await this.client.channels.fetch(guildData.channel_id)
            .catch(() => null);
        if (!reviewChannel)
            return interaction.replyError('Failed to fetch review channel.');

        const message = await (reviewChannel as GuildTextBasedChannel).send({
            content: `<@${user.id}>`,
            embeds: [
                embed
            ]
        })
            .catch(() => null);
        if (!message)
            return interaction.replyError('Failed to send review message.');

        await this.client.main.mongo.setUserReview(interaction.guildId!, user.id, interaction.user.id, message.url, review, rating);
        return interaction.replySuccess(`Review for ${user.tag} has been ${authorData ? 'updated' : 'posted'}.`);
    }

}
