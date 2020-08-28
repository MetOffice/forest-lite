const { rootReducer } = require("./src/reducers.js")
const {
    setHoverTool,
    setColorbar,
    setContours,
    setViewport
} = require("./src/actions.js")


const dummy = () => ({ type: "DUMMY" })


describe("rootReducer(action, state)", () => {
    test.each`
      action | state
      ${ dummy() } | ${ {} }
      ${ setHoverTool(true) } | ${ { hover_tool: true } }
      ${ setColorbar(true) } | ${ { colorbar: true } }
      ${ setContours(true) } | ${ { contours: true } }
      ${ setViewport([0, 0, 1, 1]) } | ${ { viewport: [0, 0, 1, 1] } }
    `("given $action.type $action.payload returns $state",
        ({ action, state }) => {
        expect(rootReducer({}, action)).toEqual(state)
    })
})
