import React, { useState } from "react"
import { connect } from "react-redux"
import "./Sidebar.css"
import "./Tab.css"
import "./Nav.css"
import "./Select.css"
import "./DatasetsMenu.css"
import Hamburger from "./Hamburger.js"

const Sidebar = ({ baseURL, children }) => {
    const [ isOpen, setOpen ] = useState(true)
    const onClick = ev => {
        ev.preventDefault()
        setOpen(!isOpen)
    }
    let className = "Sidebar--hidden"
    if (isOpen) {
        className = "Sidebar--visible"
    }
    return (<div className="layer-menu-container">
            <Hamburger onClick={ onClick } />
            <div className={ className }>
                    { children }
            </div>
    </div>)
}


const mapStateToProps = state => {
    const { datasets: items = [] } = state
    return { items }
}


export default connect(mapStateToProps)(Sidebar)
