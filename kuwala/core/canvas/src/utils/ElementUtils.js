export function getElementById (elements, elementId) {
    try {
        return elements.find((el) => el.id === elementId);
    } catch (error) {
        console.error(`Couldn't find element with id ${elementId}`)
    }
}

export function getElementByIds (elements, elementIds) {
    try {
        return elements.filter((el) => elementIds.includes(el.id));
    } catch (error) {
        console.error(`Couldn't find element with ids ${elementIds}`)
    }
}