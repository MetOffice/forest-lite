const { rootReducer } = require("./src/reducers.js")
const actions = require("./src/actions.js")


test("reducer given dummy action returns state", () => {
    let action = {type: "DUMMY"}
    expect(rootReducer({}, action)).toEqual({})
})

test("reducer given setHoverTool", () => {
    let action = actions.setHoverTool(true)
    expect(rootReducer({}, action)).toEqual({hover_tool: true})
})

test("reducer given setColorbar", () => {
    let action = actions.setColorbar(true)
    expect(rootReducer({}, action)).toEqual({colorbar: true})
})
