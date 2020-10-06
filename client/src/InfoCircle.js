import React from "react"
import "./Info.css"


const InfoCircle = ({ children }) => {
    return (
        <div className="info-circle">
            <i className="fas fa-info-circle"></i>
            { children }
        </div>
    )
}


export default InfoCircle
