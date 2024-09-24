export default (currentPoints, levelsList) => {
    // sort levels ascending from lower
    levelsList = levelsList.sort((a, b) => a.points - b.points)

    console.log(`[FILTER] Searching target level for [${currentPoints}] points on list >`, levelsList)

    levelsList = levelsList.filter((obj) => obj.points <= currentPoints)

    console.log(`[FILTER] Filtered levels >`, levelsList)

    const targetLevel = levelsList[levelsList.length - 1]

    console.log(`[FILTER] Target level >`, targetLevel)

    return targetLevel
}