import React from "react"
import { useSelector } from "react-redux"
import "./Title.css"


const Title = ({ content }) => {
    content = useSelector(state => {
        const { times, time_index } = state
        if (typeof time_index === "undefined") return null
        if (typeof times === "undefined") return null
        const time = new Date(times[time_index])
        return time.toUTCString()
    })
    if (content === null) return null
    return <div className="title">{ content }</div>
}


export default Title
