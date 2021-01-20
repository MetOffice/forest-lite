import React, { useState } from "react"
import { getCookieValue } from "./cookie"
import { inStandardBase64 } from "./base64"


/**
 * JWT React hook
 */
export const useJWTClaim = cookieKey => {
    const token = getCookieValue(document.cookie, cookieKey)
    let initialValue = {}
    if (typeof token !== "undefined") {
        initialValue = parseToken(token)
    }
    const [ claim, setClaim ] = useState(initialValue)
    return claim
}

// Convert JSON Web Token (JWT) to data structure
export const parseToken = token => {
    // payload in URL safe base64 encoding
    const payloadURLSafeBase64 = token.split(".")[1]
    return JSON.parse(window.atob(inStandardBase64(payloadURLSafeBase64)))
}
