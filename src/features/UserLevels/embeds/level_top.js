import { EmbedBuilder } from "discord.js"

export default (topUserLevels, embed) => {
    if (!topUserLevels) {
        throw new Error("Missing `topUserLevels`")
    }

    if (!embed) {
        embed = new EmbedBuilder()
    }

    embed = embed
        .setColor("#FF6064")
        .setDescription("# 🏆 Top 10 users")

    embed.addFields([
        {
            name: "🥇 Rankㅤ",
            value: " ",
            inline: true,
        },
        {
            name: "👤 Userㅤ",
            value: " ",
            inline: true,
        },
        {
            name: "⭐ Level",
            value: " ",
            inline: true,
        },
    ])

    topUserLevels.forEach((userLevel, index) => {
        embed.addFields([
            {
                name: ` `,
                value: `**#${index + 1}**`,
                inline: true,
            },
            {
                name: ` `,
                value: `<@${userLevel.user_id}>`,
                inline: true,
            },
            {
                name: ` `,
                value: `**${userLevel.level}**｜${userLevel.points} points`,
                inline: true,
            },
        ])
    })

    return embed
}