import { EmbedBuilder } from "discord.js"

export default (guildLevelsConfig, embed) => {
    if (!guildLevelsConfig) {
        throw new Error("Missing `guildLevelsConfig`")
    }

    if (!embed) {
        embed = new EmbedBuilder()
    }

    embed = embed
        .setColor("#FF6064")
        .setDescription("# 💫 Levels")

    embed.addFields([
        {
            name: "⭐ Level",
            value: " ",
            inline: true,
        },
        {
            name: "🪙 Points",
            value: " ",
            inline: true,
        },
        {
            name: " ",
            value: " ",
            inline: true,
        }
    ])

    guildLevelsConfig.levels.reverse().forEach((levelObj) => {
        embed.addFields([
            {
                name: ` `,
                value: `<@&${levelObj.role}>`,
                inline: true,
            },
            {
                name: ` `,
                value: `${levelObj.points}`,
                inline: true,
            },
            {
                name: ` `,
                value: ` `,
                inline: true,
            }
        ])
    })

    return embed
}