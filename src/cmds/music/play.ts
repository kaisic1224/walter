import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { AudioPlayerStatus, VoiceConnectionStatus, createAudioPlayer, createAudioResource, joinVoiceChannel } from "@discordjs/voice";
import { createWriteStream } from "fs";
import ytdl = require('ytdl-core');

const cmd = new SlashCommandBuilder()
        .setName("play")
        .addStringOption(option => option.setName("song").setDescription("haha").setRequired(true))
        .setDescription("plays a song");

module.exports = {
        data: cmd,
        async execute(interaction: ChatInputCommandInteraction) {
                const user = interaction.user;
                const guild = interaction.guild;
                const member = guild?.members.cache.get(user.id);
                const channelId = member?.voice.channelId;
                const url = interaction.options.getString("song", true);
                const isLink = url.slice(0, 4) === "https" || url.slice(8, 10) === "www";

                console.log(url)

                if (!channelId) {
                        await interaction.reply(`${user.username} please join a channel first`);
                        return
                }
                //else if (!member?.voice.channel?.joinable) {
                //        await interaction.reply(`Cannot join ${member?.voice.channel?.name} because it does not have permission`)
                //        return
                //}

                const connection = joinVoiceChannel({
                        channelId,
                        guildId: interaction.guildId!,
                        adapterCreator: interaction.guild?.voiceAdapterCreator!
                })

                connection.on(VoiceConnectionStatus.Ready, async (oldState, newState) => {
                        console.log(`${interaction.client.user.tag} is ready to start playing music`)
                        const audioPlayer = createAudioPlayer();

                        if (isLink) {
                                await interaction.reply("is not a song link cock moment")
                                return;
                        }

                        const videoId = ytdl.getURLVideoID(url);
                        const info = await ytdl.getInfo(videoId);
                        const formats = ytdl.filterFormats(info.formats, 'audioonly');
                        const song = ytdl(url, { format: formats[0] }).pipe(createWriteStream('video.mp3'))
                        song.on('finish', () => {
                                const resource = createAudioResource('./video.mp3')
                                audioPlayer.play(resource)

                                const subscription = connection.subscribe(audioPlayer);

                                audioPlayer.on(AudioPlayerStatus.Playing, () => {
                                        console.log('The audio player has started playing!');
                                });
                        })


                })
                await interaction.reply("pong");
        },
};

