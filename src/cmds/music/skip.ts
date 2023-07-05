import { EmbedBuilder } from "@discordjs/builders";
import { AudioPlayer } from "@discordjs/voice";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const cmd = new SlashCommandBuilder()
        .setName("skip")
        .setDescription("skips currently playing song");

module.exports = {
        data: cmd,
        async execute(interaction: ChatInputCommandInteraction) {
                const { client, user } = interaction;
                console.log(client.queue)
                if (Array.from(client.queue.keys()).length === 0) {
                        await interaction.reply("cannot skip when nothing in queue")
                        return;
                }
                (client.player as AudioPlayer).stop(true)

                const embed = new EmbedBuilder()
                        .setTitle(`Skipping current track: ${user.username}`)
                await interaction.reply({ embeds: [embed] })
        }
}
