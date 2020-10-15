const { rootReducer, toggleActiveReducer } = require("../src/reducers.js")
const {
    set_limits,
    setHoverTool,
    setColorbar,
    setContours,
    setFigure,
    setActive,
    toggleActive
} = require("../src/actions.js")
const { reduce } = require("ramda")


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


test("setActive", () => {
    const action = setActive({ id: 1, flag: true })
    const state = { datasets: [{id: 0}, {id: 1}] }
    const actual = rootReducer(state, action)
    const expected = {
        datasets: [
            {id: 0},
            {id: 1, active: true}
        ]
    }
    expect(actual).toEqual(expected)
})


describe("setLimits", () => {
    test("given high, low values", () => {
        const state = {}
        const action = set_limits({ low: 100, high: 200 })
        const actual = rootReducer(state, action)
        const expected = {
            limits: {
                low: 100,
                high: 200
            }
        }
        expect(actual).toEqual(expected)
    })


    test("given datasetId, dataVar", () => {
        const state = {}
        const action = set_limits({
            low: 100,
            high: 200,
            path: [1, "air_temperature"]
        })
        const actual = rootReducer(state, action)
        const expected = {
            limits: {
                1: {
                    air_temperature: {
                        low: 100,
                        high: 200
                    }
                }
            }
        }
        expect(actual).toEqual(expected)
    })
})


describe("toggleActiveReducer", () => {
    describe("given toggleActive action", () => {
        const dataset = "Dataset"
        const data_var = "Variable"
        const state = {
            datasets: [
                { label: dataset }
            ]
        }
        const action = toggleActive({ dataset, data_var })
        const actual = toggleActiveReducer(state, action)
        const expected = {
            datasets: [
                {
                    label: dataset,
                    active: { Variable: true }
                }
            ]
        }
        expect(actual).toEqual(expected)
    })

    describe("given multiple variables", () => {
        const dataset = "Dataset"
        const state = {
            datasets: [
                { label: dataset }
            ]
        }
        const actions = [
            toggleActive({ dataset, data_var: "A" }),
            toggleActive({ dataset, data_var: "B" }),
            toggleActive({ dataset, data_var: "C" })
        ]
        const actual = reduce(toggleActiveReducer, state, actions)
        const expected = {
            datasets: [
                {
                    label: dataset,
                    active: {
                        A: false,
                        B: false,
                        C: true
                    }
                }
            ]
        }
        expect(actual).toEqual(expected)
    })
})
