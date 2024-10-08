import { Events } from "discord.js"

import Feature from "@classes/Feature"

import GuildLevelsConfigCache from "@classes/GuildLevelsConfigCache"
import UserLevelManager from "@classes/UserLevelsManager"

import buildLevelUpEmbed from "./embeds/level_up"
import buildLevelInfoEmbed from "./embeds/level_info"
import buildLevelTopEmbed from "./embeds/level_top"
import buildLevelListEmbed from "./embeds/level_list"

import getTargetLevelFromPoints from "./utils/getTargetLevelFromPoints"
import hasCooldown from "./utils/hasCooldown"

import DEFAULT_FEATURE_CONFIG from "./defaultConfig"

export default class UserLevelsFeature extends Feature {
	static featureKey = "user_levels"

	registerEvents = {
		[Events.MessageCreate]: this.handleOnMessage,
		[Events.VoiceStateUpdate]: this.handleOnVoiceStateUpdate,
		[Events.GuildMemberAdd]: this.handleOnGuildMemberAdd,
	}

	registerCommands = [
		{
			name: "level",
			options: [
				{
					type: "string",
					name: "action",
					description: "Action to perform",
					choices: [
						{
							name: "top",
							value: "top",
							description: "Get the top 7 users in the leaderboard",
						},
						{
							name: "sync",
							value: "sync",
							description: "Sync your level in case of a desync",
						},
						{
							name: "list",
							value: "list",
							description: "Get the list of available levels",
						},
						{
							name: "earnings",
							value: "earnings",
							description: "List all the earnings you can earn",
						}
					],
				}
			],
			description: "Manage your server level",
			fn: async (interaction) => {
				const action = interaction.options.getString("action") ?? "default"

				if (!this.commands[action]) {
					return await interaction.reply("Unknown action")
				}

				return await this.commands[action](interaction)
			},
		},
	]

	userLevelManager = new UserLevelManager()
	levelsConfigCache = new GuildLevelsConfigCache({
		defaultConfig: DEFAULT_FEATURE_CONFIG,
	})

	getGuildLevels = async (guild_id) => {
		let guildLevels = await this.levelsConfigCache.get(guild_id, "levels") ?? []

		return guildLevels.sort((a, b) => a.level - b.level)
	}

	getUserRoles = async (user_id, guild_id) => {
		const guild = await this.bot.client.guilds.fetch(guild_id)
		const member = await guild.members.fetch(user_id)
		const roles = member.roles.cache

		return roles
	}

	getRoleData = async (role_id, guild_id) => {
		const guild = await this.bot.client.guilds.fetch(guild_id)
		const role = await guild.roles.fetch(role_id)

		return role
	}

	onLevelUp = async (user_id, guild_id, currentLevelObj) => {
		const notifyChannelId = await this.levelsConfigCache.get(guild_id, "notifyChannelId")
		const guildLevels = await this.getGuildLevels(guild_id)

		// if notifyChannelId exist, post a message in the channel
		if (notifyChannelId) {
			const channel = await this.bot.client.channels.fetch(notifyChannelId)
			const userData = await this.bot.client.users.fetch(user_id)

			const userLevelRank = await this.userLevelManager.getUserLevelRank(user_id, guild_id)

			currentLevelObj.rank = userLevelRank

			let embed = buildLevelUpEmbed(guildLevels, currentLevelObj, userData)

			await channel.send({
				content: `<@${user_id}>`,
				embeds: [embed],
				allowedMentions: { users: [user_id] },
			})
		}
	}

	handleNextLevel = async (user_id, guild_id) => {
		const userRoles = await this.getUserRoles(user_id, guild_id)
		const guildLevels = await this.getGuildLevels(guild_id)
		const userLevelObj = await this.userLevelManager.getObj(
			user_id,
			guild_id,
		)

		const guild = await this.bot.client.guilds.fetch(guild_id)
		const member = await guild.members.fetch(user_id)
		const username = member.user.tag

		this.console.info(`[${username}] > Handling next level...`)

		console.log(`GUILD levels >`, guildLevels)

		let targetLevelObj = getTargetLevelFromPoints(
			userLevelObj.points,
			guildLevels,
		)

		this.console.info(`[${username}] > Current level: ${targetLevelObj.level}`)
		this.console.info(`[${username}] > Current points: ${userLevelObj.points}`)
		this.console.info(`[${username}] > Target level: ${targetLevelObj.level}`)

		if (userLevelObj.level !== targetLevelObj.level) {
			this.console.info(`Updating [${member.user.tag}] level to ${targetLevelObj.level}`)

			userLevelObj.level = targetLevelObj.level

			await this.userLevelManager.updateLevel(
				user_id,
				guild_id,
				targetLevelObj.level,
			)

			await this.onLevelUp(user_id, guild_id, {
				...userLevelObj,
				level: targetLevelObj.level,
			})
		} else {
			this.console.info(`[${username}] is already at the target level, no update required`)
		}

		// get target role
		const targetRoleId = guildLevels.find((level) => level.level === userLevelObj.level).role
		const excludedRolesIds = guildLevels.filter((level) => level.level !== userLevelObj.level).map(level => level.role)

		// remove excluded roles
		for await (const roleId of excludedRolesIds) {
			if (userRoles.has(roleId)) {
				this.console.info(`Removing [${member.user.tag}] the role ${roleId}`)
				await member.roles.remove(roleId)
			}
		}

		// check if the user has the target role, if not, give him the role
		if (!userRoles.has(targetRoleId)) {
			this.console.info(`Giving [${member.user.tag}] the role > ${targetRoleId}`)
			await member.roles.add(targetRoleId)
		}
	}

