import { evolve, map } from "ramda"


/**
 * Map index to phase life description
 */
export const transformPhaseLife = index => [
    "Triggering",
    "Triggering from split",
    "Growing",
    "Mature",
    "Decaying"
][index]


/**
 * Convert geojson.features[i].properties.PhaseLife to string
 */
export const editPhaseLife = evolve({
    features: map(evolve({
        properties: {
            PhaseLife: transformPhaseLife
        }
    }))
})
