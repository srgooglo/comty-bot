import {
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    VoiceConnectionStatus,
} from "@discordjs/voice"

import Feature from "@classes/Feature"
import isUrl from "@utils/isUrl"

export default class AudioFeature extends Feature {
    static featureKey = "audio"

    registerEvents = {

    }

    registerCommands = [
        {
            name: "aplay",
            description: "Play audio from a url",
            options: [
                {
                    type: "String",
                    name: "url",
                    description: "Url of the audio",
                    required: true
                }
            ],
            fn: this.playAudioFromInteraction
        }
    ]

    async disconnectFromVoiceChannel(connection, currentState) {
        const voiceChannelId = connection.joinConfig.channelId

        if (!connection) {
            return true
        }

        this.console.info(`Disconnecting from voice channel [${voiceChannelId}]`)

        this.bot.audioConnections.delete(voiceChannelId)

        if (connection.state.status === VoiceConnectionStatus.Destroyed) {
            return true
        }

        if (currentState.status === VoiceConnectionStatus.Destroyed || currentState.status === VoiceConnectionStatus.Destroying || currentState.status === VoiceConnectionStatus.Disconnected) {
            return true
        }

        await connection.destroy()

        return true
    }

    async playAudioFromInteraction(interaction) {
        const url = interaction.options.getString("url")

        if (!isUrl(url)) {
            return await interaction.reply("Invalid url")
        }

        // get the voice channel of the user
        const userVoiceChannel = interaction.member.voice.channel

        if (!userVoiceChannel) {
            return await interaction.reply("You need to be in a voice channel to play audio!")
        }

        this.console.info(`Playing audio [${url}] to [${interaction.user.username}]`)
        this.console.info(`User is in voice channel [${userVoiceChannel.name}]`)

        let connection = this.bot.audioConnections.get(userVoiceChannel.id)

        if (connection) {
            await this.disconnectFromVoiceChannel(connection, connection.state)
        }

        // join the voice channel
        connection = await joinVoiceChannel({
            channelId: userVoiceChannel.id,
            guildId: userVoiceChannel.guild.id,
            adapterCreator: userVoiceChannel.guild.voiceAdapterCreator,
        })

        this.bot.audioConnections.set(userVoiceChannel.id, connection)

        const player = createAudioPlayer()

        const resource = createAudioResource(url, { inlineVolume: true })

        connection.subscribe(player)

        connection.on(VoiceConnectionStatus.Ready, () => {
            this.console.info(`Connected to voice channel [${userVoiceChannel.name}]`)

            this.console.info(`Playing audio [${url}] in [${userVoiceChannel.name}]`)

            try {
                player.play(resource)
            } catch (error) {
                console.error(error)
            }
        })

        connection.on(VoiceConnectionStatus.Disconnected, (oldState, newState) => {
            this.disconnectFromVoiceChannel(connection, newState)
        })

        player.on(VoiceConnectionStatus.Idle, (oldState, newState) => {
            this.disconnectFromVoiceChannel(connection, newState)
        })

        await interaction.reply(`🔊 Playing [${url}] in [${userVoiceChannel.name}]`)
    }
}