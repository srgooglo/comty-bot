import { Routes } from "discord.js"

export default async (commands, rest, client_id) => {
    if (!commands) {
        throw new Error("Missing commands")
    }

    if (!rest) {
        throw new Error("Missing rest")
    }

    if (!client_id) {
        throw new Error("Missing client_id")
    }

    const slashCommandsJSON = commands.map((command) => {
        return command.slash.toJSON()
    })

    await rest.put(
        Routes.applicationCommands(client_id),
        {
            body: slashCommandsJSON
        }
    )

    return slashCommandsJSON
}