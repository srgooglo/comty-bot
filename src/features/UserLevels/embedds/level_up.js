import { EmbedBuilder } from "discord.js";

export default (guildLevelsConfig, userLevelObj, embed) => {
  if (!guildLevelsConfig) {
    throw new Error("Missing `guildLevelsConfig`");
  }

  if (!userLevelObj) {
    throw new Error("Missing `userLevelObj`");
  }

  if (!embed) {
    embed = new EmbedBuilder();
  }

  embed = embed
    .setTitle("Level up!")
    .setDescription(
      `Congratulations <@${userLevelObj.user_id}>, you are now level **${userLevelObj.level}**!`,
    )
    .setTimestamp();

  return embed;
};
