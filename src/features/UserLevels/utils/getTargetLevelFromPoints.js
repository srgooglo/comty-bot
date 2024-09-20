export default (currentPoints, levelsList) => {
    const filtered = levelsList.filter((obj) => obj.points <= currentPoints)

    return filtered[filtered.length - 1]
}