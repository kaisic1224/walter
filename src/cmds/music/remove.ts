import { EmbedBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction, Colors, SlashCommandBuilder } from "discord.js";

const cmd = new SlashCommandBuilder()
        .setName("remove")
        .addNumberOption((option) => option.setName("position").setDescription("the number to remove").setRequired(true))
        .setDescription("skips currently playing song");

module.exports = {
        data: cmd,
        async execute(interaction: ChatInputCommandInteraction) {
                const { client } = interaction;
                const number = interaction.options.getNumber("position", true) - 1;
                const keys = Array.from(client.queue.keys());
                if (number < 0) {
                        await interaction.channel?.send("Invalid number")
                        return;
                } else if (number > keys.length) {
                        await interaction.channel?.send("Invalid number")
                        return;
                }

                const key = keys.find((key) => parseInt(key.toString().split(":")[0]) === number)

                const resource = client.queue.get(key);
                client.queue.delete(key);

                const embed = new EmbedBuilder()
                        .setTitle(`Deleted track ${number + 2}: ${resource.title}`)
                        .setColor(Colors.Red)
                        .setTimestamp(Date.now())
                        .setFooter({
                                text: resource.requestee.username,
                                iconURL: resource.requestee.displayAvatarURL() || resource.requestee.defaultAvatarURL

                        })
                await interaction.reply({ embeds: [embed] })
        }
}
