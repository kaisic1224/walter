import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const cmd = new SlashCommandBuilder()
        .setName("pause")
        .setDescription("pause currently playing track");

module.exports = {
        data: cmd,
        async execute(interaction: ChatInputCommandInteraction) {
        }
}
