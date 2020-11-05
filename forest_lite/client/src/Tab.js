import React from "react"
import "./Tab.css"


const Tab = ({ children, active=false }) => {
    return <div className={ active ? "": "hidden" }>{ children }</div>
}


export default Tab
