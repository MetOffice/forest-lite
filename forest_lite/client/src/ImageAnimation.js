import { ImageFn } from "../extension"

/**
 * Usage: <ImageAnimation figure={ figure } />
 */

// Make an ImageFn glyph_renderer for a figure
const ImageAnimation = ({figure}) => {
    useEffect(() => {
        const color_mapper = new Bokeh.LinearColorMapper({
            low: 0,
            high: 2,
            palette: ["red", "green", "blue"]
        })
        const source = new Bokeh.ColumnDataSource({
            data: {
                x: [5009377.085697312],
                y: [-7.450580596923828e-09],
                dw: [626172.1357121617],
                dh: [626172.1357121654],
                image: [
                    [[0, 1],
                     [2, 3]]
                ],
                compute: [
                    (p) => {
                        console.log(p)
                        let N = 256
                        let values = []
                        for (let i=0; i<N; i++) {
                            values.push([])
                            for (let j=0; j<N; j++) {
                                values[i].push(p % 3)
                            }
                        }
                        return values
                    }
                ]
            }
        })
        const args = {
            x: { field: "x" },
            y: { field: "y" },
            dw: { field: "dw" },
            dh: { field: "dh" },
            image: { field: "image" },
            fn: { field: "compute" },
            color_mapper: color_mapper,
            source: source
        }
        const renderer = figure._glyph.bind(figure)(
            ImageFn,
            "color_mapper,image,rows,cols,x,y,dw,dh,fn",
            [args])

        // Simplistic game loop
        let initial = null
        let last = 0
        let counter = 0
        const gameLoop = time => {
            if (initial == null) {
                initial = time
            }
            const elapsed = time - initial
            const sinceLastFrame = time - last
            last = time

            // Re-compute source.fn[i](parameter)
            renderer.glyph.parameter = counter
            counter += 1

            if (elapsed < 60 * 1000) {
                window.requestAnimationFrame(gameLoop)
            }
        }
        window.requestAnimationFrame(gameLoop)
    }, [])
    return null
}

