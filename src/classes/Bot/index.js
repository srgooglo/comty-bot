import path from "node:path"

import {
    Client,
    GatewayIntentBits,
    Collection,
    Events,
    REST,
} from "discord.js"

import registerSlashCommands from "@utils/registerSlashCommands"
import loadCommands from "@utils/loadCommands"
import loadListeners from "@utils/loadListeners"
import buildSlashCommand from "@utils/buildSlashCommand"
import loadCustomGuildCommands from "@utils/loadCustomGuildCommands"
import Logger from "@classes/Logger"

import BotFeatures from "src/features"

function buildEventHandler(handler) {
    return async (...args) => {
        try {
            await handler(...args)
        } catch (error) {
            console.error(error)
        }
    }
}

export default class Bot {
    constructor(auth, options) {
        this.auth = auth
        this.options = options
    }

    logger = new Logger({
        service: "ENGINE"
    })

    rest = new REST({})

    client = new Client({
        intents: Object.keys(GatewayIntentBits).map((key) => {
            return GatewayIntentBits[key]
        })
    })

    customCommands = new Collection()
    commands = new Collection()
    eventListeners = new Collection()
    features = new Collection()
    audioConnections = new Collection()

    events = {
        once: {
            "ready": () => {
                this.logger.info("✅ Bot ready!")
            }
        },
        on: {
            [Events.InteractionCreate]: this.handleCommandInteraction,
            [Events.MessageCreate]: (...data) => this.handleGenericEvent(Events.MessageCreate, ...data),
            [Events.MessageUpdate]: (...data) => this.handleGenericEvent(Events.MessageUpdate, ...data),
            [Events.MessageDelete]: (...data) => this.handleGenericEvent(Events.MessageDelete, ...data),
            [Events.MessageReactionAdd]: (...data) => this.handleGenericEvent(Events.MessageReactionAdd, ...data),
            [Events.MessageReactionRemove]: (...data) => this.handleGenericEvent(Events.MessageReactionRemove, ...data),
            [Events.MessageReactionRemoveAll]: (...data) => this.handleGenericEvent(Events.MessageReactionRemoveAll, ...data),
            [Events.GuildMemberAdd]: (...data) => this.handleGenericEvent(Events.GuildMemberAdd, ...data),
            [Events.GuildMemberRemove]: (...data) => this.handleGenericEvent(Events.GuildMemberRemove, ...data),
            [Events.GuildMemberUpdate]: (...data) => this.handleGenericEvent(Events.GuildMemberUpdate, ...data),
            [Events.GuildCreate]: (...data) => this.handleGenericEvent(Events.GuildCreate, ...data),
            [Events.GuildDelete]: (...data) => this.handleGenericEvent(Events.GuildDelete, ...data),
            [Events.GuildUpdate]: (...data) => this.handleGenericEvent(Events.GuildUpdate, ...data),
            [Events.GuildBanAdd]: (...data) => this.handleGenericEvent(Events.GuildBanAdd, ...data),
            [Events.GuildBanRemove]: (...data) => this.handleGenericEvent(Events.GuildBanRemove, ...data),
            [Events.GuildEmojisUpdate]: (...data) => this.handleGenericEvent(Events.GuildEmojisUpdate, ...data),
            [Events.GuildIntegrationsUpdate]: (...data) => this.handleGenericEvent(Events.GuildIntegrationsUpdate, ...data),
            [Events.GuildStickersUpdate]: (...data) => this.handleGenericEvent(Events.GuildStickersUpdate, ...data),
            [Events.GuildMemberUpdate]: (...data) => this.handleGenericEvent(Events.GuildMemberUpdate, ...data),
            [Events.GuildMembersChunk]: (...data) => this.handleGenericEvent(Events.GuildMembersChunk, ...data),
            [Events.GuildRoleCreate]: (...data) => this.handleGenericEvent(Events.GuildRoleCreate, ...data),
            [Events.GuildRoleDelete]: (...data) => this.handleGenericEvent(Events.GuildRoleDelete, ...data),
            [Events.GuildRoleUpdate]: (...data) => this.handleGenericEvent(Events.GuildRoleUpdate, ...data),
            [Events.GuildScheduledEventCreate]: (...data) => this.handleGenericEvent(Events.GuildScheduledEventCreate, ...data),
            [Events.GuildScheduledEventDelete]: (...data) => this.handleGenericEvent(Events.GuildScheduledEventDelete, ...data),
            [Events.GuildScheduledEventUpdate]: (...data) => this.handleGenericEvent(Events.GuildScheduledEventUpdate, ...data),
            [Events.GuildScheduledEventUserAdd]: (...data) => this.handleGenericEvent(Events.GuildScheduledEventUserAdd, ...data),
            [Events.GuildScheduledEventUserRemove]: (...data) => this.handleGenericEvent(Events.GuildScheduledEventUserRemove, ...data),
            [Events.GuildUpdate]: (...data) => this.handleGenericEvent(Events.GuildUpdate, ...data),
            [Events.PresenceUpdate]: (...data) => this.handleGenericEvent(Events.PresenceUpdate, ...data),
            [Events.TypingStart]: (...data) => this.handleGenericEvent(Events.TypingStart, ...data),
            [Events.UserUpdate]: (...data) => this.handleGenericEvent(Events.UserUpdate, ...data),
            [Events.VoiceStateUpdate]: (...data) => this.handleGenericEvent(Events.VoiceStateUpdate, ...data),
            [Events.WebhooksUpdate]: (...data) => this.handleGenericEvent(Events.WebhooksUpdate, ...data),
        }
    }

