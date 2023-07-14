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
    .setName("remove")
    .addNumberOption((option) => option.setName("position").setDescription("the number to remove").setRequired(true))
    .setDescription("skips currently playing song");
module.exports = {
    data: cmd,
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const { client } = interaction;
            const number = interaction.options.getNumber("position", true) - 1;
            const keys = Array.from(client.queue.keys());
            const key = keys.find((key) => parseInt(key.toString().split(":")[0]) === number);
            const resource = client.queue.get(key);
            client.queue.delete(key);
            const embed = new builders_1.EmbedBuilder()
                .setTitle(`Deleted track ${number + 1}: ${resource.title}`)
                .setColor(discord_js_1.Colors.Red)
                .setTimestamp(Date.now())
                .setFooter({
                text: resource.requestee.username,
                iconURL: resource.requestee.displayAvatarURL() || resource.requestee.defaultAvatarURL
            });
            yield interaction.reply({ embeds: [embed] });
        });
    }
};
