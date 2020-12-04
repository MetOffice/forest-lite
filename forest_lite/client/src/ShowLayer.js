import React, { useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setVisible } from "./actions.js"
import "./ShowLayer.css"


const selectVisible = ({ visible = true }) => visible


const ShowLayer = () => {
    const visible = useSelector(selectVisible)
    const dispatch = useDispatch()
    const onClick = useCallback(ev => {
        ev.preventDefault()
        dispatch(setVisible(!visible))
    }, [ visible ])
    let className
    if (visible) {
        className = "fas fa-eye"
    } else {
        className = "fas fa-eye-slash"
    }
    return (
            <button onClick={ onClick } className="ShowLayer__button" aria-label="visible">
                <i className={ className } />
            </button>)
}


export default ShowLayer
