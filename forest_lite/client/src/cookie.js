/**
 * Get value encoded in cookie
 *
 * Parses cookie syntax 'x=y ; a=b'
 */
export const getCookieValue = (cookieText, variableName) => {
    const statements = cookieText.split(";")
    const mapping = statements.reduce((accum, statement) => {
                        const [ key, value ] = statement.split("=")
                        accum[key.trim()] = value.trim()
                        return accum
                    }, {})
    return mapping[variableName]
}
