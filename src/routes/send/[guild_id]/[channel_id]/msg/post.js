export default {
    useContext: ["discord"],
    fn: async (req) => {
        throw new OperationError(501, "Not implemented")

        const { guild_id, channel_id } = req.params
        const { content } = req.body

        if (!content) {
            throw new OperationError(400, "No message content provided")
        }

        const guild = await this.default.contexts.discord.client.guilds.fetch(guild_id)

        if (!guild) {
            throw new OperationError(404, "Guild not found")
        }

        const channel = await guild.channels.fetch(channel_id)

        if (!channel) {
            throw new OperationError(404, "Channel not found")
        }

        const msg = await channel.send(content)

        return msg
    }
}