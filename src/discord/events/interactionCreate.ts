import type { Interaction } from 'discord.js';

import type ReviewBot from '../reviewBot';

export default class {
    client: ReviewBot;
    constructor(client: ReviewBot) {
        this.client = client;
    }

    async run(interaction: Interaction) {
        if (interaction.isCommand()) {
            const command = this.client.commands.get(interaction.commandName);
            if (!command) return;

            if (!command.opts.enabled) {
                return interaction.reply({
                    content: 'This command is currently disabled.',
                    ephemeral: true,
                });
            }

            return command.execute(interaction);
        } else if (interaction.isAutocomplete()) {
            const command = this.client.commands.get(interaction.commandName);
            if (!command) return;
            return command.autocomplete(interaction);
        }
    }
}
