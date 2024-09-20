import GuildConfigManager from "@classes/GuildConfigManager"

const actions = {
    "get": async (interaction, { key }) => {
        const guildConfig = await GuildConfigManager.get(interaction.guildId, key)

        return await interaction.reply(JSON.stringify(guildConfig))
    },
    "toggleFeature": async (interaction, { key, value }) => {
        const result = await GuildConfigManager.toggleFeature(interaction.guildId, key, ToBoolean(value))

        return await interaction.reply(`Feature ${key} has been ${result ? "enabled" : "disabled"}`)
    }
}

export default {
    description: "Manage guild config",
    options: [
        {
            type: "String",
            name: "action",
            description: "Action to perform",
            required: true
        },
        {
            type: "String",
            name: "key",
            description: "Key to set"
        },
        {
            type: "String",
            name: "value",
            description: "Value to set"
        }
    ],
    fn: async (interaction) => {
        const action = interaction.options.getString("action")

        if (!actions[action]) {
            return await interaction.reply("Unknown action")
        }

        await actions[action](interaction, {
            key: interaction.options.getString("key"),
            value: interaction.options.getString("value")
        })
    }
}