import { SlashCommandBuilder } from "discord.js";

const cmd = new SlashCommandBuilder()
        .setName("ping")
        .setDescription("respond with pong");

module.exports = {
        data: cmd,
        async execute(interaction: any) {
                await interaction.reply("pong");
        },
};

