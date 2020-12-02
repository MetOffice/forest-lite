import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { setFlag } from "./actions.js"
import "./CoastlineMenu.css"


const CoastlineMenu = () => {
    // TODO: implement variable resolution refresh button
    // <RefreshButton />
    return (<>
        <div className="label">Coastlines, borders and lakes</div>
        <div>
            <fieldset>
                <CoastlinesToggle />
            </fieldset>
        </div>
    </>)
}


const RefreshButton = () => {
    return (
        <button aria-label="refresh">
            <i className="fas fa-sync"></i>
        </button>
    )
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
    return (
            <label>
                <input
                    type="checkbox"
                    checked={ active }
                    onChange={ onChange } />
                Coastlines
            </label>
    )

}


export default CoastlineMenu
