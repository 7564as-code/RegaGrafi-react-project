import {useMutation,useQueryClient} from "@tanstack/react-query"
import {useNavigate} from "react-router-dom"
import { signOut } from "../api/auth"


export function useSignOut(){
const queryClient =useQueryClient()
const navigate=useNavigate()

const mutation=useMutation({mutationFn:signOut,onSuccess:()=>{queryClient.resetQueries()
    navigate("/login")},onError:()=>{alert("ההתנקות נכשלה נסי שוב!")}})



return mutation
}