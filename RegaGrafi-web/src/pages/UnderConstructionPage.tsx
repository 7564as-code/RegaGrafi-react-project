import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import "./UnderConstructionPage.css";

export default function UnderConstructionPage() {
    return (
        <main className="construction">
            <div className="construction__art" aria-hidden="true">
                <div className="construction__circle" />
                <span className="construction__dot construction__dot--coral" />
                <span className="construction__dot construction__dot--teal" />
                <span className="construction__dot construction__dot--yellow" />

                <div className="construction__window">
                    <div className="construction__bar">
                        <i /><i /><i />
                    </div>
                    <div className="construction__body">
                        <span className="construction__line construction__line--long" />
                        <span className="construction__line" />
                        <span className="construction__line construction__line--short" />
                    </div>
                </div>

                <svg className="construction__gear" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3.2" />
                    <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M18.7 5.3L17 7M7 17l-1.7 1.7" />
                    <circle cx="12" cy="12" r="6.6" />
                </svg>
            </div>

            <h1 className="construction__title">
                הדף עדיין
                <span>בבנייה</span>
            </h1>
            <p className="construction__text">
                אנחנו עובדות על זה במרץ ובקרוב הכל יהיה מוכן.<br />
                תחזרו לכאן עוד כמה ימים!
            </p>

            <div className="construction__progress" aria-hidden="true">
                <i /><i /><i />
            </div>

            <Link to="/"><Button text="חזרה לדף הבית" size="large" /></Link>
        </main>
    )
}
