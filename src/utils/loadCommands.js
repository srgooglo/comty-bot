import fs from "node:fs"
import path from "node:path"

import buildSlashCommand from "@utils/buildSlashCommand"

export default async (commandsPath, collection) => {
    if (!fs.existsSync(commandsPath)) {
        return collection
    }

    const commandsName = fs.readdirSync(commandsPath)

    for await (const commandName of commandsName) {
        const filePath = path.join(commandsPath, commandName)

        let commandObj = await import(filePath)

        commandObj = commandObj.default ?? commandObj

        commandObj.name = commandName

        commandObj.slash = await buildSlashCommand(commandObj)

        collection.set(commandName, commandObj)
    }

    return collection
}