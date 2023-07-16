import { EmbedBuilder } from "@discordjs/builders";
import { AudioResource } from "@discordjs/voice";
import { ChatInputCommandInteraction, Colors, EmbedField, SlashCommandBuilder } from "discord.js";

const cmd = new SlashCommandBuilder()
        .setName("q")
        .setDescription("get info abt currently playing track");


module.exports = {
        data: cmd,
        async execute(interaction: ChatInputCommandInteraction) {
                const { client } = interaction;
                if (!client.queue) {
                        await interaction.reply("No queue currently")
                        return;
                }
                let embed = new EmbedBuilder()
                        .setTitle("Queue")
                        .setColor(Colors.DarkGold)
                if (Array.from(client.queue.keys()).length === 0) {
                        embed.setFields(
                                [
                                        {
                                                name: "No tracks currently in queue",
                                                value: "such empty :sob:",
                                                inline: false
                                        }
                                ]
                        )
                } else {
                        let index = 1;
                        const fields = Array.from(client.queue.mapValues((resourceItem) => {
                                const field: EmbedField = {
                                        name: `${index}. ${resourceItem.title} (${Math.floor(resourceItem.resource.playbackDuration / (1000 * 60))}: ${Math.floor((resourceItem.resource.playbackDuration % 60000) / 1000)} / ${resourceItem.duration})`,
                                        value: `Requested by: ${resourceItem.requestee.username}`,
                                        inline: false
                                }
                                index++;
                                return field
                        }))
                        embed.setFields(fields.map((fieldKv: any) => fieldKv[1]))
                }



                await interaction.reply({ embeds: [embed] })
        }
}
