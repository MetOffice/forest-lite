
// TODO: Convert to pure function
export const editPhaseLife = geojson => {
    geojson.features = geojson.features.map((o) => {
        o.properties.PhaseLife = o.properties.PhaseLife.toString()
        return o
    })
    return geojson
}
