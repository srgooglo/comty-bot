export default (currentLevelObj, levelsList) => {
    const nextLevel = levelsList.find((lvl) => lvl.level === currentLevelObj.level + 1)

    return nextLevel.points - currentLevelObj.points
}