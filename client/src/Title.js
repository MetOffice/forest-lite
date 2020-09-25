import React from "react"
import { connect } from "react-redux"
import "./Title.css"


class Title extends React.Component {
    render() {
        return <div className="title">{ this.props.content }</div>
    }
}

const mapStateToProps = state => {
    const { times, time_index } = state
    if (typeof time_index === "undefined") return { content: "" }
    if (typeof times === "undefined") return { content: "" }
    const time = new Date(times[time_index])
    return { content: time.toUTCString() }
}


export default connect(mapStateToProps)(Title)
