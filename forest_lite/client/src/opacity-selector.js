/**
 * Select opacity from Redux state
 *
 * @returns number
 */
export const selectOpacity = state => {
    const { opacity=1 } = state
    return opacity
}
