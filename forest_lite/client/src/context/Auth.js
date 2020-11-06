import { createContext, useContext } from "react"


// Authentication Context
export const AuthContext = createContext()


// Authentication Context Hook
export const useAuth = () => useContext(AuthContext)
