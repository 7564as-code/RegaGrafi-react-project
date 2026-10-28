import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <img className="footer__logo" src="/logo.png" alt="רגע גרפי" />
        <nav className="footer__links" aria-label="קישורים בתחתית העמוד">
          <Link to="/">דף הבית</Link>
          <Link to="/designers">גרפיקאיות</Link>
          <Link to="/jobs">לוח מודעות</Link>
        </nav>
        <p className="footer__copy">© {new Date().getFullYear()} רגע גרפי</p>
      </div>
    </footer>
  );
}
