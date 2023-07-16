"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const voice_1 = require("@discordjs/voice");
const play_dl_1 = __importDefault(require("play-dl"));
const builders_1 = require("@discordjs/builders");
function debounce(f, timeout = (1000 * 60 * 3)) {
    let timer;
    return (...args) => {
        if (!timer) {
            f.apply(this, args);
        }
        clearTimeout(timer);
        timer = setTimeout(() => {
            timer = undefined;
        }, timeout);
    };
}
const nathanFace = "https://wompampsupport.azureedge.net/fetchimage?siteId=7575&v=2&jpgQuality=100&width=700&url=https%3A%2F%2Fi.kym-cdn.com%2Fphotos%2Fimages%2Fnewsfeed%2F002%2F322%2F154%2F667.jpg";
const cmd = new discord_js_1.SlashCommandBuilder()
    .setName("play")
    .addStringOption(option => option.setName("song").setDescription("name or link of song").setRequired(true))
    .addNumberOption(option => option.setName("position").setDescription("the position to place this song; default is last").setRequired(false))
    .setDescription("plays a song");
module.exports = {
    data: cmd,
    execute(interaction) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const { user, guild, client } = interaction;
            const member = guild === null || guild === void 0 ? void 0 : guild.members.cache.get(user.id);
            const channelId = member === null || member === void 0 ? void 0 : member.voice.channelId;
            const channel = yield (guild === null || guild === void 0 ? void 0 : guild.channels.fetch(channelId));
            let url = interaction.options.getString("song", true);
            let position = interaction.options.getNumber("position");
            let title = "";
            let ytChannelName = "";
            let ytChannelAvatar = "";
            let ytChannelLink = "";
            let thumbnail = "";
            let duration = "";
            const isLink = url.slice(0, 5) === "https" || url.slice(8, 11) === "www";
            const isYtPlaylist = url.slice(12, 32) === "youtube.com/playlist";
            const isSpotify = url.slice(8, 20) === "open.spotify" && play_dl_1.default.sp_validate(url);
            const fetchSong = (song) => __awaiter(this, void 0, void 0, function* () {
                var _c, _d, _e;
                let search;
                let param;
                // is link (not search query) and is not a spotify link
                if (isLink && !isSpotify) {
                    if (!play_dl_1.default.yt_validate) {
                        yield interaction.editReply("Not a valid link");
                        return;
                    }
                    const link = new URL(song);
                    const searchParams = new URLSearchParams(link.search);
                    // get video id
                    param = searchParams.get('v') || url.split('.be/')[1];
                }
                search = yield play_dl_1.default.search(song, { source: { youtube: 'video' }, limit: 1 });
                url = search[0].url;
                title = search[0].title || "packgod stole your hair";
                ytChannelName = ((_c = search[0].channel) === null || _c === void 0 ? void 0 : _c.name) || "alinity mom";
                ytChannelAvatar = ((_d = search[0].channel) === null || _d === void 0 ? void 0 : _d.iconURL()) || nathanFace;
                ytChannelLink = ((_e = search[0].channel) === null || _e === void 0 ? void 0 : _e.url) || "https://youtu.be/X-CC7rfO2us";
                thumbnail = search[0].thumbnails[0].url;
                duration = search[0].durationRaw;
                //spare my storage
                let [hours, minutes, seconds = -1] = duration.split(':').map((time) => parseInt(time));
                if (seconds < 0) {
                    //check minutes because hours will be in the minutes section place
                    if (hours >= 10) {
                        yield interaction.editReply("dont send a video over 10 minutes");
                        return null;
                    }
                }
                else {
                    //that means duration has hour has a number, erdaciate their suggestion
                    yield interaction.editReply("dont sending a video over an hour");
                    return null;
                }
                let stream = yield play_dl_1.default.stream(url);
                const resource = (0, voice_1.createAudioResource)(stream.stream, { inputType: stream.type });
                return resource;
            });
            // if user is not in channel
            if (!channelId) {
                yield interaction.reply(`${user.username} please join a channel first`);
                return;
            }
            else if (!(channel === null || channel === void 0 ? void 0 : channel.joinable)) {
                // if bot cannot join user's channel
                yield interaction.reply(`Cannot join #${channel === null || channel === void 0 ? void 0 : channel.name} because it does not have permission`);
                return;
            }
            const queueEmbed = new builders_1.EmbedBuilder()
                .setTitle(`Enqued track: ${url}`)
                .setColor(discord_js_1.Colors.DarkOrange);
            (_a = interaction.channel) === null || _a === void 0 ? void 0 : _a.send({ embeds: [queueEmbed] });
            yield interaction.deferReply();
            if (!client.player) {
                client.player = (0, voice_1.createAudioPlayer)({
                    behaviors: {
                        noSubscriber: voice_1.NoSubscriberBehavior.Play
                    }
                });
            }
            // if someone plays command while bot is already in channel
            let connection;
            const memberClient = guild === null || guild === void 0 ? void 0 : guild.members.cache.get(client.user.id);
            if (memberClient === null || memberClient === void 0 ? void 0 : memberClient.voice.channel) {
                yield interaction.editReply("ok");
                if (!client.queue) {
                    client.queue = new discord_js_1.Collection();
                }
                connection = (0, voice_1.joinVoiceChannel)({
                    channelId,
                    guildId: interaction.guildId,
                    adapterCreator: guild === null || guild === void 0 ? void 0 : guild.voiceAdapterCreator
                });
                if (isYtPlaylist) {
                    const playlist = yield play_dl_1.default.playlist_info(url, { incomplete: true });
                    const videos = yield playlist.all_videos();
                    videos.map((video, index) => __awaiter(this, void 0, void 0, function* () {
                        const resource = yield fetchSong(video.url);
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
                    }));
                }
                else if (isSpotify) {
                    if (play_dl_1.default.is_expired()) {
                        yield play_dl_1.default.refreshToken();
                    }
                    if (!play_dl_1.default.sp_validate(url)) {
                        yield interaction.editReply("Not a valid link");
                        return;
                    }
                    const spotifyUrl = new URL(url);
                    const spData = yield play_dl_1.default.spotify(url);
                    let { pathname } = spotifyUrl;
                    pathname = pathname.split('/')[1];
                    if (pathname === 'playlist') {
                        const search = yield play_dl_1.default.search(spData.name, {
                            source: {
                                spotify: pathname
                            }, limit: 1
                        });
                        const tracks = yield search[0].all_tracks();
                        tracks.map((track, index) => __awaiter(this, void 0, void 0, function* () {
                            var _f;
                            const qs = yield play_dl_1.default.search(`${track.name}`, { limit: 1, source: { youtube: 'video' } });
                            const stream = yield play_dl_1.default.stream(qs[0].url);
                            const resource = (0, voice_1.createAudioResource)(stream.stream, { inputType: stream.type });
                            duration = `${Math.floor(track.durationInSec / 60)}: ${track.durationInSec % 60}`;
                            client.queue.set(`${index}:${track.url}`, {
                                resource,
                                url: track.url,
                                title: track.name,
                                ytChannelName: track.artists.map((artist) => artist.name).join(" • "),
                                ytChannelAvatar: nathanFace,
                                ytChannelLink: track.artists[0].url,
                                thumbnail: (_f = track.thumbnail) === null || _f === void 0 ? void 0 : _f.url,
                                duration,
                                requestee: user
                            });
                        }));
                    }
                    else if (pathname === 'track') {
                        const search = yield play_dl_1.default.search(spData.name, {
                            source: {
                                spotify: pathname
                            }, limit: 1
                        });
                        const qs = yield play_dl_1.default.search(`${search[0].name}`, { limit: 1, source: { youtube: 'video' } });
                        const stream = yield play_dl_1.default.stream(qs[0].url);
                        const resource = (0, voice_1.createAudioResource)(stream.stream, { inputType: stream.type });
                        const queueNumber = Array.from(client.queue.keys()).length;
                        client.queue.set(`${queueNumber}:${url}`, {
                            resource,
                            url: search[0].url,
                            title: search[0].name,
                            ytChannelName: search[0].artists.map((artist) => artist.name).join(" • "),
                            ytChannelAvatar: nathanFace,
                            ytChannelLink: search[0].artists[0].url,
                            thumbnail: (_b = search[0].thumbnail) === null || _b === void 0 ? void 0 : _b.url,
                            duration,
                            requestee: user
                        });
                    }
                    else if (pathname === 'album') {
                        const search = yield play_dl_1.default.search(spData.name, {
                            source: {
                                spotify: pathname
                            }, limit: 1
                        });
                        const tracks = yield search[0].all_tracks();
                        tracks.map((track, index) => __awaiter(this, void 0, void 0, function* () {
                            var _g;
                            const qs = yield play_dl_1.default.search(`${track.name}`, { limit: 1, source: { youtube: 'video' } });
                            const stream = yield play_dl_1.default.stream(qs[0].url);
                            const resource = (0, voice_1.createAudioResource)(stream.stream, { inputType: stream.type });
                            duration = `${Math.floor(track.durationInSec / 60)}: ${track.durationInSec % 60}`;
                            client.queue.set(`${index}:${track.url}`, {
                                resource,
                                url: track.url,
                                title: track.name,
                                ytChannelName: track.artists.map((artist) => artist.name).join(" • "),
                                ytChannelAvatar: nathanFace,
                                ytChannelLink: track.artists[0].url,
                                thumbnail: (_g = track.thumbnail) === null || _g === void 0 ? void 0 : _g.url,
                                duration,
                                requestee: user
                            });
                        }));
                    }
                }
                else {
                    const resource = yield fetchSong(url);
                    if (resource === null) {
                        yield interaction.editReply("Error finding song, try again");
                        return;
                    }
                    // rebuild queue
                    const queueNumber = Array.from(client.queue.keys()).length;
                    position = position ? position - 1 : queueNumber;
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
                        }]);
                    if (position < queueNumber && 0 < position) {
                        for (let i = position; i < queueNumber; i++) {
                            let key = client.queue.keyAt(i);
                            let value = client.queue.get(key);
                            values.push([`${i + 1}:${key.split(":")[1]}`, value]);
                        }
                        const newQ = new discord_js_1.Collection();
                        values.map((value) => {
                            newQ.set(value[0], value[1]);
                        });
                        client.queue = newQ;
                    }
                    else {
                        values.map((value) => {
                            client.queue.set(value[0], value[1]);
                        });
                    }
                }
                const key = client.queue.keyAt(0);
                const currentResource = client.queue.get(key);
                // try to play new resource immediately if current resource is not started yet
                if (currentResource.resource.started === true) {
                    return;
                }
                client.player.play(currentResource.resource);
                client.subscription = connection.subscribe(client.player);
            }
            else {
                connection = (0, voice_1.joinVoiceChannel)({
                    channelId,
                    guildId: interaction.guildId,
                    adapterCreator: guild === null || guild === void 0 ? void 0 : guild.voiceAdapterCreator
                });
                yield interaction.editReply("ok");
                client.queue = new discord_js_1.Collection();
                const resource = yield fetchSong(url);
                if (resource === null) {
                    yield interaction.editReply("Error finding song, try again");
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
                client.player.play(nextResource.resource);
                client.subscription = connection.subscribe(client.player);
            }
            client.player.on(voice_1.AudioPlayerStatus.Idle, () => __awaiter(this, void 0, void 0, function* () {
                const key = client.queue.keyAt(0);
                const nextKey = client.queue.keyAt(1);
                client.queue.delete(key);
                if (!nextKey) {
                    // do nothing, be on standby
                    // check if current resource is finished playing
                    function disconnect() {
                        var _a, _b;
                        connection.destroy();
                        client.queue.clear();
                        (_a = client.subscription) === null || _a === void 0 ? void 0 : _a.unsubscribe();
                        (_b = interaction.channel) === null || _b === void 0 ? void 0 : _b.send("Disconnected after 3 minutes of activity");
                    }
                    setTimeout(() => disconnect(), 5 * 60 * 1000);
                    return;
                }
                const nextResource = client.queue.get(nextKey);
                client.player.play(nextResource.resource);
                if (!client.subscription) {
                    client.subscription = connection.subscribe(client.player);
                }
            }));
            client.player.on(voice_1.AudioPlayerStatus.Playing, () => __awaiter(this, void 0, void 0, function* () {
                var _h;
                const key = client.queue.keyAt(0);
                const resource = client.queue.get(key);
                const reply = new builders_1.EmbedBuilder()
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
                    .setColor(discord_js_1.Colors.Blurple);
                (_h = interaction.channel) === null || _h === void 0 ? void 0 : _h.send({ embeds: [reply] });
            }));
            client.player.on("error", (error) => __awaiter(this, void 0, void 0, function* () {
                yield interaction.editReply(`Something went wrong! ${error.message} with track: ${error.resource.metadata.title}`);
            }));
        });
    }
};
