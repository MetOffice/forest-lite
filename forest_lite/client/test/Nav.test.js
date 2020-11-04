import { selectDatasets, selectActive } from "../src/Nav.js"


test("selectDatasets", () => {
    const actual = selectDatasets({})
    const expected = []
    expect(actual).toEqual(expected)
})


test("selectDatasets given realistic data", () => {
    const content = [
        {key: "value"}
    ]
    const actual = selectDatasets({ datasets: content })
    const expected = content
    expect(actual).toEqual(expected)
})


test("selectActive", () => {
    const dataset = {
        label: "Label",
        datasetId: 42,
        active: { foo: false, bar: true }
    }
    const actual = selectActive({ datasets: [
        dataset
    ] })
    const expected = [
        {
            label: "Label",
            id: 42,
            dataVar: "bar"
        }
    ]
    expect(actual).toEqual(expected)
})
