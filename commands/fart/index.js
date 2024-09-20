const FART_AUDIO_REPOSITORY = [
    "https://storage.ragestudio.net/gose-uploads/fartrepo/fart1.wav",
    "https://storage.ragestudio.net/gose-uploads/fartrepo/fart2.wav",
    "https://storage.ragestudio.net/gose-uploads/fartrepo/fart3.wav",
    "https://storage.ragestudio.net/gose-uploads/fartrepo/fart4.wav",
    "https://storage.ragestudio.net/gose-uploads/fartrepo/fart5.wav",
    "https://storage.ragestudio.net/gose-uploads/fartrepo/fart6.wav",
    "https://storage.ragestudio.net/gose-uploads/fartrepo/fart7.wav",
    "https://storage.ragestudio.net/gose-uploads/fartrepo/fart8.wav",
    "https://storage.ragestudio.net/gose-uploads/fartrepo/fart9.wav",
    "https://storage.ragestudio.net/gose-uploads/fartrepo/fart10.wav",
]

export default {
    name: "fart",
    description: "Give a fart",
    fn: async (interaction) => {
        const randomFart = FART_AUDIO_REPOSITORY[Math.floor(Math.random() * FART_AUDIO_REPOSITORY.length)]

        return await interaction.reply({
            content: `Here!`,
            files: [randomFart]
        })
    }
}