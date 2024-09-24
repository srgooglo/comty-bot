import { Collection } from "discord.js"
import buildSlashCommand from "@utils/buildSlashCommand"

import path from "node:path"
import fs from "node:fs"

export default async (dir, guildsCommandsCollection) => {
    if (!fs.statSync(dir).isDirectory()) {
        return guildsCommandsCollection
    }

    let guildsCommandsPaths = await fs.promises.readdir(dir)

    guildsCommandsPaths = guildsCommandsPaths.filter((file) => !file.endsWith(".js"))

    for (const guildId of guildsCommandsPaths) {
        const guildCommands = new Collection()

        let commandsPaths = await fs.promises.readdir(path.join(dir, guildId))

        for (const commandNamespace of commandsPaths) {
            const mainFile = path.join(dir, guildId, commandNamespace, "index.js")

            if (!fs.existsSync(mainFile)) {
                console.warn(`Missing main file for command namespace [${commandNamespace}]`)
                continue
            }

            let command = await import(mainFile)

            command = command.default ?? command

            if (typeof command !== "object") {
                console.error(`Invalid command provided for namespace [${commandNamespace}], must be an object or Command class...`)
                continue
            }

            command.guild_id = guildId
            command.slash = await buildSlashCommand(command)

            guildCommands.set(command.name, command)
        }

        guildsCommandsCollection.set(guildId, guildCommands)
    }

    return guildsCommandsCollection
}