import { EmbedBuilder } from "discord.js"

export default (embed, guildConfig, userLevelObj) => {
    if (!embed) {
        embed = new EmbedBuilder()
    }

    const nextLevelObj = guildConfig.levels.find((level) => level.level === userLevelObj.level + 1) ?? guildConfig.levels[guildConfig.levels.length - 1]
    const currentLevelObj = guildConfig.levels.find((level) => level.level === userLevelObj.level)

    embed = embed
        .setColor("#FF6064")
        .setDescription("# ✨ Your level info")
        .setFields([
            {
                name: "**⭐ Level**",
                value: `<@&${currentLevelObj.role}> with ${userLevelObj.points} points`,
                inline: false,
            },
            {
                name: "**➡️ Next level**",
                value: `<@&${nextLevelObj.role}> at ${nextLevelObj.points} points`,
                inline: false,
            }
        ])

    return embed
}