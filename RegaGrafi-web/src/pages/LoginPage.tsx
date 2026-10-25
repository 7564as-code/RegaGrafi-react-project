import { useForm } from "react-hook-form"
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import type { authType } from "../types/authType";
import { signIn } from "../api/auth"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query";
export default function LoginPage() {
    const queryClient=useQueryClient()
    const navigate = useNavigate()
    const [serverError, setServerError] = useState("")
    const { register, handleSubmit, formState: { errors } } = useForm<authType>();
    const onSubmit = handleSubmit(async (data) => {
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
        <>
            <h3>התחברות</h3>

            <form onSubmit={onSubmit}>
                <TextField type="email" label="אימייל" error={errors.email?.message} {...register("email", { required: "חובה למלא כתובת מייל" })} />
                <br />
                <TextField label="סיסמא" type="password" error={errors.password?.message} {...register("password", { required: "חסר סיסמא", minLength: { value: 6, message: "הסיסמה קצרה מדי. יש להזין לפחות 6 תווים" } })} />
                <br />


                <Button text="להתחברות" />
                {serverError && <p>{serverError}</p>}
            </form>
        </>
    )


}


