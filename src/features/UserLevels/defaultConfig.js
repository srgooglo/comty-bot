export default {
    notifyChannelId: null,
    blacklistChannels: [],
    earnings: {
        invites: {
            enabled: true,
            points: 300,
        },
        voice_channel: {
            // Should detect if user is in a voice channel.
            // - Not muted or deafened
            // - Not only one user in the channel, and this user is not muted or deafened
            // every 1 minutes of voice channel, give a 20 point
            enabled: false,
            points: 20,
            cooldown: 60000, // 1 minute
        },
        message: {
            enabled: true,
            // every 1 minutes of messages, give a 10 points
            points: 10,
            cooldown: 60000, // 1 minute
        },
        reaction: {
            enabled: false,
            // every 1 minutes of reactions, give a 5 points
            points: 5,
            cooldown: 60000, // 1 minute
        },
    },
    levels: [
        {
            level: 0,
            role: "@lvl0",
            points: 0,
        },
        {
            level: 1,
            role: "@lvl1",
            points: 200,
        },
        {
            level: 2,
            role: "@lvl2",
            points: 500,
        },
        {
            level: 3,
            role: "@lvl3",
            points: 1000,
        },
        {
            level: 4,
            role: "@lvl4",
            points: 2000,
        }
    ]
}