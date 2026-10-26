import type { ReactNode } from "react"
import { useAuth } from "../../hook/useAuth"
import { Navigate } from "react-router-dom"

type prop={
    children:ReactNode
}

export default function ProtectedRoute({children}:prop) {
    const {user,isPending}=useAuth()

    if(isPending)
      return  <p>טוען...</p>
    if(!user)
      return  <Navigate to="/login" replace></Navigate>
    return<>
    {children}
    </>
}
