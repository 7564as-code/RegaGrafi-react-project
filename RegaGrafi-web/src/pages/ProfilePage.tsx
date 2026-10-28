import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form"
import type { profileFormType } from "../types/userType"
import { useAuth } from "../hook/useAuth";
import TextField from "../components/ui/TextField";
import { useUpdateMe } from "../hook/useMe";
import Button from "../components/ui/Button";
import { getErrorInfo } from "../lib/errorInfo";
import "./AuthPage.css";
import "./ProfilePage.css";



export default function ProfilePage() {
    const { user } = useAuth()
    const { mutate, isError, error, isPending, isSuccess } = useUpdateMe()

    const navigate = useNavigate()
    useEffect(() => {
        if (!isSuccess) return
        const timer = setTimeout(() => navigate("/jobs"), 1500)
        return () => clearTimeout(timer)
    }, [isSuccess, navigate])

    const { register, handleSubmit, formState: { errors } } = useForm<profileFormType>({ defaultValues: { display_name: user?.display_name, portfolio_url: user?.portfolio_url ?? "" } });
    return (
        <main className="auth">
            <section className="auth__card">
                <div className="profile__head">
                    <div className="profile__avatar" aria-hidden="true">{user?.display_name?.trim().charAt(0)}</div>
                    <div>
                        <h1 className="auth__title">עדכון פרטים אישיים</h1>
                        {user?.email && <p className="auth__subtitle">{user.email}</p>}
                    </div>
                </div>
                <form className="auth__form" onSubmit={handleSubmit((data) => mutate(data))} >
                    <TextField label="שם" error={errors.display_name?.message}
                        {...register("display_name", {
                            required: "שכחת לכתוב שם:)", minLength:
                                { value: 3, message: "השם חייבת להכיל לפחות שלושה תווים" }, maxLength: { value: 30, message: "השם מכיל עד 30 תווים" }, validate: { value: (v) => v.trim().length > 2 ? true : "שם חייב להכיל לפחות שלושה תווים" }
                        })}></TextField>
                    <TextField
                        label="קישור לתיק עבודות"
                        placeholder="https://"
                        error={errors.portfolio_url?.message}
                        {...register("portfolio_url", {
                            pattern: {
                                value: /^https?:\/\//,
                                message: "הקישור חייב להתחיל ב-http:// או ב-https://",
                            },
                            setValueAs: (v) => v.trim() === "" ? null : v.trim(),
                        })}
                    />
                    <Button text={isPending ? "מעדכן..." : "עדכון"} size="large" full disabled={isPending || isSuccess} ></Button>
                    {isError && <p className="auth__server-error" role="alert">{getErrorInfo(error).title}</p>}
                    {isSuccess && <p className="profile__success" role="status">הפרטים עודכנו בהצלחה</p>}
                </form>
            </section>

            <aside className="auth__promo">
                <h2 className="auth__promo-title">
                    הפרופיל שלך,
                    <span>כרטיס הביקור שלך.</span>
                </h2>
                <ul className="auth__promo-list">
                    <li>שם ברור שמפרסמות יזהו</li>
                    <li>קישור לתיק עבודות שמדבר בעד עצמו</li>
                    <li>אפשר לעדכן בכל רגע</li>
                </ul>
            </aside>
        </main>
    )
}
