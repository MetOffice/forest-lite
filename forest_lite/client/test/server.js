import { rest } from "msw"
import { setupServer } from "msw/node"
import { handlers } from "../src/mocks/handlers.js"


const server = setupServer(...handlers)
export { server, rest }
