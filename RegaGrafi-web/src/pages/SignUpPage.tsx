import { useForm } from "react-hook-form"
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import type { SignUpType } from "../types/authType";
import { signUp } from "../api/auth"
import { useState } from "react"
import { Link } from "react-router-dom";

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
        <>
            <h3>הרשמה</h3>
        {!signUpSucceeded&&!emailExists&&

            <form onSubmit={onSubmit}>
                <TextField type="email" label="אימייל" error={errors.email?.message} {...register("email", { required: "חובה למלא כתובת מייל" })} />
                <br />
                <TextField label="סיסמא" type="password" error={errors.password?.message} {...register("password", { required: "חסר סיסמא", minLength: { value: 6, message: "הסיסמה קצרה מדי. יש להזין לפחות 6 תווים" } })} />
                <br />
                  <br />
                <TextField label="אימות סיסמא" type="password" error={errors.confirmPassword?.message}
                 {...register("confirmPassword", { required: "לא אימתת סיסמא😩", validate:(value)=>getValues("password")===value||"הסיסמאות אינן תואמות"})} />
                <br />


                <Button text="להרשמה" disabled={isSubmitting} />
                <br />


                {serverError && <p>{serverError}</p>}
                
                    </form>}
                    
                {emailExists&&<Link to="/login">כתובת המייל כבר קיימת המערכת להתחברות</Link>}

                    {signUpSucceeded && <p>{"שלחנו לך מייל אימות, אשרי אותו כדי להמשיך"}</p>}

        </>
    )


}


