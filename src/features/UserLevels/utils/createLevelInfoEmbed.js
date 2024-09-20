import { EmbedBuilder } from "discord.js"

import getNextLevelRequiredPoints from "./getNextLevelRequiredPoints"

export default (embed, guildConfig, levelObj) => {
    if (!embed) {
        embed = new EmbedBuilder()
            .setTitle("Level Info")
    }

    const nextLevelAtPoints = getNextLevelRequiredPoints(levelObj, guildConfig.levels)

    embed.setFields([
        {
            name: "Level",
            value: `${levelObj.level}`,
        },
        {
            name: "Points",
            value: `${levelObj.points}`,
        },
        {
            name: "Next level at",
            value: `${nextLevelAtPoints} points`,
        }
    ])

    return embed
}