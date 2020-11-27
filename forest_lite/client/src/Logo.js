import React from "react"


export const Logo = ({ width="100%", mode="logo" }) => {
    let stroke = "#333"
    let beamWidth = 6
    let beamFill = "yellow"
    let beamStroke = "#333"
    let beamStrokeWidth = 1
    let lightFill = "yellow"
    let trunkFill = "white"
    let stripeFill = "lightskyblue"
    if (mode === "icon") {
        stroke = "white"
        beamStroke = "white"
        beamStrokeWidth = 6
        beamFill = "white"
        trunkFill = "white"
        stripeFill = "black"
        lightFill = "black"
    }
    return (
        <svg style={{ width, height: "100%" }} viewBox="0 0 200 200" >
            {/* Left beam */}
            <polygon
                  points="21,15 69,35 21,58"
                  fill={ beamFill }
                  stroke={ beamStroke }
                  strokeWidth={ beamStrokeWidth } />
            {/* Right beam */}
            <polygon
                  points="178,15 130,35 178,58"
                  fill={ beamFill }
                  stroke={ beamStroke }
                  strokeWidth={ beamStrokeWidth } />
            {/* Trunk base coat */}
            <polygon
                     points="40,188 160,188 130,50 70,50"
                     stroke={ stroke }
                     strokeWidth="2"
                     fill={ trunkFill } />
            {/* Stripes */}
            {/* Bottom */}
            <polygon points="46,165 154,165 150,145 50,145"
                     fill={ stripeFill } />
            {/* Middle */}
            <polygon points="54,125 146,125 142,105 58,105"
                     fill={ stripeFill } />
            {/* Top */}
            <polygon points="67,65 133,65 138,85 62,85"
                     fill={ stripeFill } />
            {/* Trunk outline */}
            <polygon
                     points="40,188 160,188 130,50 70,50"
                     stroke={ stroke }
                     strokeWidth="2"
                     fillOpacity="0"
                     fill="transparent" />
            {/* Lightbulb rectangle */}
            <rect x="70"
                  y="22"
                  width="60"
                  height="26"
                  stroke={ stroke }
                  strokeWidth="2"
                  fill={ lightFill } />
            {/* Bottom lintel rectangle */}
            <rect x="65"
                  y="47"
                  rx="4"
                  ry="4"
                  width="70"
                  height="5"
                  stroke={ stroke }
                  strokeWidth="1"
                  fill="white" />
            {/* Top rectangle */}
            <polygon
                  points="70,15 70,22 130,22 130,15 100,10"
                  stroke={ stroke }
                  strokeWidth="2"
                  fill="white" />
            {/* Top lintel rectangle */}
            <rect x="62"
                  y="20"
                  rx="4"
                  ry="4"
                  width="74"
                  height="5"
                  stroke={ stroke }
                  strokeWidth="1"
                  fill="white" />
        </svg>
    )
}
