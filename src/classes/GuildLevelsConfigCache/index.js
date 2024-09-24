import { GuildLevelsConfig } from "@db_models"

export default class GuildLevelsConfigCache {
    constructor(params) {
        this.params = params
    }

    cache = new Map()

    get = async (guild_id, key) => {
        let config = null

        if (this.cache.has(guild_id)) {
            config = this.cache.get(guild_id)
        } else {
            let guildConfig = await GuildLevelsConfig.findOne({
                guild_id,
            })

            if (!guildConfig) {
                guildConfig = await this.setDefault(guild_id)
            }

            this.cache.set(guild_id, guildConfig.config)

            config = guildConfig.config
        }

        if (key) {
            return config[key]
        }

        return config
    }

    setDefault = async (guild_id) => {
        if (!this.params.defaultConfig) {
            return Object()
        }

        let guildConfig = new GuildLevelsConfig({
            guild_id,
            config: this.params.defaultConfig,
        })

        await guildConfig.save()

        return guildConfig
    }
}