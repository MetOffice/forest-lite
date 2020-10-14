const { over, lensProp, not } = require("ramda")

test("toggle boolean given lens", () => {
    const actual = over(lensProp("prop"), not, {})
    expect(actual).toEqual({ prop: true })
})
