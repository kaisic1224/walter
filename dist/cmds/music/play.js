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
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const voice_1 = require("@discordjs/voice");
const fs_1 = require("fs");
const ytdl = require("ytdl-core");
const cmd = new discord_js_1.SlashCommandBuilder()
    .setName("play")
    .addStringOption(option => option.setName("song").setDescription("haha").setRequired(true))
    .setDescription("plays a song");
module.exports = {
    data: cmd,
    execute(interaction) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const user = interaction.user;
            const guild = interaction.guild;
            const member = guild === null || guild === void 0 ? void 0 : guild.members.cache.get(user.id);
            const channelId = member === null || member === void 0 ? void 0 : member.voice.channelId;
            const url = interaction.options.getString("song", true);
            const isLink = url.slice(0, 4) === "https" || url.slice(8, 10) === "www";
            console.log(url);
            if (!channelId) {
                yield interaction.reply(`${user.username} please join a channel first`);
                return;
            }
            //else if (!member?.voice.channel?.joinable) {
            //        await interaction.reply(`Cannot join ${member?.voice.channel?.name} because it does not have permission`)
            //        return
            //}
            const connection = (0, voice_1.joinVoiceChannel)({
                channelId,
                guildId: interaction.guildId,
                adapterCreator: (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.voiceAdapterCreator
            });
            connection.on(voice_1.VoiceConnectionStatus.Ready, (oldState, newState) => __awaiter(this, void 0, void 0, function* () {
                console.log(`${interaction.client.user.tag} is ready to start playing music`);
                const audioPlayer = (0, voice_1.createAudioPlayer)();
                if (isLink) {
                    yield interaction.reply("is not a song link cock moment");
                    return;
                }
                const videoId = ytdl.getURLVideoID(url);
                const info = yield ytdl.getInfo(videoId);
                const formats = ytdl.filterFormats(info.formats, 'audioonly');
                const song = ytdl(url, { format: formats[0] }).pipe((0, fs_1.createWriteStream)('video.mp3'));
                song.on('finish', () => {
                    const resource = (0, voice_1.createAudioResource)('./video.mp3');
                    audioPlayer.play(resource);
                    const subscription = connection.subscribe(audioPlayer);
                    audioPlayer.on(voice_1.AudioPlayerStatus.Playing, () => {
                        console.log('The audio player has started playing!');
                    });
                });
            }));
            yield interaction.reply("pong");
        });
    },
};
