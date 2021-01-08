
// Simulate JWT token encoding
const fakeEncodeToken = payload => {
    const header = { alg: "KMS", typ: "JWT" }
    const parts = [header, payload, "signature"].map(encodePart)
    return parts.join(".")
}


const encodePart = data => {
    return base64ToURLSafe(window.btoa(JSON.stringify(data)))
}


// URL and file name safe base64 from standard base64
const base64ToURLSafe = text => {
    return text.replace(/\+/g, '-')
               .replace(/\//g, '_')
}


// URL and file name safe base64 to standard base64
const URLSafeToBase64 = text => {
    return text.replace(/-/g, '+')
               .replace(/_/g, '/')
}


// Get value encoded in cookie
const getCookieValue = (cookie, key) => {
    const obj = cookie
                    .split(";")
                    .reduce((acc, statement) => {
                        const [ key, value ] = statement.split("=")
                        acc[key.trim()] = value.trim()
                        return acc
                    }, {})
    return obj[key]
}


// Parse JSON Web Token (JWT)
const parseToken = token => {
    // payload in URL safe base64 encoding
    const payloadBase64URL = token.split(".")[1]
    return JSON.parse(window.atob(URLSafeToBase64(payloadBase64URL)))
}


// Realistic Cookie
const example = {
    header: "eyJhbGciOiJLTVMiLCJ0eXAiOiJKV1QifQ",
    payload: "eyJhdXRoX3RpbWUiOjE2MTAxMTIwNTAsImVtYWlsIjoiam9lLnNtaXRoQGVtYWlsLmNvbSIsIm5hbWUiOiJTbWl0aCwgSm9lIiwiZ2l2ZW5fbmFtZSI6IkpvZSIsImZhbWlseV9uYW1lIjoiU21pdGgiLCJncm91cHMiOlsiZm9vIiwiYmFyIl0sImlhdCI6MTYxMDExMjA1MSwiZXhwIjoxNjEwMTE1NjUyfQ",
    signature: "Fake"
}
const realisticCookie = [
    "TOKEN",
    [ example.header, example.payload, example.signature ].join(".")
].join("=")


test.each`
    cookie | key | expected
    ${ "TOKEN=Value" } | ${ "TOKEN" } | ${ "Value" }
    ${ "TOKEN=Value; Foo=Bar" } | ${ "Foo" } | ${ "Bar" }
`("getCookieValue", ({ cookie, key, expected }) => {
    const actual = getCookieValue(cookie, key)
    expect(actual).toEqual(expected)
})


test("parseToken given realistic cookie", () => {
    const token = getCookieValue(realisticCookie, "TOKEN")
    const actual = parseToken(token)
    expect(Object.keys(actual)).toEqual([
        "auth_time",
        "email",
        "name",
        "given_name",
        "family_name",
        "groups",
        "iat",
        "exp"
    ])
    expect(actual.auth_time).toEqual(1610112050)
    expect(actual.email).toEqual("joe.smith@email.com")
    expect(actual.name).toEqual("Smith, Joe")
    expect(actual.given_name).toEqual("Joe")
    expect(actual.family_name).toEqual("Smith")
    expect(actual.groups).toEqual(["foo", "bar"])
    expect(actual.iat).toEqual(1610112051)
    expect(actual.exp).toEqual(1610115652)
})


test("encodePart", () => {
    // Fake JWT claim
    const data = {
        auth_time: 1610112050,
        email: "joe.smith@email.com",
        name: "Smith, Joe",
        given_name: "Joe",
        family_name: "Smith",
        groups: [ "foo", "bar" ],
        iat: 1610112051,
        exp: 1610115652
    }
    const actual = encodePart(data)
    const expected = example.payload + "==" // Real JWT trims = sign
    expect(actual).toEqual(expected)
})


test("encode decoded token", () => {
    const token = getCookieValue(realisticCookie, "TOKEN")
    const payload = parseToken(token)
    const actual = fakeEncodeToken(payload).split(".")[1]
    const realPayload = realisticCookie.split(".")[1]
    // Pad payload with '=' chars
    const expected = realPayload + "=".repeat(realPayload.length % 4)
    expect(actual).toEqual(expected)
})


test("fakeEncodeToken", () => {
    const data = { foo: "bar" }
    const actual = fakeEncodeToken(data)
    const expected = [
        "eyJhbGciOiJLTVMiLCJ0eXAiOiJKV1QifQ==",
        "eyJmb28iOiJiYXIifQ==",
        "InNpZ25hdHVyZSI=",
    ].join(".")
    expect(actual).toEqual(expected)
})


test.each`
    text       | expected
    ${ "foo" } | ${ "foo" }
    ${ "-" }   | ${ "+" }
    ${ "_" }   | ${ "/" }
`("URLSafeToBase64('$text') -> '$expected'", ({ text, expected }) => {
    expect(URLSafeToBase64(text)).toEqual(expected)
})


test.each`
    text       | expected
    ${ "foo" } | ${ "foo" }
    ${ "+" }   | ${ "-" }
    ${ "/" }   | ${ "_" }
`("base64ToURLSafe('$text') -> '$expected'", ({ text, expected }) => {
    expect(base64ToURLSafe(text)).toEqual(expected)
})
