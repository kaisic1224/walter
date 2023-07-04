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
const ytsr = require("ytsr");
const builders_1 = require("@discordjs/builders");
const audioFormats = [
    139,
    233,
    234,
    249,
    250,
    140,
    251
];
const cmd = new discord_js_1.SlashCommandBuilder()
    .setName("play")
    .addStringOption(option => option.setName("song").setDescription("haha").setRequired(true))
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
            const queue = new discord_js_1.Collection();
            let url = interaction.options.getString("song", true);
            let title = "";
            let ytChannelName = "";
            let ytChannelAvatar = "";
            let ytChannelLink = "";
            let thumbnail = "";
            let duration = "";
            const fetchSong = (song) => __awaiter(this, void 0, void 0, function* () {
                var _c, _d, _e, _f, _g;
                const filters1 = yield ytsr.getFilters(song);
                const filter1 = (_c = filters1.get('Type')) === null || _c === void 0 ? void 0 : _c.get('Video');
                const opts = {
                    limit: 1
                };
                const search = yield ytsr(filter1.url, opts);
                console.log(search);
                url = search.items[0].url;
                title = search.items[0].title;
                ytChannelName = (_d = search.items[0].author) === null || _d === void 0 ? void 0 : _d.name;
                ytChannelAvatar = (_e = search.items[0].author) === null || _e === void 0 ? void 0 : _e.bestAvatar.url;
                ytChannelLink = (_f = search.items[0].author) === null || _f === void 0 ? void 0 : _f.url;
                thumbnail = (_g = search.items[0].bestThumbnail) === null || _g === void 0 ? void 0 : _g.url;
                duration = search.items[0].duration;
                //spare my storage
                let [hours, minutes, seconds = -1] = duration.split(':').map((time) => parseInt(time));
                if (seconds < 0) {
                    //check minutes because hours will be in the minutes section place
                    if (hours >= 10) {
                        yield interaction.editReply("dont send a video over 10 minutes");
                        return;
                    }
                }
                else {
                    //that means duration has hour has a number, erdaciate their suggestion
                    yield interaction.editReply("dont sending a video over an hour");
                    return;
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
            yield interaction.reply({ embeds: [queueEmbed] });
            const audioPlayer = (0, voice_1.createAudioPlayer)({
                behaviors: {
                    noSubscriber: voice_1.NoSubscriberBehavior.Play
                }
            });
            const connection = (0, voice_1.joinVoiceChannel)({
                channelId,
                guildId: interaction.guildId,
                adapterCreator: (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.voiceAdapterCreator
            });
            const memberClient = guild === null || guild === void 0 ? void 0 : guild.members.cache.get(client.user.id);
            // if someone plays command while bot is already in channel
            if (memberClient === null || memberClient === void 0 ? void 0 : memberClient.voice.channel) {
                if (!client.queue) {
                    client.queue = new discord_js_1.Collection();
                }
                const { channelId } = memberClient === null || memberClient === void 0 ? void 0 : memberClient.voice;
                const connection = (0, voice_1.joinVoiceChannel)({
                    channelId: channelId,
                    guildId: interaction.guildId,
                    adapterCreator: (_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.voiceAdapterCreator
                });
                const resource = yield fetchSong(url);
                client.queue.set(url, resource);
                const key = client.queue.keyAt(0);
                const nextResource = client.queue.get(key);
                // TODO
                console.log(nextResource.started);
                if (nextResource.started) {
                    console.log(client.queue);
                    return;
                }
                audioPlayer.play(nextResource);
                const subscription = connection.subscribe(audioPlayer);
            }
            else {
                client.queue = new discord_js_1.Collection();
                const resource = yield fetchSong(url);
                client.queue.set(url, resource);
                const key = client.queue.keyAt(0);
                const nextResource = client.queue.get(key);
                audioPlayer.play(nextResource);
                const subscription = connection.subscribe(audioPlayer);
            }
            audioPlayer.on(voice_1.AudioPlayerStatus.Idle, () => __awaiter(this, void 0, void 0, function* () {
                if (Array.from(client.queue.keys()).length <= 1) {
                    // do nothing, be on standby
                    return;
                }
                const key = client.queue.keyAt(0);
                const nextKey = client.queue.keyAt(1);
                const nextResource = client.queue.get(nextKey);
                audioPlayer.play(nextResource);
                client.queue.delete(key);
                const subscription = connection.subscribe(audioPlayer);
            }));
            audioPlayer.on(voice_1.AudioPlayerStatus.Playing, () => __awaiter(this, void 0, void 0, function* () {
                var _h;
                console.log('The audio player has started playing!');
                const reply = new builders_1.EmbedBuilder()
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
                    .setColor(discord_js_1.Colors.Blurple);
                (_h = interaction.channel) === null || _h === void 0 ? void 0 : _h.send({ embeds: [reply] });
                // await interaction.editReply({ embeds: [reply], options: { ephemeral: false } })
            }));
        });
    }
};
