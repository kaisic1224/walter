import { Client, Events, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.once(Events.ClientReady, (client: Client) => {
  console.log(`${client.user!.tag} is logged in now`);
});

client.login(process.env.BOT_TOKEN);
