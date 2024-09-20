export default {
    description: "Simple ping-pong",
    fn: async (interaction) => {
        console.log(`User ${interaction.user.username} pinged`)

        return await interaction.reply("pong")
    }
}