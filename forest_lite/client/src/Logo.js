import React from "react"


export const Logo = ({ width="100%", mode="light" }) => {
    let stroke = "#333"
    let beamWidth = 6
    let beamStroke
    if (mode === "light") {
        beamStroke = "#333"
    } else {
        beamStroke = "white"
    }
    return (
        <svg style={{ width, height: "100%" }} viewBox="0 0 200 200" >
            {/* Top left beam */}
            <line x1="21"
                  y1="15"
                  x2="69"
                  y2="35"
                  stroke={ beamStroke }
                  strokeWidth={ beamWidth }
                  strokeLinecap="round" />
            {/* Top right beam */}
            <line x1="178"
                  y1="15"
                  x2="130"
                  y2="35"
                  stroke={ beamStroke }
                  strokeWidth={ beamWidth }
                  strokeLinecap="round" />
            {/* Bottom left beam */}
            <line x1="21"
                  y1="58"
                  x2="69"
                  y2="35"
                  stroke={ beamStroke }
                  strokeWidth={ beamWidth }
                  strokeLinecap="round" />
            {/* Bottom right beam */}
            <line x1="178"
                  y1="58"
                  x2="130"
                  y2="35"
                  stroke={ beamStroke }
                  strokeWidth={ beamWidth }
                  strokeLinecap="round" />
            {/* Trunk base coat */}
            <polygon
                     points="40,188 160,188 130,50 70,50"
                     stroke={ stroke }
                     strokeWidth="2"
                     fill="white" />
            {/* Stripes */}
            {/* Bottom */}
            <polygon points="46,165 154,165 150,145 50,145"
                     fill="lightskyblue" />
            {/* Middle */}
            <polygon points="54,125 146,125 142,105 58,105"
                     fill="lightskyblue" />
            {/* Top */}
            <polygon points="67,65 133,65 138,85 62,85"
                     fill="lightskyblue" />
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
                  stroke="#333"
                  strokeWidth="2"
                  fill="yellow" />
            {/* Bottom lintel rectangle */}
            <rect x="65"
                  y="47"
                  rx="4"
                  ry="4"
                  width="70"
                  height="5"
                  stroke="#333"
                  strokeWidth="1"
                  fill="white" />
            {/* Top rectangle */}
            <polygon
                  points="70,15 70,22 130,22 130,15 100,10"
                  stroke="#333"
                  strokeWidth="2"
                  fill="white" />
            {/* Top lintel rectangle */}
            <rect x="62"
                  y="20"
                  rx="4"
                  ry="4"
                  width="74"
                  height="5"
                  stroke="#333"
                  strokeWidth="1"
                  fill="white" />
        </svg>
    )
}
