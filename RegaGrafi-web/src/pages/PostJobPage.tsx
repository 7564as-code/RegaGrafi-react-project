

import { useForm } from "react-hook-form"
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import type { jobFormType } from "../types/jobsType";
import { usePostJob } from "../hook/useJobs";
import { categories } from "../types/categories";


export default function PostJobPage() {



    const postJobMutation = usePostJob()
    const { register, handleSubmit, formState: { errors } } = useForm<jobFormType>();

    const onSubmit = handleSubmit((data) => postJobMutation.mutate(data))




    return (
        <>
            <h3>פרסום מודעה</h3>

            <form onSubmit={onSubmit}>
                <TextField type="text" label="כותרת" error={errors.title?.message}
                    {...register("title", {
                        required: "שכחת לכתוב כותרת:)", minLength:
                            { value: 3, message: "הכותרת חייבת להכיל לפחות שלושה תווים" }, maxLength: { value: 150, message: "הכותרת מכילה עד 150 תווים" }, validate: { value: (v) => v.trim().length > 2 ? true : "הכותרת חייבת להכיל לפחות שלושה תווים" }
                    })} />
                <br />
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
                                selectedDate >= today ||
                                "יש לבחור תאריך עתידי"
                            );
                        }
                    })}
                />






                <Button text="שליחה" disabled={postJobMutation.isPending || postJobMutation.isSuccess} />
                <br />


                {postJobMutation.isError && <p>השליחה נכשלה, נסו שוב😔</p>}

            </form>


        </>
    )


}


