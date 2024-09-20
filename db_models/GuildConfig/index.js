export default {
    name: "GuildConfig",
    collection: "guild_configs",
    schema: {
        guild_id: {
            type: String,
            required: true
        },
        config: {
            type: Object,
            default: {
                enabledFeatures: [],
            }
        },
        created_at: {
            type: Date,
        },
        last_updated: {
            type: Date,
        }
    }
}