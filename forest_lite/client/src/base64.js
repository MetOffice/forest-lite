/**
 * Standard base 64 representation
 *
 * Ensures character mappings for 62 and 63 map to + and /
 */
export const inStandardBase64 = text => {
    return text.replace(/-/g, '+')
               .replace(/_/g, '/')
}


/**
 * URL and file name safe base64 representation
 *
 * '+' and '/' characters have special meanings for file systems
 * and URLs. They're replaced with hyphen and underscore.
 */
export const inURLSafeBase64 = text => {
    return text.replace(/\+/g, '-')
               .replace(/\//g, '_')
}
