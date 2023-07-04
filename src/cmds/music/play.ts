import { ChatInputCommandInteraction, Collection, Colors, SlashCommandBuilder } from "discord.js";
import { AudioPlayerStatus, AudioResource, NoSubscriberBehavior, StreamType, VoiceConnectionStatus, createAudioPlayer, createAudioResource, demuxProbe, joinVoiceChannel } from "@discordjs/voice";
import { createReadStream, createWriteStream } from "fs";
import play from 'play-dl'
import ytsr = require('ytsr')
import { EmbedBuilder } from "@discordjs/builders";


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
                const queue = new Collection();
                let url = interaction.options.getString("song", true);
                let title = "";
                let ytChannelName = "";
                let ytChannelAvatar = "";
                let ytChannelLink = "";
                let thumbnail = "";
                let duration = "";
                const fetchSong = async (song: string) => {
                        const filters1 = await ytsr.getFilters(song)
                        const filter1 = filters1.get('Type')?.get('Video')
                        const opts = {
                                limit: 1
                        };
                        if (!filter1.url) {
                                console.log(filter1)
                        }
                        const search = await ytsr(filter1?.url!, opts)
                        console.log(search)

                        url = search.items[0].url;
                        title = search.items[0].title;
                        ytChannelName = search.items[0].author?.name
                        ytChannelAvatar = search.items[0].author?.bestAvatar.url
                        ytChannelLink = search.items[0].author?.url
                        thumbnail = search.items[0].bestThumbnail?.url
                        duration = search.items[0].duration;

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
                        }
                        const { channelId } = memberClient?.voice;
                        const connection = joinVoiceChannel({
                                channelId: channelId!,
                                guildId: interaction.guildId!,
                                adapterCreator: interaction.guild?.voiceAdapterCreator!
                        });
                        const resource = await fetchSong(url);
                        client.queue.set(url, resource);

                        const key = client.queue.keyAt(0);
                        const nextResource = client.queue.get(key);
                        // TODO
                        console.log(nextResource.started)
                        if (nextResource.started) {
                                console.log(client.queue)
                                return;
                        }

                        audioPlayer.play(nextResource);

                        const subscription = connection.subscribe(audioPlayer);

                } else {
                        client.queue = new Collection();
                        const resource = await fetchSong(url);
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

                        audioPlayer.play(nextResource);
                        client.queue.delete(key)

                        const subscription = connection.subscribe(audioPlayer);
                });
                audioPlayer.on(AudioPlayerStatus.Playing, async () => {
                        console.log('The audio player has started playing!');
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
