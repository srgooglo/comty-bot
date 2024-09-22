import { Server } from "linebridge/dist/server"

import DbManager from "@classes/DbManager"
import Bot from "@classes/Bot"

class API extends Server {
    static refName = "comty-bot"
    static disableWebSockets = true
    static routesPath = `${__dirname}/routes`
    static listen_port = process.env.HTTP_LISTEN_PORT ?? 4023

    contexts = {
        db: new DbManager(),
        bot: new Bot({
            client_id: process.env.DISCORD_CLIENT_ID,
            token: process.env.DISCORD_BOT_TOKEN,
            private: process.env.DISCORD_PRIVATE_TOKEN,
        })
    }

    async onInitialize() {
        await this.contexts.db.initialize()
        await this.contexts.bot.initialize()
    }

    onClose() {
        console.log("Shutting down...")

        this.contexts.bot.destroy()
    }
}

Boot(API)