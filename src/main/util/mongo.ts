import type { Snowflake } from 'discord-api-types/globals';
import type { Db } from 'mongodb';
import { MongoClient } from 'mongodb';

import type Main from '../main';

export type GuildData = {
    guild_id: Snowflake,
    channel_id: Snowflake,
    reviews: {
        [user_id: Snowflake]: {
            [author_id: Snowflake]: {
                message_url: string,
                review: string,
                rating: number,
                timestamp: Date,
            }
        }
    }
};

export default class Mongo {
    private mongo!: Db;
    main: Main;
    constructor(main: Main) {
        this.main = main;
    }

    async connect() {
        const client = await MongoClient.connect(process.env.MONGO_URI!);
        this.mongo = client.db(this.main.config.mongo.database);
        console.info(`Connected to Database ${this.mongo.databaseName}`);
    }

    async setReviewChannel(guildId: Snowflake, channelId: Snowflake) {
        return this.mongo
            .collection('reviews')
            .updateOne({ guild_id: guildId }, { $set: { channel_id: channelId } }, { upsert: true });
    }

    async getGuildData(guildId: Snowflake): Promise<GuildData | null> {
        return await this.mongo
            .collection('reviews')
            .findOne({ guild_id: guildId, channel_id: { $exists: true } }) as GuildData | null;
    }

    async setUserReview(guildId: Snowflake, userId: Snowflake, authorId: Snowflake, message_url: string, review: string, rating: number) {
        return this.mongo
            .collection('reviews')
            .updateOne(
                { guild_id: guildId },
                {
                    $set: {
                        [`reviews.${userId}.${authorId}`]: {
                            message_url,
                            review,
                            rating,
                            timestamp: new Date(),
                        },
                    },
                },
                { upsert: true },
            );
    }

}
