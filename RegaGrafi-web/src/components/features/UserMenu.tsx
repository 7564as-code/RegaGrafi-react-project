import { useState } from "react"
import { useSignOut } from "../../hook/signOut"
import { useAuth } from "../../hook/useAuth"


export default function UserMenu(){
const signOutMutation = useSignOut()
  const { user, isPending } = useAuth()
  const [menu,setmenu]=useState(false)
  return <div className="user-menu">
    <button onClick={() => setmenu(prev => !prev)}>{user?.display_name||"שלום לך"}</button>
    {menu&&<ul>
        <li> <button color="#FF6A55" onClick={() => signOutMutation.mutate()} disabled={signOutMutation.isPending} >התנתקות</button> </li>
      
    </ul>}
  </div>
}