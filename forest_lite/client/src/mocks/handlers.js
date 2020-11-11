/**
 * Mock REST API suitable for testing with Mock Service Worker
 */
import { rest } from "msw"


export const handlers = [
    rest.get(/base\/datasets\/undefined/, async (req, res, ctx) => {
        const errorMessage = "Bad endpoint"
        return res(
            ctx.status(500),
            ctx.json({ errorMessage })
        )
    }),

    rest.get(/base/, async (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                data: [ 0 ],
                attrs: {
                    standard_name: "time"
                }
            })
        )
    }),

    rest.get("*", (req, res, ctx) => {
        return res(
            ctx.status(500),
            ctx.json({
                errorMessage: "Not sure how to handle this"
            })
        )
    })
]
