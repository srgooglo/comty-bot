import { EmbedBuilder } from "discord.js"
import pkgjson from "root/package.json"

export default {
    description: "Get the version of the service",
    fn: async (interaction) => {
        const embed = new EmbedBuilder()
            .setTitle(pkgjson.productName)
            .setDescription(`Version: ${pkgjson.version}`)
            .addFields([
                {
                    name: "Author",
                    value: pkgjson.author
                },
                {
                    name: "License",
                    value: pkgjson.license
                },
                {
                    name: "Linebridge Engine",
                    value: pkgjson.dependencies["linebridge"].replace("^", "")
                }
            ])

        return await interaction.reply({
            embeds: [embed],
            ephemeral: true
        })
    }
}