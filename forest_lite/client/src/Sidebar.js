import React, { useState } from "react"
import { connect, useSelector, useDispatch } from "react-redux"
import { setFlag } from "./actions.js"
import "./Sidebar.css"
import Tab from "./Tab.js"
import Nav from "./Nav.js"
import DatasetsMenu from "./DatasetsMenu.js"


class Label extends React.Component {
    render() {
        return <div className="label">{ this.props.children }</div>
    }
}

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
    return (<div className="layer-menu-container">
            <div className="tab__header">
                <TabChoice active={ tabName === "datasets" }
                           onClick={ showTab("datasets") }>
                    Layer
                </TabChoice>
            </div>
            <Tab active={ tabName === "datasets" } >
                <DatasetsMenu />
                <Nav baseURL={ baseURL } />
                <Label>Coastlines, borders, lakes</Label>
                <fieldset>
                    <CoastlinesToggle />
                </fieldset>
            </Tab>
    </div>)
}


const CoastlinesToggle = () => {
    const selector = ({ coastlines: active = true }) => active
    const active = useSelector(selector)
    const dispatch = useDispatch()
    const onChange = ev => {
        const action = setFlag({
            coastlines: ev.target.checked
        })
        dispatch(action)
    }
    return (<Item key="coastlines"
                  checked={ active }
                  onChange={ onChange }>Coastlines</Item>)

}


const Item = (props) => {
    const { checked, onChange, children } = props
    return (
        <div>
            <label>
                <input
                    type="checkbox"
                    checked={ checked }
                    onChange={ onChange } />
                { children }
            </label>
        </div>
    )
}


const mapStateToProps = state => {
    const { datasets: items = [] } = state
    return { items }
}


export default connect(mapStateToProps)(Sidebar)
