"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const cmd = new discord_js_1.SlashCommandBuilder()
    .setName("ping")
    .setDescription("respond with pong");
