import { EmbedBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const cmd = new SlashCommandBuilder()
        .setName("unpause")
        .setDescription("skips currently playing song");

module.exports = {
        data: cmd,
        async execute(interaction: ChatInputCommandInteraction) {
                const { client } = interaction;

                if (!client.player) {
                        await interaction.reply("no player curently");
                        return;
                }


                const unpaused = client.player.unpause();

                if (unpaused) {
                        const embed = new EmbedBuilder()
                                .setTitle("Unpaused playing")
                                .setTimestamp(Date.now())
                        await interaction.reply({ embeds: [embed] })
                } else {
                        await interaction.reply("Nothing to unpause")
                }
        }
}
