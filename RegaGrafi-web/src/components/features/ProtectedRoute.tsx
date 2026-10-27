import type { ReactNode } from "react"
import { useAuth } from "../../hook/useAuth"
import { Navigate } from "react-router-dom"
import StatusMessage from "../ui/StatusMessage"

type prop={
    children:ReactNode
}

export default function ProtectedRoute({children}:prop) {
    const {user,isPending}=useAuth()

    if(isPending)
      return  <StatusMessage variant="loading" title="טוען..." />
    if(!user)
      return  <Navigate to="/login" replace></Navigate>
    return<>
    {children}
    </>
}
