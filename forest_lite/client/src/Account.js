import React, { useState } from "react"


const Account = () => {
    const [ name, setName ] = useState("Bloggs, Joe")
    const [ email, setEmail ] = useState("joe.bloggs@example.com")
    const styles = {
        container: {
            display: "grid",
            justifyContent: "center",
            margin: "1em",
            fontFamily: "Helvetica"
        },
        label: {
            fontWeight: "bold",
            fontSize: "0.9em",
            color: "#333",
            display: "block"
        },
        section: {
            marginTop: "1em",
        },
        h1: {
            fontWeight: "100"
        }
    }
    return (
        <div style={ styles.container }>
            <div>
                <h1 style={ styles.h1 }>Account information</h1>
                <div style={ styles.section }>
                    <span style={ styles.label }>Name</span>
                    { name }
                </div>
                <div style={ styles.section }>
                    <span style={ styles.label}>Contact</span>
                    { email }
                </div>
            </div>
        </div>
    )
}


export default Account