    async handleGenericEvent(event, ...args) {
        let eventObj = this.eventListeners.get(event)

        // that means this fired event is not registered
        if (!eventObj) {
            return false
        }

        for await (const listener of eventObj.listeners) {
            await listener(...args)
        }
    }

    async handleCommandInteraction(interaction) {
        if (!interaction.isChatInputCommand()) {
            return false
        }

        let command = this.commands.get(interaction.commandName)

        if (!command) {
            if (this.customCommands.has(interaction.guildId)) {
                const guildCommands = this.customCommands.get(interaction.guildId)

                command = guildCommands.get(interaction.commandName)
            }
        }

        if (!command) {
            await interaction.reply({ content: "Cannot find that command", ephemeral: true })

            return null
        }

        try {
            await command.fn(interaction)
        } catch (error) {
            this.logger.error(`Failed to execute command: ${command.name}`)
            this.logger.error(error)
            this.logger.error(error.stack)

            await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true })
        }
    }

    async registerCommand(command) {
        try {
            command.slash = await buildSlashCommand(command)

            this.commands.set(command.name, command)

            return command
        } catch (error) {
            this.logger.error(`Failed to register command: ${command.name}`)
            this.logger.error(error)
            this.logger.error(error.stack)

            return false
        }
    }

    async registerEvent(event, listener) {
        this.client.on(event, buildEventHandler(listener))
    }

    async initialize() {
        await this.rest.setToken(this.auth.token)

        // load built in commands & custom commands
        this.commands = await loadCommands(path.join(__dirname, "..", "..", "built-in", "commands"), this.commands)
        this.logger.info(`Loaded [${this.commands.size}] commands...`)

        // load custom commands
        this.customCommands = await loadCustomGuildCommands(path.join(process.cwd(), "commands"), this.customCommands)
        this.logger.info(`Loaded [${this.customCommands.size}] custom commands...`)

        // load listeners
        this.eventListeners = await loadListeners(path.join(process.cwd(), "listeners"), this.eventListeners)
        this.logger.info(`Loaded [${this.eventListeners.size}] listeners...`)

        // load features
        for await (const [featureName, featureClass] of Object.entries(BotFeatures)) {
            const feature = new featureClass(this)

            await feature.init()

            this.features.set(featureName, feature)
        }

        // register events
        Object.entries(this.events.once).forEach(([event, listener]) => {
            this.client.once(event, buildEventHandler(listener.bind(this)))
        })

        Object.entries(this.events.on).forEach(([event, listener]) => {
            this.client.on(event, buildEventHandler(listener.bind(this)))
        })

        // register slash commands
        this.logger.info(`Registering [${this.commands.size}] slash commands...`)
        await registerSlashCommands(this.commands, this.rest, this.auth.client_id)

        // register custom slash commands
        for await (const [guildId, guildCommands] of this.customCommands.entries()) {
            this.logger.info(`Registering [${guildCommands.size}] custom slash commands for guild [${guildId}]...`)
            await registerSlashCommands(guildCommands, this.rest, this.auth.client_id, guildId)
        }

        // login
        await this.client.login(this.auth.token)
    }

    async destroy() {
        await this.client.destroy()
    }
}