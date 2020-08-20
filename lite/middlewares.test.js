const { toolMiddleware } = require("./src/middlewares.js")
const { toggleColorbar, setColorbar } = require("./src/actions.js")


test("toggle middleware", () => {
    const store = {
        getState: () => {
            return { colorbar: true }
        }
    }
    const mockNext = jest.fn()
    const action = toggleColorbar()
    toolMiddleware(store)(mockNext)(action)

    const expected = setColorbar(false)
    expect(mockNext.mock.calls.length).toEqual(1)
    expect(mockNext.mock.calls[0][0]).toEqual(expected)
})


test("toggle middleware given ordinary action", () => {
    const store = {
        getState: () => {
            return { colorbar: true }
        }
    }
    const mockNext = jest.fn()
    const action = { type: "DUMMY" }
    toolMiddleware(store)(mockNext)(action)
    expect(mockNext.mock.calls[0][0]).toEqual(action)
})
