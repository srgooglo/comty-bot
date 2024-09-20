import { Events, EmbedBuilder } from "discord.js";

import Feature from "@classes/Feature";

import GuildLevelsConfigCache from "@classes/GuildLevelsConfigCache";
import UserLevelManager from "@classes/UserLevelsManager";

import buildLevelUpEmbed from "./embedds/level_up";

import getTargetLevelFromPoints from "./utils/getTargetLevelFromPoints";
import createLevelInfoEmbed from "./utils/createLevelInfoEmbed";
import hasCooldown from "./utils/hasCooldown";

import DEFAULT_FEATURE_CONFIG from "./defaultConfig";

export default class UserLevelsFeature extends Feature {
  static featureKey = "user_levels";

  registerEvents = {
    [Events.MessageCreate]: this.handleOnMessage,
    [Events.VoiceStateUpdate]: this.handleOnVoiceStateUpdate,
  };

  registerCommands = [
    {
      name: "level",
      description: "Get your level",
      fn: this.handleLevelCommand,
    },
  ];

  userLevelManager = new UserLevelManager();
  guildsConfigCache = new GuildLevelsConfigCache({
    defaultConfig: DEFAULT_FEATURE_CONFIG,
  });

  async handleLevelCommand(interaction) {
    const guildLevelsConfig = await this.guildsConfigCache.get(
      interaction.guild.id,
    );
    const levelObj = await this.userLevelManager.getObj(
      interaction.user.id,
      interaction.guild.id,
    );

    await interaction.reply({
      embeds: [createLevelInfoEmbed(null, guildLevelsConfig, levelObj)],
      ephemeral: true,
    });
  }

  onLevelUp = async (user_id, guild_id, currentLevelObj) => {
    const guildLevelsConfig = await this.guildsConfigCache.get(guild_id);

    // if notifyChannelId exist, post a message in the channel
    if (guildLevelsConfig.notifyChannelId) {
      const channel = await this.bot.client.channels.fetch(
        guildLevelsConfig.notifyChannelId,
      );

      const userData = await this.bot.client.users.fetch(user_id);

      let embed = buildLevelUpEmbed(guildLevelsConfig, currentLevelObj);
      embed = createLevelInfoEmbed(embed, guildLevelsConfig, currentLevelObj);

      embed = embed.setImage(
        `https://cdn.discordapp.com/avatars/${user_id}/${userData.avatar}.png?size=256`,
      );

      await channel.send({
        embeds: [embed],
        allowedMentions: {
          users: [user_id],
        },
      });
    }
  };

  handleNextLevel = async (user_id, guild_id) => {
    const guildLevelsConfig = await this.guildsConfigCache.get(guild_id);
    const currentLevelObj = await this.userLevelManager.getObj(
      user_id,
      guild_id,
    );

    let targetLevel = getTargetLevelFromPoints(
      currentLevelObj.points,
      guildLevelsConfig.levels,
    );

    if (currentLevelObj.level !== targetLevel.level) {
      await this.userLevelManager.updateLevel(
        user_id,
        guild_id,
        targetLevel.level,
      );

      await this.onLevelUp(user_id, guild_id, {
        ...currentLevelObj,
        level: targetLevel.level,
      });
    }
  };

  async handleOnMessage(message) {
    let guildLevelsConfig = await this.guildsConfigCache.get(message.guild.id);

    const earning = guildLevelsConfig.earnings["message"];

    // just ingore if disabled
    if (!earning.enabled) {
      return false;
    }

    const currentLevel = await this.userLevelManager.getObj(
      message.author.id,
      message.guild.id,
    );

    // check the cooldown
    if (hasCooldown(currentLevel.lastInteraction, earning)) {
      return false;
    }

    const nextPoints = currentLevel.points + earning.points;

    this.console.info(
      `[${message.author.username}] Points update due a message [${currentLevel.points}]+${earning.points} = [${nextPoints}]`,
    );

    await this.userLevelManager.updatePoints(
      message.author.id,
      message.guild.id,
      nextPoints,
    );
    await this.userLevelManager.updateLastInteraction(
      message.author.id,
      message.guild.id,
      {
        date: new Date(),
        type: "message",
        data: message.content,
      },
    );

    await this.handleNextLevel(message.author.id, message.guild.id);

    return null;
  }

  async handleOnVoiceStateUpdate(state) {
    console.time("handleOnVoiceStateUpdate:");

    //this.console.info(`User [${state.member.user.username}] changed voice state`)

    console.timeEnd("handleOnVoiceStateUpdate:");
  }
}
