import { server, rest } from "./server.js"


beforeAll(() => server.listen())
afterAll(() => server.close())
afterEach(() => server.resetHandlers())


// fetch doesn't throw errors on status code (e.g. 500) only if
// the network can't process the request
test("understand fetch error handling", async () => {
    const errorMessage = "Not sure how to handle this"
    server.use(
        rest.get(/foo/, async (req, res, ctx) => {
            return res(
                ctx.status(500),
                ctx.json({ errorMessage })
            )
        })
    )

    // Send GET HTTP request to mock service worker
    await fetch("/foo")
        .then(response => {
            if (!response.ok) {
                // Error handling
                expect(response.ok).toBe(false)
            }
            return response.json()
        })
        .then(json => {
            expect(json).toEqual({ errorMessage })
        })
})
