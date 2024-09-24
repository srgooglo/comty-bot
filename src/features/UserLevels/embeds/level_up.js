import { EmbedBuilder } from "discord.js"

export default (levels, userLevelObj, userData, embed) => {
	if (!userLevelObj) {
		throw new Error("Missing `userLevelObj`")
	}

	if (!embed) {
		embed = new EmbedBuilder()
	}

	const levelConfig = levels.find(level => level.level === userLevelObj.level)
	const previusLevelConfig = levels[levelConfig.level - 1] ?? levels.levels[0]

	embed = embed
		.setColor("#FF6064")
		.setAuthor({
			name: `¡Congratulations, you are now level ${userLevelObj.level}!`,
			iconURL: "https://media.discordapp.net/attachments/1006929586573021276/1178126728946798643/ezgif.com-apng-to-gif.gif?ex=66f00a44&is=66eeb8c4&hm=5260a7f443b1737e16b0a3c4b47d1bf292a1d11e03828d8f3f8271092126d20b&",
		})
		.setDescription(
			`<@&${previusLevelConfig.role}> **→** <@&${levelConfig.role}>\n
			You are the **#${userLevelObj.rank + 1}** in the leaderboard\n
			`,
		)
		.setThumbnail(`https://cdn.discordapp.com/avatars/${userLevelObj.user_id}/${userData.avatar}.png?size=256`)

	return embed
}
