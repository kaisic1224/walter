import { EmbedBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const cmd = new SlashCommandBuilder()
        .setName("q")
        .setDescription("get info abt currently playing track");

module.exports = {
        data: cmd,
        async execute(interaction: ChatInputCommandInteraction) {
                console.log(interaction.client.currentSong)
                const embed = new EmbedBuilder()
                await interaction.reply({ embeds: [embed] })
        }
}
