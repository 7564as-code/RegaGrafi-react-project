import { useForm } from "react-hook-form"
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import type { SignUpType } from "../types/authType";
import { signUp } from "../api/auth"
import { useState } from "react"
import { Link } from "react-router-dom";
import "./AuthPage.css";

export default function SignUpPage() {
    const [emailExists, setemailExists] = useState(false)

    const [serverError, setServerError] = useState("")
        const [signUpSucceeded, setsignUpSucceeded] = useState(false)

    const { register, handleSubmit,getValues, formState: { errors,isSubmitting } } = useForm<SignUpType>();

    const onSubmit = handleSubmit(async (data) => {
        setServerError("")
        setemailExists(false)
        setsignUpSucceeded(true)
        try {
         const d= await signUp(data)
          if (d.user?.identities?.length==0){
            setemailExists(true) 
            setsignUpSucceeded(false)

            return}
          setsignUpSucceeded(true)

        }
        catch(error) {
         {setServerError("ההרשמה נכשלה, נסי שוב😔")}
        }
    })


    return (
        <main className="auth">
            <section className="auth__card">
                <h1 className="auth__title">יצירת חשבון</h1>
                <p className="auth__subtitle">חשבון אחד לכולן: אפשר גם לפרסם מודעות וגם להגיב להן.</p>

                {!signUpSucceeded&&!emailExists&&
                <form className="auth__form" onSubmit={onSubmit}>
                    <TextField type="email" label="אימייל" placeholder="name@example.com" error={errors.email?.message} {...register("email", { required: "חובה למלא כתובת מייל" })} />
                    <TextField label="סיסמא" type="password" placeholder="••••••••" error={errors.password?.message} {...register("password", { required: "חסר סיסמא", minLength: { value: 6, message: "הסיסמה קצרה מדי. יש להזין לפחות 6 תווים" } })} />
                    <TextField label="אימות סיסמא" type="password" placeholder="••••••••" error={errors.confirmPassword?.message}
                     {...register("confirmPassword", { required: "לא אימתת סיסמא😩", validate:(value)=>getValues("password")===value||"הסיסמאות אינן תואמות"})} />

                    <Button text="יצירת חשבון" size="large" full disabled={isSubmitting} />
                    {serverError && <p className="auth__server-error">{serverError}</p>}
                </form>}

                {emailExists&&<p className="auth__notice auth__notice--warn">כתובת המייל כבר קיימת במערכת<br /><Link to="/login">להתחברות</Link></p>}

                {signUpSucceeded && <p className="auth__notice">שלחנו לך מייל אימות, אשרי אותו כדי להמשיך</p>}

                <p className="auth__switch">
                    כבר יש לך חשבון?<br />
                    <Link to="/login">התחברות</Link>
                </p>
            </section>

            <aside className="auth__promo">
                <h2 className="auth__promo-title">
                    העבודה הבאה שלך
                    <span>במרחק קליק.</span>
                </h2>
                <ul className="auth__promo-list">
                    <li>מודעות חדשות ישר למייל</li>
                    <li>חלון של שעתיים? ממלאים אותו</li>
                    <li>צ׳אט ישיר עם המפרסמת</li>
                </ul>
            </aside>
        </main>
    )


}
