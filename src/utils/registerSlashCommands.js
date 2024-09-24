import { Routes } from "discord.js"

export default async (commands, rest, client_id, guild_id) => {
    if (!commands) {
        throw new Error("Missing commands")
    }

    if (!rest) {
        throw new Error("Missing rest")
    }

    if (!client_id) {
        throw new Error("Missing client_id")
    }

    // filter commands with no slash property
    commands = commands.filter((command) => command.slash)

    const commandsJson = commands.map((command) => {
        return command.slash.toJSON()
    })

    if (typeof guild_id === "string") {
        await await rest.put(
            Routes.applicationGuildCommands(client_id, guild_id),
            {
                body: commandsJson
            }
        )
    } else {
        await rest.put(
            Routes.applicationCommands(client_id),
            {
                body: commandsJson
            }
        )
    }

    return commandsJson
}