/**
 * Get value encoded in cookie
 *
 * Parses cookie syntax 'x=y ; a=b'
 */
export const getCookieValue = (cookieText, variableName) => {
    const statements = cookieText.split(";")
                                 .filter(validStatement)
                                 .map(parseStatement)
    const mapping = statements.reduce((accum, statement) => {
                        const [ identifier, value ] = statement
                        accum[identifier] = value
                        return accum
                    }, {})
    return mapping[variableName]
}


const validStatement = statement => statement.indexOf("=") !== -1


const parseStatement = statement => {
    const [ key, value ] = statement.split("=")
    return [ key.trim(), value.trim() ]
}
