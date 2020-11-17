import {
    set_times,
    set_time_index,
    next_time_index,
    updateNavigate
} from "../src/actions.js"
import { createStore } from "../src/create-store.js"
import * as Zipper from "../src/zipper.js"


// TODO: Remove this test and animation middleware
test.skip("dispatch next time index action", () => {
    const store = createStore()
    const actions = [
        set_times([ 1, 2, 3 ]),
        set_time_index(1),
        next_time_index()
    ]
    actions.map(store.dispatch)
    const actual = store.getState()
    const expected = {
        times: [1, 2, 3],
        time_index: 2
    }
    expect(actual).toEqual(expected)
})


test("updateNavigate", () => {
    const store = createStore()
    const actions = [
        updateNavigate({
            datasetName: "Foo",
            dataVar: "Bar",
            dimension: "Baz",
            value: Zipper.fromList([ "Qux" ])
        })
    ]
    actions.map(store.dispatch)
    const actual = store.getState()
    const expected = {
        navigate: {
            Foo: {
                Bar: {
                    Baz: {
                        before: [],
                        current: "Qux",
                        after: []
                    }
                }
            }
        }
    }
    expect(actual).toEqual(expected)
})
