export default {
    description: "Sum 2 numbers",
    options: [
        {
            type: "NUMBER",
            name: "number",
            description: "First number",
            required: true
        },
        {
            type: "NUMBER",
            name: "number2",
            description: "Second number",
            required: true
        }
    ],
    fn: async (interaction) => {
        const number = interaction.options.getNumber("number")
        const number2 = interaction.options.getNumber("number2")

        if (number === 9 && number2 === 10) {
            return await interaction.reply("🤓 9 + 10 = 21... naanaa u stupid")
        }

        return await interaction.reply(`🤓 ${number} + ${number2} = ${number + number2}`)
    }
}