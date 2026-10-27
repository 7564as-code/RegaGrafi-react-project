import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Tag from "../components/ui/Tag";
import "./HomePage.css";

const perks = ["פרסום חינם", "התראה במייל", "צ׳אט ישיר"];

const steps = [
    { color: "var(--color-primary)", title: "מפרסמים מודעה", text: "כותבים מה צריך, כמה דחוף ומה התקציב. לוקח דקה." },
    { color: "var(--color-coral)", title: "גרפיקאיות שולחות הצעות", text: "גרפיקאיות פנויות שולחות הצעה עם מחיר וזמן אספקה." },
    { color: "var(--color-teal)", title: "בוחרים ומדברים בצ׳אט", text: "פותחים צ׳אט, מחליפים פרטי קשר ומתחילים לעבוד." },
];

const sample = [
    { tag: "לוגו", urgent: "עד היום", title: "לוגו לעסק חדש", text: "עסק קטן בתחום האוכל.", price: "₪400", time: "לפני 3 דקות" },
    { tag: "באנר", urgent: "", title: "באנר לעיתון הקהילה", text: "שלושה גדלים למבצע.", price: "₪250", time: "לפני 12 דקות" },
];

export default function HomePages() {
    return (
        <main className="home">
            <section className="home__hero">
                <div className="home__intro">
                    <h1 className="home__title">
                        גרפיקאית זמינה
                        <span>ברגע שצריך.</span>
                    </h1>
                    <p className="home__lead">
                        פרסמי מודעה, וגרפיקאיות פניות מגיבות תוך דקות.<br />
                        בלי פרויקטים גדולים ובלי המתנה.
                    </p>

                    <div className="home__actions">
                        <Link to="/post"><Button text="אני צריכה עבודה גרפית" size="large" /></Link>
                        <Link to="/signUp"><Button text="אני גרפיקאית פנויה" size="large" color="var(--color-surface)" textColor="var(--color-ink)" borderColor="var(--color-ink)" /></Link>
                    </div>

                    <ul className="home__perks">
                        {perks.map((p) => <li key={p}>{p}</li>)}
                    </ul>
                </div>

                <div className="home__visual" aria-hidden="true">
                    <div className="home__circle" />
                    {sample.map((s, i) => (
                        <div className={`home__job home__job--${i + 1}`} key={s.title}>
                            <div className="home__job-tags">
                                <Tag text={s.tag} />
                                {s.urgent && <Tag text={s.urgent} color="var(--color-coral-soft)" textColor="var(--color-coral)" />}
                            </div>
                            <h3 className="home__job-title">{s.title}</h3>
                            <p className="home__job-text">{s.text}</p>
                            <div className="home__job-footer">
                                <span className="home__job-price">{s.price}</span>
                                <span className="home__job-time">{s.time}</span>
                            </div>
                        </div>
                    ))}
                    <span className="home__available"><i />פנויה עכשיו</span>
                </div>
            </section>

            <section className="home__how">
                <h2 className="home__how-title">איך זה עובד?</h2>
                <div className="home__steps">
                    {steps.map((s, i) => (
                        <div className="home__step" key={s.title}>
                            <div className="home__step-head">
                                <span className="home__step-num" style={{ background: s.color }}>{i + 1}</span>
                                <h3 className="home__step-title">{s.title}</h3>
                            </div>
                            <p className="home__step-text">{s.text}</p>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    )
}
