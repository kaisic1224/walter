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
const cmd = new discord_js_1.SlashCommandBuilder()
    .setName("play")
    .setDescription("plays a song");
module.exports = {
    data: cmd,
    execute(interaction) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const user = interaction.user;
            const guild = interaction.guild;
            const connection = (0, voice_1.joinVoiceChannel)({
                channelId: "800080123536736360",
                guildId: interaction.guildId,
                adapterCreator: (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.voiceAdapterCreator
            });
            yield interaction.reply("pong");
        });
    },
};
