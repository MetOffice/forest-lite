import React, { useState } from "react"
import { connect } from "react-redux"
import "./Sidebar.css"
import Tab from "./Tab.js"
import Nav from "./Nav.js"
import CoastlineMenu from "./CoastlineMenu.js"
import DatasetsMenu from "./DatasetsMenu.js"
import Hamburger from "./Hamburger.js"


const TabChoice = ({ children, onClick, active=false }) => {
    const className = `tab__choice ${active ? "tab__choice--active": ""}`
    return (
        <div className={ className } onClick={ onClick }>{ children }</div>
    )
}

const Sidebar = ({ baseURL }) => {
    const [ tabName, setTabName ] = useState("datasets")
    const showTab = tabName => () => {
        setTabName(tabName)
    }
    const onClick = ev => {
        ev.preventDefault()
        alert("Hamburger")
    }
    return (<div className="layer-menu-container">
            <Hamburger onClick={ onClick } />
            <div className="tab__header">
                <TabChoice active={ tabName === "datasets" }
                           onClick={ showTab("datasets") }>
                    Layer
                </TabChoice>
            </div>
            <Tab active={ tabName === "datasets" } >
                <DatasetsMenu />
                <Nav baseURL={ baseURL } />
                <CoastlineMenu />
            </Tab>
    </div>)
}


const mapStateToProps = state => {
    const { datasets: items = [] } = state
    return { items }
}


export default connect(mapStateToProps)(Sidebar)
