const { rootReducer } = require("./src/reducers.js")
const {
    setHoverTool,
    setColorbar
} = require("./src/actions.js")


const dummy = () => ({ type: "DUMMY" })


describe("rootReducer(action, state)", () => {
    test.each`
      action | state
      ${ dummy() } | ${ {} }
      ${ setHoverTool(true) } | ${ { hover_tool: true } }
      ${ setColorbar(true) } | ${ { colorbar: true } }
    `("given $action returns $state", ({ action, state }) => {
        expect(rootReducer({}, action)).toEqual(state)
    })
})
