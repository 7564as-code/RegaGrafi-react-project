import { useForm } from "react-hook-form"
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import type { authType } from "../types/authType";
import { signIn } from "../api/auth"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query";
import "./AuthPage.css";
export default function LoginPage() {
    const queryClient=useQueryClient()
    const navigate = useNavigate()
    const [serverError, setServerError] = useState("")
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<authType>();
    const onSubmit = handleSubmit(async (data) => {
        setServerError("")
        try {
            await signIn(data)
           await queryClient.invalidateQueries({queryKey:["user"]})
            navigate("/jobs")
        }
        catch {
            setServerError("אימייל או סיסמה שגויים")
        }
    })


    return (
        <main className="auth">
            <section className="auth__card">
                <h1 className="auth__title">התחברות</h1>
                <p className="auth__subtitle">טוב לראות אותך שוב</p>

                <form className="auth__form" onSubmit={onSubmit}>
                    <TextField type="email" label="אימייל" placeholder="name@example.com" error={errors.email?.message} {...register("email", { required: "חובה למלא כתובת מייל" })} />
                    <TextField label="סיסמא" type="password" placeholder="••••••••" error={errors.password?.message} {...register("password", { required: "חסר סיסמא", minLength: { value: 6, message: "הסיסמה קצרה מדי. יש להזין לפחות 6 תווים" } })} />

                    <Button text="להתחברות" size="large" full disabled={isSubmitting} />
                    {serverError && <p className="auth__server-error">{serverError}</p>}
                </form>

                <p className="auth__switch">
                    אין לך חשבון?<br />
                    <Link to="/signUp">הרשמה</Link>
                </p>
            </section>

            <aside className="auth__promo">
                <h2 className="auth__promo-title">
                    ברוכה השבה,
                    <span>הצעות מחכות לך.</span>
                </h2>
                <ul className="auth__promo-list">
                    <li>מודעות חדשות ישר למייל</li>
                    <li>צ׳אט ישיר עם המפרסמת</li>
                    <li>חיבור מהיר, עיצוב אדיר</li>
                </ul>
            </aside>
        </main>
    )


}
