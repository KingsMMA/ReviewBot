import type ReviewBot from '../reviewBot';

export default class {
    client: ReviewBot;

    constructor(client: ReviewBot) {
        this.client = client;
    }

    run() {
        console.info(`Successfully logged in! \nSession Details: id=${this.client.user?.id} tag=${this.client.user?.tag}`);
    }
}
