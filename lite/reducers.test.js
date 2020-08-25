const { rootReducer } = require("./src/reducers.js")
const {
    setColorbar,
    setHoverTool,
    fetch_image,
    fetch_image_success
} = require("./src/actions.js")


test.each([
    [ {type: "DUMMY"}, {} ],
    [ setHoverTool(true), { hover_tool: true } ],
    [ setHoverTool(false), { hover_tool: false } ],
    [ setColorbar(true), { colorbar: true } ],
    [ setColorbar(false), { colorbar: false } ],
    [ fetch_image("/uri"), { is_fetching: true, image_url: "/uri" } ],
    [ fetch_image_success(), { is_fetching: false } ],
])("%o -> %o", (action, expected) => {
    expect(rootReducer({}, action)).toEqual(expected)
})
