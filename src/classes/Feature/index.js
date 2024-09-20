import { ChatInputCommandInteraction } from "discord.js"
import Logger from "@classes/Logger"
import GuildConfigManager from "@classes/GuildConfigManager"

export default class Feature {
    constructor(bot) {
        this.bot = bot
    }

    console = new Logger({ service: this.constructor.name })

    getFeatureKey() {
        return this.constructor.featureKey ?? this.constructor.name
    }

    checkFeatureEnabled = async (eventOrInteraction) => {
        const guildId = eventOrInteraction.guildId ?? eventOrInteraction.guild.id ?? eventOrInteraction.channel.guildId ?? eventOrInteraction.channel.guild.id

        const isFeatureEnabled = await GuildConfigManager.isFeatureEnabled(guildId, this.getFeatureKey())

        if (!isFeatureEnabled) {
            return false
        }

        return true
    }

    buildGenericHandler(handler) {
        return async (payload, ...args) => {
            try {
                if (payload.system) {
                    return false
                }

                if (typeof payload.author === "object") {
                    if (payload.author.bot) {
                        return false
                    }
                }

                const isFeatureEnabled = await this.checkFeatureEnabled(payload)

                if (!isFeatureEnabled) {
                    if (payload instanceof ChatInputCommandInteraction) {
                        await payload.reply(`[${this.getFeatureKey()}] Feature is disabled, contact the server owner if you need it.`)
                    }

                    return false
                }

                await handler(payload, ...args)
            } catch (error) {
                this.console.error(error)
                this.console.error(error.stack)
            }
        }
    }

    init = async () => {
        this.console.info(`Initializing feature...`)

        if (Array.isArray(this.registerCommands)) {
            for await (let command of this.registerCommands) {
                // override command fn to generic handler
                command.fn = this.buildGenericHandler(command.fn.bind(this))

                await this.bot.registerCommand(command)
            }
        }

        if (this.registerEvents) {
            for await (let [eventName, listener] of Object.entries(this.registerEvents)) {
                listener = listener.bind(this)

                this.bot.registerEvent(eventName, this.buildGenericHandler(listener))
            }
        }

        if (typeof this.onInitialize === "function") {
            await this.onInitialize()
        }
    }
}