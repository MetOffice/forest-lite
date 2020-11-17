import { curry, map, toString } from "ramda"

// Immutable list navigation
export const moveForward = zipper => {
    const data = zipper
    if (data.after.length === 0) {
        if (data.before.length === 0) {
            return { ...data }
        }
        return {
            before: [],
            current: data.before[0],
            after: data.before.slice(1).concat(data.current)
        }
    }
    return {
        before: data.before.concat(data.current),
        current: data.after[0],
        after: data.after.slice(1)
    }
}
export const moveBackward = zipper => {
    let { before, current, after } = zipper
    if (before.length === 0) {
        let items = toList(zipper)
        return {
            before: items.slice(0, -1),
            current: items.slice(-1).pop(),
            after: []
        }
    }
    return {
        before: before.slice(0, -1),
        current: before.slice(-1).pop(),
        after: [ current ].concat(after)
    }
}
export const fromList = items => {
    return {
        before: [],
        current: items[0],
        after: items.slice(1)
    }
}
export const toList = zipper => {
    const data = zipper
    return data.before.concat(data.current).concat(data.after)
}
export const goToIndex = (index, zipper) => {
    const values = toList(zipper)
    return {
        before: values.slice(0, index),
        current: values[index],
        after: values.slice(index + 1)
    }
}
export const goTo = curry((item, zipper) => {
    const items = toList(zipper)
    let index = items.indexOf(item)
    if (index === -1) {
        // Perhaps int to string comparison?
        index = map(toString)(items).indexOf(item)
    }
    return goToIndex(index, zipper)
})
