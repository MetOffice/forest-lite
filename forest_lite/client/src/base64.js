

// URL and file name safe base64 to standard base64
export const URLSafeToBase64 = text => {
    return text.replace(/-/g, '+')
               .replace(/_/g, '/')
}


// URL and file name safe base64 from standard base64
export const base64ToURLSafe = text => {
    return text.replace(/\+/g, '-')
               .replace(/\//g, '_')
}
