import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const cmd = new SlashCommandBuilder()
        .setName("pause")
        .setDescription("pause currently playing track");

module.exports = {
        data: cmd,
        async execute(interaction: ChatInputCommandInteraction) {
                const { client } = interaction;

                if (!client.player) {
                        await interaction.reply("no current player")
                        return;
                }
                client.player.pause()
                await interaction.reply("current track paused")
        }
}
