import { EmbedBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction, Colors, SlashCommandBuilder } from "discord.js";

const cmd = new SlashCommandBuilder()
        .setName("skip")
        .setDescription("skips currently playing song");

module.exports = {
        data: cmd,
        async execute(interaction: ChatInputCommandInteraction) {
                const { client } = interaction;


                if (!client.queue || Array.from(client.queue.keys()).length === 0) {
                        await interaction.reply("Cannot skip when nothing is playing")
                        return;
                }
                client.player.stop(true);

                const key = client.queue.keyAt(0);
                const currentResource = client.queue.get(key);


                const embed = new EmbedBuilder()
                        .setTitle(`Skipped current track: ${currentResource.title}`)
                        .setColor(Colors.Fuchsia)
                        .setFooter({
                                text: currentResource.requestee.username,
                                iconURL: currentResource.requestee.displayAvatarURL() || currentResource.requestee.defaultAvatarURL
                        })
                        .setTimestamp(Date.now())
                await interaction.reply({ embeds: [embed] })
        }
}
