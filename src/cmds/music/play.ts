import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { joinVoiceChannel } from "@discordjs/voice";

const cmd = new SlashCommandBuilder()
        .setName("play")
        .setDescription("plays a song");

module.exports = {
        data: cmd,
        async execute(interaction: ChatInputCommandInteraction) {
                const user = interaction.user;
                const guild = interaction.guild;
                const connection = joinVoiceChannel({
                        channelId: "800080123536736360",
                        guildId: interaction.guildId!,
                        adapterCreator: interaction.guild?.voiceAdapterCreator!
                })



                await interaction.reply("pong");
        },
};

