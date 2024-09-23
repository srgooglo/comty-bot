export default (currentPoints, levelsList) => {
    console.log(`[FILTER] Searching target level for ${currentPoints} points on list >`, levelsList)

    const filtered = levelsList.filter((obj) => obj.points <= currentPoints)

    console.log(`[FILTER] Filtered levels >`, filtered)

    return filtered[filtered.length - 1]
}