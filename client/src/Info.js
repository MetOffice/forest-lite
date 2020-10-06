import React from "react"
import "./Info.css"


const Info = ({ children }) => {
    return (
        <div className="info-circle">
            <i className="fas fa-info-circle"></i>
            <div className="info-box">{ children }</div>
        </div>
    )
}


export default Info
