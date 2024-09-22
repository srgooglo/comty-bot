export default {
    useContext: ["bot"],
    fn: async (req) => {
        const { guild_id, user_id } = req.params

        const levelsFeature = this.default.contexts.bot.features.get("UserLevels")

        await levelsFeature.handleNextLevel(user_id, guild_id)

        return {
            ok: 1
        }
    }
}