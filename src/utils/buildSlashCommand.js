import {
    SlashCommandBuilder,
} from "discord.js"

import getOptionRegisterFn from "@utils/getOptionRegisterFn"

export default (command) => {
    const build = new SlashCommandBuilder()

    build.setName(command.name)
    build.setDescription(command.description)

    if (command.options) {
        for (let option of command.options) {
            if (!option.type) {
                console.error(`[Register Slash Command] Missing option type for command [${command.name}] option [${option.name}]`)
                continue
            }
            
            option.type = option.type.toUpperCase()

            if (!build[getOptionRegisterFn(option.type)]) {
                console.error(`[Register Slash Command] Unknown option type [${option.type}] for command [${command.name}] option [${option.name}]`)
                continue
            }

            build[getOptionRegisterFn(option.type)]((optionBuilder) => {
                optionBuilder.setName(option.name)

                if (option.required === true) {
                    optionBuilder.setRequired(true)
                }

                if (option.description) {
                    optionBuilder.setDescription(option.description)
                }

                if (option.autocomplete) {
                    optionBuilder.setAutocomplete(option.autocomplete)
                }

                if (optionBuilder.maxValue) {
                    optionBuilder.setMaxValue(option.maxValue)
                }

                if (optionBuilder.minValue) {
                    optionBuilder.setMinValue(option.minValue)
                }

                return optionBuilder
            })
        }
    }

    return build
}
