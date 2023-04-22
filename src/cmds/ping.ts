import { SlashCommandBuilder } from "discord.js";

const cmd = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("respond with pong");
