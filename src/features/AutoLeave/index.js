import { Events } from "discord.js"

import Feature from "@classes/Feature"
import GuildConfigManager from "@classes/GuildConfigManager"

export default class AutoLeaveFeature extends Feature {
    static featureKey = "auto_leave"

    registerEvents = {
        [Events.VoiceStateUpdate]: this.handleOnVoiceStateUpdate,
    }

    async handleOnVoiceStateUpdate(oldState, newState) {
        let autoLeaveChannelId = await GuildConfigManager.get(newState.guild.id, "autoLeaveChannelId")

        autoLeaveChannelId = String(autoLeaveChannelId)
        const currentChannelId = String(newState.channelId)

        if (autoLeaveChannelId) {
            if (autoLeaveChannelId === currentChannelId) {
                // check if bot has permissions to kick the user
                if (!newState.channel.permissionsFor(this.bot.client.user).has("MOVE_MEMBERS")) {
                    return false
                }

                // kick the user
                await newState.disconnect("Auto leave")
            }
        }
    }
}