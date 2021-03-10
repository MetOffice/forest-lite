const { rootReducer, toggleActiveReducer } = require("../src/reducers.js")
const {
    set_datasets,
    set_limits,
    setHoverTool,
    setColorbar,
    setContours,
    setFigure,
    setActive,
    setOnlyActive,
    toggleActive,
    nextItem,
    previousItem,
    setItems,
    goToItem,
    setQuadkeys,
    updateNaturalEarthFeature,
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

    describe("given same variable multiple times", () => {
        const dataset = "Dataset"
        const state = {
            datasets: [
                { label: dataset }
            ]
        }
        const actions = [
            toggleActive({ dataset, data_var: "A" }),
            toggleActive({ dataset, data_var: "A" })
        ]
        const actual = reduce(toggleActiveReducer, state, actions)
        const expected = {
            datasets: [
                {
                    label: dataset,
                    active: {
                        A: false
                    }
                }
            ]
        }
        expect(actual).toEqual(expected)
    })
})


describe("setOnlyActive", () => {
    describe("given action", () => {
        const dataset = "Dataset"
        const data_var = "Variable"
        const state = {
            datasets: [
                { label: dataset }
            ]
        }
        const action = setOnlyActive({ dataset, data_var })
        const actual = rootReducer(state, action)
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
            toggleActive({ dataset, data_var: "C" }),
            setOnlyActive({ dataset, data_var: "A" })
        ]
        const actual = reduce(rootReducer, state, actions)
        const expected = {
            datasets: [
                {
                    label: dataset,
                    active: {
                        A: true,
                        B: false,
                        C: false
                    }
                }
            ]
        }
        expect(actual).toEqual(expected)
    })

    describe("given same variable in multiple datasets", () => {
        const state = {
            datasets: [
                { label: "Foo" },
                { label: "Bar" }
            ]
        }
        const actions = [
            setOnlyActive({ dataset: "Foo", data_var: "Name" }),
            setOnlyActive({ dataset: "Bar", data_var: "Name" })
        ]
        const actual = reduce(rootReducer, state, actions)
        const expected = {
            datasets: [
                { label: "Foo", active: { Name: false } },
                { label: "Bar", active: { Name: true } },
            ]
        }
        expect(actual.datasets[1]).toEqual(expected.datasets[1])
        expect(actual.datasets[0]).toEqual(expected.datasets[0])
    })
})


test("set_datasets replaces existing datasets", () => {
    const actions = [
        set_datasets([ 1, 2 ]),
        set_datasets([ 1 ]),
    ]
    const actual = reduce(rootReducer, {}, actions)
    const expected = {
        datasets: [ 1 ]
    }
    expect(actual).toEqual(expected)
})


test("nextItem", () => {
    const state = {
        navigate: {
            Foo: {
                Bar: {
                    Qux: {
                        before: [],
                        current: 0,
                        after: [1, 2, 3]
                    }
                }
            }
        }
    }
    const actions = [
        nextItem([ "navigate", "Foo", "Bar", "Qux" ]),
    ]
    const actual = reduce(rootReducer, state, actions)
    const expected = {
        navigate: {
            Foo: {
                Bar: {
                    Qux: {
                        before: [0],
                        current: 1,
                        after: [2, 3]
                    }
                }
            }
        }
    }
    expect(actual).toEqual(expected)
})


test("setItems", () => {
    const state = {}
    const items = [1, 2, 3]
    const action = setItems([ "navigate", "Foo", "Bar", "Qux" ], items)
    const actual = rootReducer(state, action)
    const expected = {
        navigate: {
            Foo: {
                Bar: {
                    Qux: {
                        before: [],
                        current: 1,
                        after: [2, 3]
                    }
                }
            }
        }
    }
    expect(actual).toEqual(expected)
})


test("goToItem", () => {
    const state = {
        navigate: {
            Foo: {
                Bar: {
                    Qux: {
                        before: [],
                        current: "A",
                        after: ["B", "C"]
                    }
                }
            }
        }
    }
    const actions = [
        goToItem([ "navigate", "Foo", "Bar", "Qux" ], "C"),
    ]
    const actual = reduce(rootReducer, state, actions)
    const expected = {
        navigate: {
            Foo: {
                Bar: {
                    Qux: {
                        before: ["A", "B"],
                        current: "C",
                        after: []
                    }
                }
            }
        }
    }
    expect(actual).toEqual(expected)
})


test("goToItem support ints", () => {
    const state = {
        navigate: {
            Foo: {
                Bar: {
                    Qux: {
                        before: [],
                        current: 0,
                        after: [1, 2]
                    }
                }
            }
        }
    }
    const actions = [
        goToItem([ "navigate", "Foo", "Bar", "Qux" ], "2"),
    ]
    const actual = reduce(rootReducer, state, actions)
    const expected = {
        navigate: {
            Foo: {
                Bar: {
                    Qux: {
                        before: [0, 1],
                        current: 2,
                        after: []
                    }
                }
            }
        }
    }
    expect(actual).toEqual(expected)
})

