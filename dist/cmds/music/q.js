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
    .setName("q")
    .setDescription("get info abt currently playing track");
module.exports = {
    data: cmd,
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const { client } = interaction;
            if (!client.queue) {
                yield interaction.reply("No queue currently");
                return;
            }
            let embed = new builders_1.EmbedBuilder()
                .setTitle("Queue")
                .setColor(discord_js_1.Colors.DarkGold);
            if (Array.from(client.queue.keys()).length === 0) {
                embed.setFields([
                    {
                        name: "No tracks currently in queue",
                        value: "such empty :sob:",
                        inline: false
                    }
                ]);
            }
            else {
                let index = 1;
                const fields = Array.from(client.queue.mapValues((resourceItem) => {
                    let duration;
                    if (typeof resourceItem.resource === "string") {
                        duration = `0:00 / ${resourceItem.duration}`;
                    }
                    else {
                        duration = `${Math.floor(resourceItem.resource.playbackDuration / (1000 * 60))}:${((resourceItem.resource.playbackDuration % 60000) / 1000) < 10 ? '0' + Math.round((resourceItem.resource.playbackDuration % 60000) / 1000) : Math.floor((resourceItem.resource.playbackDuration % 60000) / 1000)} / ${resourceItem.duration}`;
                    }
                    const field = {
                        name: `${index}. ${resourceItem.title} (${duration})`,
                        value: `Requested by: ${resourceItem.requestee.username}`,
                        inline: false
                    };
                    index++;
                    return field;
                }));
                embed.setFields(fields.map((fieldKv) => fieldKv[1]));
            }
            yield interaction.reply({ embeds: [embed] });
        });
    }
};
