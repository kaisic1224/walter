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
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const cmd = new discord_js_1.SlashCommandBuilder()
    .setName("unpause")
    .setDescription("skips currently playing song");
module.exports = {
    data: cmd,
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const { client } = interaction;
            if (!client.player) {
                yield interaction.reply("no player curently");
                return;
            }
            const unpaused = client.player.unpause();
            if (unpaused) {
                const embed = new builders_1.EmbedBuilder()
                    .setTitle("Unpaused playing")
                    .setTimestamp(Date.now());
                yield interaction.reply({ embeds: [embed] });
            }
            else {
                yield interaction.reply("Nothing to unpause");
            }
        });
    }
};
