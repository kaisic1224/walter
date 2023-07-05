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
    .setName("skip")
    .setDescription("skips currently playing song");
module.exports = {
    data: cmd,
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const { client, user } = interaction;
            console.log(client.queue);
            if (Array.from(client.queue.keys()).length === 0) {
                yield interaction.reply("cannot skip when nothing in queue");
                return;
            }
            client.player.stop(true);
            const embed = new builders_1.EmbedBuilder()
                .setTitle(`Skipping current track: ${user.username}`);
            yield interaction.reply({ embeds: [embed] });
        });
    }
};
