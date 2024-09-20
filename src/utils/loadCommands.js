import fs from "node:fs"
import path from "node:path"

export default async (commandsPath, collection) => {
    const commandsName = fs.readdirSync(commandsPath)

    for await (const commandName of commandsName) {
        const filePath = path.join(commandsPath, commandName)

        let commandObj = await import(filePath)

        commandObj = commandObj.default ?? commandObj

        commandObj.name = commandName

        collection.set(commandName, commandObj)
    }

    return collection
}