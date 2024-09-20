import winston from "winston"
import colors from "cli-color"

const servicesToColor = {
    "CORE": {
        color: "whiteBright",
        background: "bgBlackBright",
    },
}

const paintText = (level, service, ...args) => {
    let { color, background } = servicesToColor[service ?? "CORE"] ?? servicesToColor["CORE"]

    if (level === "error") {
        color = "whiteBright"
        background = "bgRedBright"
    }

    return colors[background][color](...args)
}

const format = winston.format.printf(({ timestamp, service = "CORE", level, message, }) => {
    return `${paintText(level, service, `(${level}) [${service}]`)} > ${message}`
})

export default class Logger {
    constructor({ service } = {}) {
        this.console = winston.createLogger({
            format: winston.format.combine(
                winston.format.timestamp(),
                format
            ),
            transports: [
                new winston.transports.Console()
            ],
            defaultMeta: { service }
        })

        return this.console
    }
}