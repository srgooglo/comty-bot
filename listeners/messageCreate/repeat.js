export default async (message) => {
    if (message.author.bot || message.system) {
        return false
    }

    //await message.reply(`Hi!`)
}