test("previousItem", () => {
    const state = {
        navigate: {
            Foo: {
                Bar: {
                    Qux: {
                        before: [0],
                        current: 1,
                        after: [2, 3]
                    }
                }
            }
        }
    }
    const actions = [
        previousItem([ "navigate", "Foo", "Bar", "Qux" ]),
    ]
    const actual = reduce(rootReducer, state, actions)
    const expected = {
        navigate: {
            Foo: {
                Bar: {
                    Qux: {
                        before: [],
                        current: 0,
                        after: [1, 2, 3]
                    }
                }
            }
        }
    }
    expect(actual).toEqual(expected)
})


// Create, read, update and delete Natural Earth Features
describe("NaturalEarthFeature CRUD operations", () => {
    test("update an empty natural earth feature", () => {
        const feature = "coastlines"
        const quadkey = "0123"
        const data = {
            xs: [],
            ys: []
        }
        const action = updateNaturalEarthFeature({ feature, quadkey, data })
        const state = {
            natural_earth_features: {
                "0123": null
            }
        }
        const actual = reduce(rootReducer, state, [ action ])
        const expected = {
            natural_earth_features: {
                "0123": {
                    coastlines: {
                        xs: [],
                        ys: []
                    }
                }
            }
        }
        expect(actual).toEqual(expected)
    })

    test("update a realistic natural earth feature", () => {
        const feature = "coastlines"
        const quadkey = "0123"
        const data = {
            xs: [[1, 2], [3]],
            ys: [[4, 5], [6]]
        }
        const action = updateNaturalEarthFeature({ feature, quadkey, data })
        const state = {
            natural_earth_features: {
                "0123": null
            }
        }
        const actual = reduce(rootReducer, state, [ action ])
        const expected = {
            natural_earth_features: {
                "0123": {
                    coastlines: {
                        xs: [[1, 2], [3]],
                        ys: [[4, 5], [6]],
                    }
                }
            }
        }
        expect(actual).toEqual(expected)
    })

    test("update two natural earth features", () => {
        const feature = "coastlines"
        const data = {
            xs: [[1]],
            ys: [[2]]
        }
        const actions = [
            setQuadkeys(["0", "42"]),
            updateNaturalEarthFeature({ feature, quadkey: "0", data }),
            updateNaturalEarthFeature({ feature, quadkey: "42", data })
        ]
        const state = {}
        const actual = reduce(rootReducer, state, actions)
        const expected = {
            natural_earth_features: {
                "0": {
                    coastlines: {
                        xs: [[1]],
                        ys: [[2]],
                    }
                },
                "42": {
                    coastlines: {
                        xs: [[1]],
                        ys: [[2]],
                    }
                }
            }
        }
        expect(actual).toEqual(expected)
    })

    test("set quadkeys", () => {
        const feature = "coastlines"
        const actions = [
            setQuadkeys(["00", "01", "10", "11"])
        ]
        const state = {}
        const actual = reduce(rootReducer, state, actions)
        const expected = {
            natural_earth_features: {
                "00": null,
                "01": null,
                "10": null,
                "11": null
            }
        }
        expect(actual).toEqual(expected)
    })

    test("set quadkeys preserves previous tiles", () => {
        const feature = "coastlines"
        const actions = [
            setQuadkeys(["00", "01"])
        ]
        const state = {
            natural_earth_features: {
                "00": { foo: "bar" }
            }
        }
        const actual = reduce(rootReducer, state, actions)
        const expected = {
            natural_earth_features: {
                "00": { foo: "bar" },
                "01": null,
            }
        }
        expect(actual).toEqual(expected)
    })

    test("set quadkeys removes previous tiles", () => {
        const feature = "coastlines"
        const actions = [
            setQuadkeys(["123"])
        ]
        const state = {
            natural_earth_features: {
                "00": { foo: "bar" }
            }
        }
        const actual = reduce(rootReducer, state, actions)
        const expected = {
            natural_earth_features: {
                "123": null,
            }
        }
        expect(actual).toEqual(expected)
    })
    test("update natural earth feature given existing key", () => {
        const feature = "coastlines"
        const quadkey = "0123"
        const data = {
            xs: [[1, 2], [3]],
            ys: [[4, 5], [6]]
        }
        const action = updateNaturalEarthFeature({ feature, quadkey, data })
        const state = {
            natural_earth_features: {
                "0123": null
            }
        }
        const actual = reduce(rootReducer, state, [ action ])
        const expected = {
            natural_earth_features: {
                "0123": {
                    coastlines: {
                        xs: [[1, 2], [3]],
                        ys: [[4, 5], [6]],
                    }
                }
            }
        }
        expect(actual).toEqual(expected)
    })
    test("update natural earth feature if no key present", () => {
        const feature = "coastlines"
        const quadkey = "0123"
        const data = {
            xs: [[1, 2], [3]],
            ys: [[4, 5], [6]]
        }
        const action = updateNaturalEarthFeature({ feature, quadkey, data })
        const state = {
            natural_earth_features: {}
        }
        const actual = reduce(rootReducer, state, [ action ])
        const expected = {
            natural_earth_features: {}
        }
        expect(actual).toEqual(expected)
    })

})
