/**
 * Select quadkeys object from Redux state
 *
 * @returns array of quadkeys
 */
export const selectQuadkeys = state => {
    const { natural_earth_features={} } = state
    return Object.keys(natural_earth_features)
}

