export default (type) => {
    switch (type) {
        case "STRING":
            return "addStringOption"
        case "NUMBER":
            return "addNumberOption"
        case "BOOLEAN":
            return "addBooleanOption"
        case "USER":
            return "addUserOption"
        case "CHANNEL":
            return "addChannelOption"
        case "ROLE":
            return "addRoleOption"
        case "MENTIONABLE":
            return "addMentionableOption"
        default:
            return null
    }
}