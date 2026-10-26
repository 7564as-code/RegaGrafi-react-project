import { NavLink } from "react-router-dom";
import Button from "../ui/Button";
import "./Header.css";
import { useSignOut } from "../../hook/signOut";
import { useAuth } from "../../hook/useAuth";

function Header() {
  const signOutMutation = useSignOut()
  const { user, isPending } = useAuth()
  return (
    <header className="header">
      <div className="header__inner">
        <NavLink to="/" end className="header__logo">
          <img className="header__logo-img" src="/logo.png" alt="רגע גרפי" />
        </NavLink>

        <nav className="header__nav">
          <ul className="header__links">
            <li><NavLink to="/" end>דף הבית</NavLink></li>
            <li><NavLink to="/how-it-works">איך זה עובד</NavLink></li>
             <li><NavLink to="/designers">גרפיקאיות</NavLink></li>
             {user&&
            <li><NavLink to="/jobs">לוח מודעות</NavLink></li>}
            {user&&
            <li><NavLink to="/post">פרסום מודעה</NavLink></li>}
          </ul>
        </nav>

        {!isPending &&
          <div className="header__actions">

            {user ?
              <Button text="התנתקות" color="#FF6A55" size="small" onClick={() => signOutMutation.mutate()} disabled={signOutMutation.isPending} />
              : <>
                <NavLink to="/login"> <Button text="התחברות" color="#ffffff" textColor="#000000" borderColor="#000000" size="small" /></NavLink>
                <NavLink to="/signUp"> <Button text="הרשמה" color="#6c47ff" size="small" /></NavLink></>}



          </div>
        }
      </div>
    </header>
  );
}

export default Header;