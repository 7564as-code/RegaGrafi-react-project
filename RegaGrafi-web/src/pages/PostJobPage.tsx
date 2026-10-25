

import { useForm } from "react-hook-form"
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import type { jobFormType } from "../types/jobsType";
import { usePostJob } from "../hook/useJobs";


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

    const onSubmit = handleSubmit( (data) => postJobMutation.mutate(data))




    return (
        <>
            <h3>פרסום מודעה</h3>

            <form onSubmit={onSubmit}>
                <TextField type="text" label="כותרת" error={errors.title?.message}
                    {...register("title", {
                        required: "שכחת לכתוב כותרת:)", minLength:
                            { value: 3, message: "הכותרת חייבת להכיל לפחות 3 תווים" }, maxLength: { value: 150, message: "הכותרת מכילה עד 150 תווים" }
                    })} />
                <br />
                <TextField
                    label="תאור העבודה"
                    type="textarea"
                    error={errors.description?.message}
                    {...register("description", {
                        required: "חסר תאור",
                        maxLength: {
                            value: 5000,
                            message: "התאור יכול להכיל עד 5000 תווים"
                        }
                    })}
                />
                <br />

                <select
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
                    <p className="error">{errors.category.message}</p>
                )}                <br />
                <TextField label="תקציב" type="number" error={errors.budget?.message}
                    {...register("budget", { min: { value: 0.1, message: "התקציב חייב להיות מעל ה-0" }, setValueAs: (v) => v == "" ? undefined : Number(v) })} />
                <br />
                <TextField label="דדליין" type="date" error={errors.deadline?.message}  {...register("deadline", {
                    validate: (value) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        const selectedDate = new Date(`${value}T00:00:00`);

                        return (selectedDate > today || "יש לבחור תאריך עתידי, החל ממחר");
                    }, setValueAs: (v) => {
                        v.toISOString(),
                        v == "" ? undefined : Number(v)
                        return v
                    }
                })} />







                <Button text="שליחה" disabled={postJobMutation.isPending || postJobMutation.isSuccess} />
                <br />


                {postJobMutation.isError && <p>שגיאה נכשלה השליחה לא  נסו שוב😔</p>}

            </form>


        </>
    )


}


