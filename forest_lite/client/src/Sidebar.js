import React, { useState } from "react"
import { connect } from "react-redux"
import "./Sidebar.css"
import Tab from "./Tab.js"
import Nav from "./Nav.js"
import DatasetsMenu from "./DatasetsMenu.js"
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
    //                <div className="Sidebar__row">
    //                    <DatasetsMenu />
    //                    <ShowLayer />
    //                </div>
    //                <Nav baseURL={ baseURL } />
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
