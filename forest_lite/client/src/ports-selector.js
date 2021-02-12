/**
 * Select ports object from Redux state
 *
 * @returns ports object or null
 */
export const selectPorts = state => {
    const { ports=null } = state
    return ports
}
