export default {
    name: "UserLevels",
    collection: "user_levels",
    schema: {
        user_id: {
            type: String,
            required: true,
        },
        guild_id: {
            type: String,
            required: true,
        },
        level: {
            type: Number,
            default: 0,
        },
        points: {
            type: Number,
            default: 0,
        },
        lastMessageInteraction: {
            type: Object,
            default: null,
        },
        lastVoiceInteraction: {
            type: Object,
            default: null,
        }
    }
}