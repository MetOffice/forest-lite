import React from "react"
import "./Hamburger.css"


const Hamburger = ({ onClick }) => {
    return (
        <div className="Hamburger" onClick={ onClick }>
            <div className="Hamburger__line" />
            <div className="Hamburger__line" />
            <div className="Hamburger__line" />
        </div>
    )
}


export default Hamburger
