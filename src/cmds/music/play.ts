import { ChatInputCommandInteraction, Collection, Colors, SlashCommandBuilder } from "discord.js";
import { AudioPlayerStatus, AudioResource, NoSubscriberBehavior, StreamType, VoiceConnectionStatus, createAudioPlayer, createAudioResource, demuxProbe, joinVoiceChannel } from "@discordjs/voice";
import { createReadStream, createWriteStream } from "fs";
import play, { playlist_info } from 'play-dl'
import ytsr = require('ytsr')
import { EmbedBuilder } from "@discordjs/builders";


const nathanFace = "https://wompampsupport.azureedge.net/fetchimage?siteId=7575&v=2&jpgQuality=100&width=700&url=https%3A%2F%2Fi.kym-cdn.com%2Fphotos%2Fimages%2Fnewsfeed%2F002%2F322%2F154%2F667.jpg"
const audioFormats = [
        139,
        233,
        234,
        249,
        250,
        140,
        251
]

const cmd = new SlashCommandBuilder()
        .setName("play")
        .addStringOption(option => option.setName("song").setDescription("haha").setRequired(true))
        .setDescription("plays a song");



module.exports = {
        data: cmd,
        async execute(interaction: ChatInputCommandInteraction) {
                const { user, guild, client } = interaction;
                const member = guild?.members.cache.get(user.id);
                const channelId = member?.voice.channelId;
                const channel = await guild?.channels.fetch(channelId!)
                let url = interaction.options.getString("song", true);
                let title = "";
                let ytChannelName = "";
                let ytChannelAvatar = "";
                let ytChannelLink = "";
                let thumbnail = "";
                let duration = "";
                const isLink = url.slice(0, 5) === "https" || url.slice(8, 11) === "www"
                const isYtPlaylist = url.slice(12, 32) === "youtube.com/playlist"
                const isSpotify = url.slice(8, 20) === "open.spotify";
                const fetchSong = async (song: string) => {
                        if (isSpotify) return

                        let search;
                        let param;
                        if (isLink && !isSpotify) {
                                const link = new URL(song);
                                const searchParams = new URLSearchParams(link.search)
                                param = searchParams.get('v') || url.split('.be/')[1]
                        }
                        search = await play.search(song, { source: { youtube: 'video' }, limit: 1 })
                        console.log(search[0])

                        url = search[0].url;
                        title = search[0].title || "packgod stole your hair";
                        ytChannelName = search[0].channel?.name || "alinity mom";
                        ytChannelAvatar = search[0].channel?.iconURL() || nathanFace;
                        ytChannelLink = search[0].channel?.url || "https://youtu.be/X-CC7rfO2us"
                        thumbnail = search[0].thumbnails[0].url
                        duration = search[0].durationRaw;

                        //spare my storage
                        let [hours, minutes, seconds = -1] = duration.split(':').map((time) => parseInt(time))
                        if (seconds < 0) {
                                //check minutes because hours will be in the minutes section place
                                if (hours >= 10) {
                                        await interaction.editReply("dont send a video over 10 minutes")
                                        return;
                                }
                        } else {
                                //that means duration has hour has a number, erdaciate their suggestion
                                await interaction.editReply("dont sending a video over an hour")
                                return;
                        }

                        let stream = await play.stream(url)
                        const resource = createAudioResource(stream.stream, { inputType: stream.type })
                        return resource;
                }


                // if user is not in channel
                if (!channelId) {
                        await interaction.reply(`${user.username} please join a channel first`);
                        return
                } else if (!channel?.joinable) {
                        // if bot cannot join user's channel
                        await interaction.reply(`Cannot join #${channel?.name} because it does not have permission`)
                        return
                }

                const queueEmbed = new EmbedBuilder()
                        .setTitle(`Enqued track: ${url}`)
                        .setColor(Colors.DarkOrange)
                await interaction.reply({ embeds: [queueEmbed] })
                const audioPlayer = createAudioPlayer({
                        behaviors: {
                                noSubscriber: NoSubscriberBehavior.Play
                        }
                });
                const connection = joinVoiceChannel({
                        channelId,
                        guildId: interaction.guildId!,
                        adapterCreator: interaction.guild?.voiceAdapterCreator!
                })

                const memberClient = guild?.members.cache.get(client.user.id)
                // if someone plays command while bot is already in channel
                if (memberClient?.voice.channel) {
                        if (!client.queue) {
                                client.queue = new Collection();
                                client.player = audioPlayer;
                        }
                        const { channelId } = memberClient?.voice;
                        const connection = joinVoiceChannel({
                                channelId: channelId!,
                                guildId: interaction.guildId!,
                                adapterCreator: interaction.guild?.voiceAdapterCreator!
                        });

                        if (isYtPlaylist) {
                                const playlist = await play.playlist_info(url, { incomplete: true });
                                const videos = await playlist.all_videos();
                                videos.map(async (video) => {
                                        const resource = await fetchSong(video.url)
                                        client.queue.set(video.url, resource);
                                })
                        } else {
                                const resource = await fetchSong(url);
                                if (resource === null) {
                                        await interaction.editReply("Error finding song, try again")
                                        return;
                                }
                                client.queue.set(url, resource);
                        }

                        const key = client.queue.keyAt(0);
                        const nextResource = client.queue.get(key);
                        // TODO
                        if (nextResource.started) {
                                return;
                        }

                        audioPlayer.play(nextResource);

                        const subscription = connection.subscribe(audioPlayer);

                } else {
                        client.queue = new Collection();
                        client.player = audioPlayer;
                        const resource = await fetchSong(url);
                        if (resource === null) {
                                await interaction.editReply("Error finding song, try again")
                                return;
                        }
                        client.queue.set(url, resource);

                        const key = client.queue.keyAt(0);
                        const nextResource = client.queue.get(key);

                        audioPlayer.play(nextResource);

                        const subscription = connection.subscribe(audioPlayer);
                }




                audioPlayer.on(AudioPlayerStatus.Idle, async () => {
                        const key = client.queue.keyAt(0);
                        const currentResource = client.queue.get(key)
                        if (Array.from(client.queue.keys()).length <= 1) {
                                // do nothing, be on standby
                                // check if current resource is finished playing
                                if (currentResource.ended) {
                                        client.queue.delete(key)
                                }
                                return;
                        }
                        const nextKey = client.queue.keyAt(1);
                        const nextResource = client.queue.get(nextKey);

                        client.queue.delete(key)
                        audioPlayer.play(nextResource);

                        const subscription = connection.subscribe(audioPlayer);
                });
                audioPlayer.on(AudioPlayerStatus.Playing, async () => {
                        console.log('The audio player has started playing!');
                        const key = client.queue.keyAt(0);
                        await fetchSong(key)
                        const reply = new EmbedBuilder()
                                .setTitle(title)
                                .setURL(url)
                                .setDescription('`[0:00  /  ' + duration + ']`')
                                .setAuthor({
                                        iconURL: ytChannelAvatar,
                                        name: ytChannelName,
                                        url: ytChannelLink
                                })
                                .setTimestamp(Date.now())
                                .setImage(thumbnail)
                                .setColor(Colors.Blurple)
                        interaction.channel?.send({ embeds: [reply] })


                        // await interaction.editReply({ embeds: [reply], options: { ephemeral: false } })
                });

        }
}
