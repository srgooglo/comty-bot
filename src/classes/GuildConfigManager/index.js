import { GuildConfig } from "@db_models"

export default class GuildConfigManager {
    static get = async (guildId, key) => {
        const guildConfig = await GuildConfig.findOne({ guild_id: guildId })

        if (!key) {
            return guildConfig?.config
        }

        return guildConfig?.config[key]
    }

    static set = async (guildId, key, value) => {
        const guildConfig = await GuildConfig.findOne({ guild_id: guildId })

        if (!guildConfig) {
            throw new Error("Guild config not found")
        }

        guildConfig.config[key] = value

        await GuildConfig.updateOne({ guild_id: guildId }, guildConfig)

        return guildConfig.config
    }

    static isFeatureEnabled = async (guildId, feature) => {
        const guildConfig = await GuildConfig.findOne({ guild_id: guildId })

        return guildConfig?.config.enabledFeatures.includes(feature)
    }

    static toggleFeature = async (guildId, feature, to) => {
        if (!guildId) {
            throw new Error("Missing guildId")
        }

        if (!feature) {
            throw new Error("Missing feature")
        }

        let guildConfig = await GuildConfig.findOne({ guild_id: guildId })

        if (!guildConfig) {
            guildConfig = new GuildConfig({
                guild_id: guildId,
                config: {
                    enabledFeatures: [],
                },
            })

            await guildConfig.save()
        }

        if (typeof to === "undefined" || to === null) {
            to = !guildConfig.config.enabledFeatures.includes(feature)
        }

        if (to === true) {
            guildConfig.config.enabledFeatures.push(feature)
        } else {
            guildConfig.config.enabledFeatures = guildConfig.config.enabledFeatures.filter(v => v !== feature)
        }

        await GuildConfig.updateOne({ guild_id: guildId }, guildConfig)

        return to
    }
}