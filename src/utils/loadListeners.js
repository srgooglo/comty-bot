import fs from "node:fs"
import path from "node:path"

async function readFilesFn(from) {
    let fns = []

    for await (const file of fs.readdirSync(from)) {
        if (!file.endsWith(".js")) {
            continue
        }

        const filePath = path.join(from, file)

        let fn = await import(filePath)

        fn = fn.default ?? fn

        fns.push(fn)
    }

    return fns
}

export default async (listenersPath, collection) => {
    const listenersEventsNames = fs.readdirSync(listenersPath)

    for await (const eventName of listenersEventsNames) {
        const eventObj = {
            name: eventName,
            listeners: await readFilesFn(path.join(listenersPath, eventName)),
        }

        collection.set(eventName, eventObj)
    }

    return collection
}