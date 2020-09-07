import { evolve, map, toString } from "ramda"


/**
 * Convert geojson.features[i].properties.PhaseLife to string
 */
export const editPhaseLife = evolve({
    features: map(evolve({
        properties: {
            PhaseLife: toString
        }
    }))
})
