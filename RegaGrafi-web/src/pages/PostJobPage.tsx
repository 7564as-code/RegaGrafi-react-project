import { usePostJob } from "../hook/useJobs";
import "./PostJobPage.css";
import JobForm from "../components/features/JobForm";


export default function PostJobPage() {

    const steps = [
        { icon: "✉", color: "var(--color-primary)", title: "מקבלת מייל על כל הצעה חדשה", text: "כולל קישור ישיר למודעה שלך" },
        { icon: "bolt", color: "var(--color-coral)", title: "בוחרת הצעה ופותחת צ׳אט", text: "ביניכן, על המודעה עצמה" },
        { icon: "✓", color: "var(--color-teal)", title: "מחליפות פרטי קשר", text: "וממשיכות לעבוד כמו שנוח לכן" },
    ];

    const {mutate,isPending,isError,error,isSuccess}=usePostJob()

    return (
        <main className="post-job">
            <section className="post-job__card">
                <h1 className="post-job__title">פרסום מודעה</h1>
<JobForm onSubmit={mutate} isError={isError} error={error} isPending={isPending||isSuccess} text="פרסם מודעה"/>
            </section>

            <aside className="after">
                <h2 className="after__title">מה קורה אחרי שפרסמת?</h2>

                {steps.map((s) => (
                    <div className="after__step" key={s.title}>
                        <div className="after__icon" style={{ background: s.color }}>
                            {s.icon === "bolt" ? <svg width="18" height="22" viewBox="0 0 18 22" fill="currentColor"><path d="M11 0L0 13h7l-2 9 11-13H9z" /></svg> : s.icon}
                        </div>
                        <div className="after__content">
                            <h3 className="after__step-title">{s.title}</h3>
                            <p className="after__step-text">{s.text}</p>
                        </div>
                    </div>
                ))}
            </aside>
        </main>
    )
}
