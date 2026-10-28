import { useState } from "react"
import { useSignOut } from "../../hook/signOut"
import { useAuth } from "../../hook/useAuth"
import { useNavigate } from "react-router-dom"


export default function UserMenu(){
const signOutMutation = useSignOut()
const navigate=useNavigate()
  const { user} = useAuth()
  const [menu,setmenu]=useState(false)
  return <div className="user-menu">
    <button onClick={() => setmenu(prev => !prev)}>{user?.display_name||"שלום לך"}</button>
    {menu&&<ul>
        <li> <button color="#FF6A55" onClick={() => signOutMutation.mutate()} disabled={signOutMutation.isPending} >התנתקות</button> </li>
              <li> <button color="#FF6A55" onClick={() => navigate('/profile')}>עדכון פרטים</button> </li>

    </ul>}
  </div>
}