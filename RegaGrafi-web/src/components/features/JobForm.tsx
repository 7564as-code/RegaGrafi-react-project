import { useForm } from "react-hook-form";
import type { jobFormType } from "../../types/jobsType";
import TextField from "../ui/TextField";
import { categories } from "../../types/categories";
import Button from "../ui/Button";
import "./JobForm.css";
import { getErrorInfo } from "../../lib/errorInfo";
import { statusType } from "../../types/status";

type JobFormProps = {
    values?: jobFormType,
    onSubmit: (a: jobFormType) => void,
    isPending: boolean,
    isError: boolean,
    error?: unknown,
    text: string
}


export default function JobForm({ values, onSubmit, isPending, isError, error, text }: JobFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<jobFormType>({ defaultValues: values });


    return <form className="job-form" onSubmit={handleSubmit(onSubmit)}>
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

        <div className="job-form__row">
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
      { values&& <select
            id="status"
            {...register("status", {
                required: "מצב הודעה",
            })}
        >
            <option value="">שני סטטוס מודעה</option>

            {statusType.map((s) => (
                <option key={s.value} value={s.value}>
                    {s.label}
                </option>
            ))}
        </select>}

        <Button text={text} size="large" full disabled={isPending} />
        {isError && <p className="job-form__error" role="alert">{error ? getErrorInfo(error).title : "השליחה נכשלה, נסו שוב😔"}</p>}
    </form>
}
