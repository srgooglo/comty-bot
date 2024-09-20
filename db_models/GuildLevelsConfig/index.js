export default {
    name: "GuildLevelsConfig",
    collection: "guild_levels_configs",
    schema: {
        guild_id: {
            type: String,
            required: true,
        },
        config: {
            type: Object,
            default: {},
        },
    }
}