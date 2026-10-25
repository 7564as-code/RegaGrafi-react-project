import type { authType } from "../types/authType";
import { supabase } from "../lib/supabase"

export async function signIn({password,email}:authType) {
const {error}=await supabase.auth.signInWithPassword({email,password}) 
if (error)
throw error

} 


export async function signUp({password,email}:authType) {
    const {error,data}=await supabase.auth.signUp({email,password}) 
       if (error)
 throw error
return data


}

export async function signOut() {
    const {error}=await supabase.auth.signOut() 
       if (error)
 throw error


}