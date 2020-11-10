/**
 * Mock REST API suitable for testing with Mock Service Worker
 */
import { rest } from "msw"


export const handlers = [
    // intercept all GET requests
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
            ctx.status(200),
            ctx.json({
                hello: "World!"
            })
        )
    })
]
