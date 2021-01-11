import { inStandardBase64 } from "./base64"


// Convert JSON Web Token (JWT) to data structure
export const parseToken = token => {
    // payload in URL safe base64 encoding
    const payloadURLSafeBase64 = token.split(".")[1]
    return JSON.parse(window.atob(inStandardBase64(payloadURLSafeBase64)))
}
