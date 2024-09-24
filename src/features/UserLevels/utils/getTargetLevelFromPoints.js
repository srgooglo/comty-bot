export default (currentPoints, levelsList) => {
    console.log(`[FILTER] Searching target level for ${currentPoints} points on list >`, levelsList)

    let filtered = levelsList.filter((obj) => obj.points <= currentPoints)

    // filter levels ascending from lower
    filtered = filtered.sort((a, b) => a.points - b.points)

    console.log(`[FILTER] Filtered levels >`, filtered)

    return filtered[filtered.length - 1]
}