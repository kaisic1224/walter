import { EmbedBuilder } from "@discordjs/builders";
import { AudioPlayer } from "@discordjs/voice";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const cmd = new SlashCommandBuilder()
        .setName("remove")
        .addNumberOption((option) => option.setName("position").setDescription("the number to remove").setRequired(true))
        .setDescription("skips currently playing song");

module.exports = {
        data: cmd,
        async execute(interaction: ChatInputCommandInteraction) {
                const { client } = interaction;
        }
}
