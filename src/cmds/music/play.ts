import { ChatInputCommandInteraction, Collection, Colors, SlashCommandBuilder, VoiceChannel } from "discord.js";
import { AudioPlayerError, AudioPlayerStatus, NoSubscriberBehavior, createAudioPlayer, createAudioResource, joinVoiceChannel } from "@discordjs/voice";
import { createReadStream, createWriteStream } from "fs";
import play, { SpotifyAlbum, SpotifyPlaylist, SpotifyTrack, spotify } from 'play-dl'
import { EmbedBuilder } from "@discordjs/builders";


const nathanFace = "https://wompampsupport.azureedge.net/fetchimage?siteId=7575&v=2&jpgQuality=100&width=700&url=https%3A%2F%2Fi.kym-cdn.com%2Fphotos%2Fimages%2Fnewsfeed%2F002%2F322%2F154%2F667.jpg"
const cmd = new SlashCommandBuilder()
        .setName("play")
        .addStringOption(option => option.setName("song").setDescription("name or link of song").setRequired(true))
        .addNumberOption(option => option.setName("position").setDescription("the position to place this song; default is last").setRequired(false))
        .setDescription("plays a song");

module.exports = {
        data: cmd,
        async execute(interaction: ChatInputCommandInteraction) {
                const { user, guild, client } = interaction;
                const member = guild?.members.cache.get(user.id);
                const channelId = member?.voice.channelId;
                const channel = await guild?.channels.fetch(channelId!)
                let url = interaction.options.getString("song", true);
                let position = interaction.options.getNumber("position");
                let title = "";
                let ytChannelName = "";
                let ytChannelAvatar = "";
                let ytChannelLink = "";
                let thumbnail = "";
                let duration = "";
                const isLink = url.slice(0, 5) === "https" || url.slice(8, 11) === "www"
                const isYtPlaylist = url.slice(12, 32) === "youtube.com/playlist"
                const isSpotify = url.slice(8, 20) === "open.spotify" && play.sp_validate(url);
                const fetchSong = async (song: string) => {
                        let search;
                        let param;
                        if (isLink && !isSpotify) {
                                if (!play.yt_validate) {
                                        await interaction.editReply("Not a valid link")
                                        return;
                                }
                                const link = new URL(song);
                                const searchParams = new URLSearchParams(link.search)
                                param = searchParams.get('v') || url.split('.be/')[1]
                        }
                        search = await play.search(song, { source: { youtube: 'video' }, limit: 1 })

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
                } else if (!(channel as VoiceChannel)?.joinable) {
                        // if bot cannot join user's channel
                        await interaction.reply(`Cannot join #${channel?.name} because it does not have permission`)
                        return
                }


                const queueEmbed = new EmbedBuilder()
                        .setTitle(`Enqued track: ${url}`)
                        .setColor(Colors.DarkOrange)
                interaction.channel?.send({ embeds: [queueEmbed] })
                await interaction.deferReply()
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
                        await interaction.editReply("ok")
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
                                videos.map(async (video, index) => {
                                        const resource = await fetchSong(video.url)
                                        client.queue.set(`${index}:${video.url}`, {
                                                resource,
                                                url,
                                                title,
                                                ytChannelName,
                                                ytChannelAvatar,
                                                ytChannelLink,
                                                thumbnail,
                                                duration,
                                                requestee: user

                                        });
                                })
                        } else if (isSpotify) {
                                if (play.is_expired()) {
                                        await play.refreshToken();
                                }
                                if (!play.sp_validate(url)) {
                                        await interaction.editReply("Not a valid link");
                                        return;
                                }
                                const spotifyUrl = new URL(url);
                                const spData = await play.spotify(url)
                                let { pathname } = spotifyUrl;
                                pathname = pathname.split('/')[1]
                                if (pathname === 'playlist') {
                                        const search: SpotifyPlaylist[] = await play.search(spData.name, {
                                                source: {
                                                        spotify: pathname as 'playlist'
                                                }, limit: 1
                                        });
                                        const tracks = await search[0].all_tracks();
                                        tracks.map(async (track, index) => {
                                                const qs = await play.search(`${track.name}`, { limit: 1, source: { youtube: 'video' } })
                                                const stream = await play.stream(qs[0].url)
                                                const resource = createAudioResource(stream.stream, { inputType: stream.type })
                                                duration = `${Math.floor(track.durationInSec / 60)}: ${track.durationInSec % 60}`
                                                client.queue.set(`${index}:${track.url}`, {
                                                        resource,
                                                        url: track.url,
                                                        title: track.name,
                                                        ytChannelName: track.artists.map((artist) => artist.name).join(" • "),
                                                        ytChannelAvatar: nathanFace,
                                                        ytChannelLink: track.artists[0].url,
                                                        thumbnail: track.thumbnail?.url,
                                                        duration,
                                                        requestee: user
                                                });
                                        })
                                } else if (pathname === 'track') {
                                        const search: SpotifyTrack[] = await play.search(spData.name, {
                                                source: {
                                                        spotify: pathname as 'track'
                                                }, limit: 1
                                        });
                                        const qs = await play.search(`${search[0].name}`, { limit: 1, source: { youtube: 'video' } })
                                        const stream = await play.stream(qs[0].url)
                                        const resource = createAudioResource(stream.stream, { inputType: stream.type })
                                        const queueNumber = Array.from(client.queue.keys()).length
                                        client.queue.set(`${queueNumber}:${url}`, {
                                                resource,
                                                url: search[0].url,
                                                title: search[0].name,
                                                ytChannelName: search[0].artists.map((artist) => artist.name).join(" • "),
                                                ytChannelAvatar: nathanFace,
                                                ytChannelLink: search[0].artists[0].url,
                                                thumbnail: search[0].thumbnail?.url,
                                                duration,
                                                requestee: user
                                        });

                                } else if (pathname === 'album') {
                                        const search: SpotifyAlbum[] = await play.search(spData.name, {
                                                source: {
                                                        spotify: pathname as 'album'
                                                }, limit: 1
                                        });
                                        const tracks = await search[0].all_tracks();
                                        tracks.map(async (track, index) => {
                                                const qs = await play.search(`${track.name}`, { limit: 1, source: { youtube: 'video' } })
                                                const stream = await play.stream(qs[0].url)
                                                const resource = createAudioResource(stream.stream, { inputType: stream.type })
                                                duration = `${Math.floor(track.durationInSec / 60)}: ${track.durationInSec % 60}`
                                                client.queue.set(`${index}:${track.url}`, {
                                                        resource,
                                                        url: track.url,
                                                        title: track.name,
                                                        ytChannelName: track.artists.map((artist) => artist.name).join(" • "),
                                                        ytChannelAvatar: nathanFace,
                                                        ytChannelLink: track.artists[0].url,
                                                        thumbnail: track.thumbnail?.url,
                                                        duration,
                                                        requestee: user
                                                });
                                        })
                                }
                        } else {
                                const resource = await fetchSong(url);
                                if (resource === null) {
                                        await interaction.editReply("Error finding song, try again")
                                        return;
                                }
                                const queueNumber = Array.from(client.queue.keys()).length
                                position = position ? position - 1 : queueNumber
                                const values = [];
                                if (position < queueNumber && 0 < position) {
                                        for (let i = 0; i < position; i++) {
                                                let key = client.queue.keyAt(i);
                                                let value = client.queue.get(key);
                                                values.push([`${i}:${key.split(":")[1]}`, value]);
                                        }
                                }
                                values.push([`${position}:${url}`, {
                                        resource,
                                        url,
                                        title,
                                        ytChannelName,
                                        ytChannelAvatar,
                                        ytChannelLink,
                                        thumbnail,
                                        duration,
                                        requestee: user
                                }])
                                if (position < queueNumber && 0 < position) {
                                        for (let i = position; i < queueNumber; i++) {
                                                let key = client.queue.keyAt(i);
                                                let value = client.queue.get(key);
                                                values.push([`${i + 1}:${key.split(":")[1]}`, value]);
                                        }
                                }
                                if (position < queueNumber && 0 < position) {
                                        const newQ = new Collection();
                                        values.map((value) => {
                                                newQ.set(value[0], value[1])
                                        })
                                        client.queue = newQ;
                                } else {
                                        values.map((value) => {
                                                client.queue.set(value[0], value[1])
                                        })
                                }

                                const key = client.queue.keyAt(0);
                                const currentResource = client.queue.get(key);
                                // TODO
                                if (currentResource.resource.started === true) {
                                        return;
                                }

                                audioPlayer.play(currentResource.resource);
                                const subscription = connection.subscribe(audioPlayer)
                        }
                } else {
                        interaction.editReply("ok")
                        client.queue = new Collection();
                        client.player = audioPlayer;
                        const resource = await fetchSong(url);
                        if (resource === null) {
                                await interaction.editReply("Error finding song, try again")
                                return;
                        }
                        client.queue.set(`0:${url}`, {
                                resource,
                                url,
                                title,
                                ytChannelName,
                                ytChannelAvatar,
                                ytChannelLink,
                                thumbnail,
                                duration,
                                requestee: user
                        });

                        const key = client.queue.keyAt(0);
                        const nextResource = client.queue.get(key);

                        audioPlayer.play(nextResource.resource);
                        const subscription = connection.subscribe(audioPlayer);
                }




                audioPlayer.on(AudioPlayerStatus.Idle, async () => {
                        const key = client.queue.keyAt(0);
                        const nextKey = client.queue.keyAt(1);
                        client.queue.delete(key)
                        if (!nextKey) {
                                // do nothing, be on standby
                                // check if current resource is finished playing
                                return;
                        }
                        const nextResource = client.queue.get(nextKey);
                        audioPlayer.play(nextResource.resource);

                        const subscription = connection.subscribe(audioPlayer);
                });


                audioPlayer.on(AudioPlayerStatus.Playing, async () => {
                        const key = client.queue.keyAt(0);
                        const resource = client.queue.get(key)
                        const reply = new EmbedBuilder()
                                .setTitle(resource.title)
                                .setURL(resource.url)
                                .setDescription('`[0:00 / ' + resource.duration + ']`')
                                .setAuthor({
                                        iconURL: resource.ytChannelAvatar,
                                        name: resource.ytChannelName,
                                        url: resource.ytChannelLink
                                })
                                .setFooter({
                                        iconURL: resource.requestee.displayAvatarURL() || resource.requestee.defaultAvatarURL,
                                        text: `Requested by: ${resource.requestee.username}`
                                })
                                .setTimestamp(Date.now())
                                .setImage(resource.thumbnail)
                                .setColor(Colors.Blurple)
                        interaction.channel?.send({ embeds: [reply] })
                });

                audioPlayer.on("error", async (error) => {
                        await interaction.editReply(`Something went wrong! ${error.message} with track: ${(error.resource.metadata as any).title}`)

                })

        }
}
