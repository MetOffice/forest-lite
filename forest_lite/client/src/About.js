import React from "react"
import { Logo } from "./Logo.js"
import "./About.css"


export const About = () => {
    return (
    <div className="About__container">
        <div className="About__text">
        <h1>About</h1>
        <p>FOREST-Lite is a lightweight implementation
           of the FOREST concept</p>
        </div>
        <div className="About__logo"><Logo /></div>
    </div>
)
}
