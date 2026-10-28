import { useForm } from "react-hook-form"
import type { profileFormType } from "../types/userType"
import { useAuth } from "../hook/useAuth";
import TextField from "../components/ui/TextField";
import { useUpdateMe } from "../hook/useMe";
import Button from "../components/ui/Button";



export default function ProfilePage(){
    const{user}=useAuth()
  const  {mutate,isError,isPending,isSuccess}=useUpdateMe()

    const { register, handleSubmit, formState: { errors } } = useForm<profileFormType>({ defaultValues: {display_name:user?.display_name,portfolio_url:user?.portfolio_url??"" }});
    return (
    <form onSubmit={handleSubmit((data) => mutate(data))} >
<TextField label="שם" error={errors.display_name?.message}
            {...register("display_name", {
                required: "שכחת לכתוב שם:)", minLength:
                    { value: 3, message: "השם חייבת להכיל לפחות שלושה תווים" }, maxLength: { value: 30, message: "השם מכיל עד 30 תווים" }, validate: { value: (v) => v.trim().length > 2 ? true : "שם חייב להכיל לפחות שלושה תווים" }
            })}></TextField>
<TextField
  label="קישור לתיק עבודות"
  {...register("portfolio_url", {
    pattern: {
      value: /^https?:\/\//,
      message: "הקישור חייב להתחיל ב-http:// או ב-https://",
    },
    setValueAs: (v) => v.trim() === "" ? null : v.trim(),
  })}
/>
<Button text="עדכון" disabled={isPending||isSuccess} ></Button>
{isError&&<p>יש שגיאה נסי לשלוח שוב</p>}
</form>
    )
}