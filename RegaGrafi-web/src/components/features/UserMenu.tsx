import { useEffect, useRef, useState } from "react"
import { useSignOut } from "../../hook/signOut"
import { useAuth } from "../../hook/useAuth"
import { Link } from "react-router-dom"
import "./UserMenu.css"


export default function UserMenu(){
const signOutMutation = useSignOut()
  const { user} = useAuth()
  const [menu,setmenu]=useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menu) return
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setmenu(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setmenu(false) }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [menu])

  return <div className="user-menu" ref={menuRef}>
    <button
      type="button"
      className="user-menu__avatar"
      aria-label="תפריט משתמש"
      aria-haspopup="menu"
      aria-expanded={menu}
      onClick={() => setmenu(prev => !prev)}
    >
      {user?.display_name?.trim().charAt(0) || "?"}
    </button>

    {menu && <div className="user-menu__list" role="menu">
      <div className="user-menu__who">
        <span className="user-menu__name">{user?.display_name}</span>
        {user?.email && <span className="user-menu__email">{user.email}</span>}
      </div>

      <Link to="/profile" className="user-menu__item" role="menuitem" onClick={() => setmenu(false)}>
        <svg className="user-menu__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
        עדכון פרטים
      </Link>

      <button
        type="button"
        className="user-menu__item user-menu__item--danger"
        role="menuitem"
        onClick={() => signOutMutation.mutate()}
        disabled={signOutMutation.isPending}
      >
        <svg className="user-menu__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
        התנתקות
      </button>
    </div>}
  </div>
}
