const {
    editPhaseLife,
    transformPhaseLife
} = require("../src/edit-phase-life.js")


test.each`
  index | label
  ${0} | ${"Triggering"}
  ${1} | ${"Triggering from split"}
  ${2} | ${"Growing"}
  ${3} | ${"Mature"}
  ${4} | ${"Decaying"}

`("$index -> $label", ({ index, label }) => {
    const actual = transformPhaseLife(index)
    const expected = label
    expect(actual).toEqual(expected)
})


test("editPhaseLife", () => {
    const geojson = {
        features: [
            { properties: { PhaseLife: 0 } },
            { properties: { PhaseLife: 1 } }
        ]
    }
    const actual = editPhaseLife(geojson)
    const expected = {
        features: [
            { properties: { PhaseLife: "Triggering" } },
            { properties: { PhaseLife: "Triggering from split" } },
        ]
    }
    expect(actual).toEqual(expected)
})

test("editPhaseLife preserves properties", () => {
    const geojson = {
        features: [
            { properties: { PhaseLife: 0, NbPosLightning: 0 } },
        ]
    }
    const actual = editPhaseLife(geojson)
    const expected = {
        features: [
            { properties: { PhaseLife: "Triggering", NbPosLightning: 0 } },
        ]
    }
    expect(actual).toEqual(expected)
})
