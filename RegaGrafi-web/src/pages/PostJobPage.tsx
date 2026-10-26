import { useForm } from "react-hook-form"
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import type { jobFormType } from "../types/jobsType";
import { usePostJob } from "../hook/useJobs";
import "./PostJobPage.css";


const categories = [
    { value: "logo", label: "לוגו" },
    { value: "flyer", label: "פלייר" },
    { value: "banner", label: "באנר" },
    { value: "ad", label: "מודעה" },
    { value: "video", label: "וידאו" },
    { value: "other", label: "אחר" },
] as const;
export default function PostJobPage() {



    const postJobMutation = usePostJob()
    const { register, handleSubmit, formState: { errors } } = useForm<jobFormType>();

    const onSubmit = handleSubmit((data) => postJobMutation.mutate(data))

    const steps = [
        { icon: "✉", color: "var(--color-primary)", title: "מקבלת מייל על כל הצעה חדשה", text: "כולל קישור ישיר למודעה שלך" },
        { icon: "bolt", color: "var(--color-coral)", title: "בוחרת הצעה ופותחת צ׳אט", text: "ביניכן, על המודעה עצמה" },
        { icon: "✓", color: "var(--color-teal)", title: "מחליפות פרטי קשר", text: "וממשיכות לעבוד כמו שנוח לכן" },
    ];

    return (
        <main className="post-job">
            <section className="post-job__card">
                <h1 className="post-job__title">פרסום מודעה</h1>

                <form className="post-job__form" onSubmit={onSubmit}>
                    <TextField type="text" label="כותרת" error={errors.title?.message}
                        {...register("title", {
                            required: "שכחת לכתוב כותרת:)", minLength:
                                { value: 3, message: "הכותרת חייבת להכיל לפחות שלושה תווים" }, maxLength: { value: 150, message: "הכותרת מכילה עד 150 תווים" }, validate: { value: (v) => v.trim().length > 2 ? true : "הכותרת חייבת להכיל לפחות שלושה תווים" }
                        })} />
                    <TextField
                        label="תיאור העבודה"
                        multiline
                        error={errors.description?.message}
                        {...register("description", {
                            required: "חסר תיאור",
                            maxLength: {
                                value: 1500,
                                message: "התיאור יכול להכיל עד 1500 תווים"
                            }, validate: { value: (v) => v.trim().length > 2 ? true : "התיאור חייב להכיל לפחות שלושה תווים" }
                        })}
                    />

                    <div className="post-job__row">
                        <div className={`field${errors.category ? " field--error" : ""}`}>
                            <label className="field__label" htmlFor="category">סוג העבודה</label>
                            <select
                                id="category"
                                className="field__input field__select"
                                {...register("category", {
                                    required: "יש לבחור קטגוריה",
                                })}
                            >
                                <option value="">בחרי קטגוריה</option>

                                {categories.map((category) => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>

                            {errors.category && (
                                <p className="field__error">{errors.category.message}</p>
                            )}
                        </div>
                        <TextField label="תקציב" type="number" error={errors.budget?.message}
                            {...register("budget", { min: { value: 0.1, message: "התקציב חייב להיות מעל ה-0" }, setValueAs: (v) => v == "" ? undefined : Number(v) })} />
                    </div>
                    <TextField
                        label="דדליין"
                        type="date"
                        error={errors.deadline?.message}
                        {...register("deadline", {
                            setValueAs: (v) =>
                                v === "" ? undefined : new Date(`${v}T00:00:00`).toISOString(),

                            validate: (value) => {
                                if (!value) return true;

                                const today = new Date();
                                today.setHours(0, 0, 0, 0);

                                const selectedDate = new Date(value);

                                return (
                                    selectedDate > today ||
                                    "יש לבחור תאריך עתידי, החל ממחר"
                                );
                            }
                        })}
                    />

                    <Button text="שליחה" size="large" full disabled={postJobMutation.isPending || postJobMutation.isSuccess} />
                    {postJobMutation.isError && <p className="post-job__error">השליחה נכשלה, נסו שוב😔</p>}
                </form>
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
