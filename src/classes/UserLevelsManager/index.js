import { UserLevels } from "@db_models"

export default class UserLevelManager {
    cache = new Map()

    // base
    getObj = async (user_id, guild_id) => {
        let level = null

        if (this.cache.has(user_id) && this.cache.get(user_id)[guild_id]) {
            level = this.cache.get(user_id)[guild_id]
        } else {
            level = await UserLevels.findOne({
                user_id,
                guild_id,
            })
                .lean()

            if (!level) {
                level = new UserLevels({
                    user_id,
                    guild_id,
                    points: 0,
                })

                await level.save()

                level = await UserLevels.findOne({
                    user_id,
                    guild_id,
                })
                    .lean()
            }

            this.cache.set(user_id, {
                [guild_id]: level
            })
        }

        return level
    }

    updateObj = async (user_id, guild_id, update) => {
        const level = await UserLevels.findOneAndUpdate(
            {
                user_id: user_id,
                guild_id: guild_id,
            },
            update,
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            }
        )
            .lean()

        this.cache.set(user_id, {
            [guild_id]: level
        })

        return level
    }

    // setters
    updateLastInteraction = async (user_id, guild_id, interaction) => {
        await this.updateObj(user_id, guild_id, {
            lastInteraction: {
                date: new Date(),
                type: interaction.type,
                data: interaction.data,
            },
        })

        return interaction
    }

    updatePoints = async (user_id, guild_id, points) => {
        await this.updateObj(user_id, guild_id, {
            points: points,
        })

        return points
    }

    updateLevel = async (user_id, guild_id, level) => {
        await this.updateObj(user_id, guild_id, {
            level: level,
        })

        return level
    }

    // getters
    getPoints = async (user_id, guild_id) => {
        let level = await this.getObj(user_id, guild_id)

        return level.points
    }

    getLevel = async (user_id, guild_id) => {
        let level = await this.getObj(user_id, guild_id)

        return level.level
    }

    getLastInteraction = async (user_id, guild_id) => {
        let level = await this.getObj(user_id, guild_id)

        return level.lastInteraction
    }
}