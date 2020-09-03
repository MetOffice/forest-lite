const { rootReducer } = require("./src/reducers.js")
const {
    setHoverTool,
    setColorbar,
    setContours,
    setFigure
} = require("./src/actions.js")


const dummy = () => ({ type: "DUMMY" })


describe("rootReducer(action, state)", () => {
    test.each`
      action | state
      ${ dummy() } | ${ {} }
      ${ setHoverTool(true) } | ${ { hover_tool: true } }
      ${ setColorbar(true) } | ${ { colorbar: true } }
      ${ setContours(true) } | ${ { contours: true } }
    `("given $action.type $action.payload returns $state",
        ({ action, state }) => {
        expect(rootReducer({}, action)).toEqual(state)
    })
})


test("setFigure", () => {
    const props = {
        x_range: { start: 0, end: 2 },
        y_range: { start: 1, end: 3 },
    }
    const action = setFigure(props)
    const actual = rootReducer({}, action)
    const expected = {
        figure: {
            x_range: { start: 0, end: 2 },
            y_range: { start: 1, end: 3 },
        }
    }
    expect(actual).toEqual(expected)
})
