export default (lastInteraction, earning) => {
    if (!lastInteraction) {
        return false
    }
    if (!earning.cooldown) {
        return false
    }

    const lastDate = new Date(lastInteraction.date)
    const now = new Date()
    const remaining = earning.cooldown - (now - lastDate)

    if (remaining > 0) {
        return true
    }

    return false
}