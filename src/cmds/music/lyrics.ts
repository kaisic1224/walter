import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const cmd = new SlashCommandBuilder()
        .setName("lyrics")
        .setDescription("get lyrics for currently playing track");

module.exports = {
        data: cmd,
        async execute(interaction: ChatInputCommandInteraction) {
        }
}
