import { EmbedBuilder } from "@discordjs/builders";
import { AudioPlayer } from "@discordjs/voice";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const cmd = new SlashCommandBuilder()
        .setName("unpause")
        .setDescription("skips currently playing song");

module.exports = {
        data: cmd,
        async execute(interaction: ChatInputCommandInteraction) {
                const { client } = interaction;
        }
}
