import { URLSafeToBase64 } from "./base64"


// Convert JSON Web Token (JWT) to data structure
export const parseToken = token => {
    // payload in URL safe base64 encoding
    const payloadBase64URL = token.split(".")[1]
    return JSON.parse(window.atob(URLSafeToBase64(payloadBase64URL)))
}