	async handleOnMessage(message) {
		// ignore if the message is from a bot
		if (message.author.bot) {
			return false
		}

		let guildLevelsConfig = await this.levelsConfigCache.get(message.guild.id)

		// check if the channel is blacklisted
		if (Array.isArray(guildLevelsConfig.blacklistChannels)) {
			if (guildLevelsConfig.blacklistChannels.includes(message.channel.id)) {
				this.console.info(
					`[${message.author.username}] Message ignored because the channel is blacklisted`,
				)

				return false
			}
		}

		const earning = guildLevelsConfig.earnings["message"]

		// just ingore if disabled
		if (!earning.enabled) {
			return false
		}

		const currentUserLevel = await this.userLevelManager.getObj(
			message.author.id,
			message.guild.id,
		)

		// check the cooldown
		if (hasCooldown(currentUserLevel.lastMessageInteraction, earning)) {
			return false
		}

		const nextPoints = currentUserLevel.points + earning.points

		this.console.info(
			`[${message.author.username}] Points update due a message [${currentUserLevel.points}]+${earning.points} = [${nextPoints}]`,
		)

		await this.userLevelManager.updatePoints(
			message.author.id,
			message.guild.id,
			nextPoints,
		)
		await this.userLevelManager.updateMessageLastInteraction(
			message.author.id,
			message.guild.id,
			{
				date: new Date(),
				type: "message",
				data: message.content,
			},
		)

		await this.handleNextLevel(message.author.id, message.guild.id)

		return null
	}

	async handleOnVoiceStateUpdate(state) {
		// TODO: Implement
		return false

		console.log(state)

		let updateType = null

		const { lastVoiceInteraction } = await this.userLevelManager.getObj(
			state.userID,
			state.guildID,
		)

		// check if the user has been joined or leaved a channel
		if (state.channelID) {
			if (!lastVoiceInteraction) {
				return updateType = "other"
			}

			// it means has changed the state or leaved
			// check if user left a channel or is just a update
			if (lastVoiceInteraction && lastVoiceInteraction.channel_id !== state.channelID) {
				updateType = "left"
			}

			//  check if muted or deafened
			if (state.mute || state.deaf) {
				updateType = "muted"
			}
		} else {
			// it means has joined a channel 
			updateType = "joined"
		}

		await this.userLevelManager.updateVoiceStateLastInteraction(
			state.userID,
			state.guildID,
			{
				date: new Date(),
				type: updateType,
				channel_id: state.channelID,
			},
		)
	}

	async handleOnGuildMemberAdd(member) {
		// if member is a bot then ignore
		if (member.user.bot) {
			return
		}

		await this.handleNextLevel(member.user.id, member.guild.id)
	}

	// COMMANDS HANDLERS
	commands = {
		default: async (interaction) => {
			const guildLevelsConfig = await this.levelsConfigCache.get(
				interaction.guild.id,
			)
			const levelObj = await this.userLevelManager.getObj(
				interaction.user.id,
				interaction.guild.id,
			)

			await interaction.reply({
				embeds: [buildLevelInfoEmbed(null, guildLevelsConfig, levelObj, interaction.user)],
				ephemeral: true,
			})
		},
		"sync": async (interaction) => {
			await this.handleNextLevel(interaction.user.id, interaction.guild.id)

			await interaction.reply({
				content: "Your level state has been synced",
				ephemeral: true,
			})
		},
		"top": async (interaction) => {
			let topUserLevels = await this.userLevelManager.getTopUserLevels(interaction.guild.id)

			topUserLevels = topUserLevels.map(async (userLevel) => {
				userLevel.user = await this.bot.client.users.cache.get(userLevel.user_id)

				return userLevel
			})

			topUserLevels = await Promise.all(topUserLevels)

			const embed = buildLevelTopEmbed(topUserLevels, null)

			await interaction.reply({
				embeds: [embed],
				ephemeral: true,
			})
		},
		"list": async (interaction) => {
			const guildLevelsConfig = await this.levelsConfigCache.get(interaction.guild.id)

			const embed = buildLevelListEmbed(guildLevelsConfig, null)

			await interaction.reply({
				embeds: [embed],
				ephemeral: true,
			})
		},
		"earnings": async (interaction) => {
			return await interaction.reply({ content: "This command is not implemented yet", ephemeral: true })
		}
	}
}