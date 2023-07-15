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
            const { client } = interaction;
            client.player.stop(true);
            if (!client.queue) {
                yield interaction.reply("Cannot skip when nothing is playing");
                return;
            }
            const key = client.queue.keyAt(0);
            const currentResource = client.queue.get(key);
            client.queue.delete(key);
            if (Array.from(client.queue.keys()).length === 0) {
                yield interaction.reply("Cannot skip when nothing is playing");
                return;
            }
            const embed = new builders_1.EmbedBuilder()
                .setTitle(`Skipped current track: ${currentResource.title}`)
                .setColor(discord_js_1.Colors.Fuchsia)
                .setFooter({
                text: currentResource.requestee.username,
                iconURL: currentResource.requestee.displayAvatarURL() || currentResource.requestee.defaultAvatarURL
            })
                .setTimestamp(Date.now());
            yield interaction.reply({ embeds: [embed] });
        });
    }
};
