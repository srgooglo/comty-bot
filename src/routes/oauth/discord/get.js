import { GuildConfig } from "@db_models"

export default async (req, res) => {
    const { code, guild_id } = req.query

    if (!code || !guild_id) {
        return {
            ok: false,
        }
    }

    // check if exist, if not create
    let guildConfig = await GuildConfig.findOne({ guild_id })

    if (!guildConfig) {
        guildConfig = new GuildConfig({
            guild_id
        })

        await guildConfig.save()
    }

    return {
        ok: true,
    }
}