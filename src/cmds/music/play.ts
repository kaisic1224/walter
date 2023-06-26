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
                const member = guild?.members.cache.get(user.id);
                const channelId = member?.voice.channelId;

                if (!channelId) {
                        await interaction.reply(`${user.username} please join a channel first`);
                        return
                }


                const connection = joinVoiceChannel({
                        channelId,
                        guildId: interaction.guildId!,
                        adapterCreator: interaction.guild?.voiceAdapterCreator!
                })



                await interaction.reply("pong");
        },
};

