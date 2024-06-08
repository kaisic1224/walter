import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import * as path from "path";
import * as fs from "fs";
import { getCommands } from '../src/app'
import 'dotenv/config'

let client;
const respondInteraction = async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(
      `No command matching ${interaction.commandName} was found.`
    );
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
};

describe("testing bot slash commands", () => {
  beforeAll(() => {
    client = new Client({
      intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.Guilds,
      ],
    });
    expect(process.env.BOT_TOKEN).toBeTruthy();

    // setup from src/app.ts

    client.commands = new Collection();

    const commandsFolder = path.join(__dirname, "../dist/cmds");
    const commands = fs.readdirSync(commandsFolder);

    getCommands(commands, commandsFolder, client);
    client.on(Events.InteractionCreate, respondInteraction);

    client.login(process.env.BOT_TOKEN);
  });
  afterAll(async () => {
    client.off(Events.InteractionCreate, respondInteraction);
    client.destroy();
  });
  test("Tests bot play functionality", () => {
    expect(process.env.CLIENT_ID).toBeTruthy();
  });
});
