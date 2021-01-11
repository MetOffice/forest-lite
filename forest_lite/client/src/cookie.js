

// Get value encoded in cookie
export const getCookieValue = (cookie, key) => {
    const obj = cookie
                    .split(";")
                    .reduce((acc, statement) => {
                        const [ key, value ] = statement.split("=")
                        acc[key.trim()] = value.trim()
                        return acc
                    }, {})
    return obj[key]
}
