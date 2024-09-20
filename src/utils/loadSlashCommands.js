import buildSlashCommand from "@utils/buildSlashCommand"

export default async (collection) => {
    for await (const [commandName, command] of collection) {
        command.slash = buildSlashCommand(command)

        collection.set(commandName, command)
    }

    return collection
}