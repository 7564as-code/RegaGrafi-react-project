import { useContext } from "react";
import { UserContext } from "../context/AuthContext";


export function useAuth(){
   const context= useContext(UserContext)

   if(context===undefined)
    throw new Error("useAuth חייב להיות בתוך UserProvider");
    return context
}