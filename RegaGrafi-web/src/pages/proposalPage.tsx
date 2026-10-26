import "./ProposalPage.css";
import { Link, useParams } from "react-router-dom";
import Tag from "../components/ui/Tag";
import { useForm } from "react-hook-form"
import type { proposalFormType } from "../types/proposalType"
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import { useJob } from "../hook/useJobs";
import { useCreateProposal } from "../hook/proposal";

export default function ProposalPage() {
    const { id } = useParams();
    const { isPending, isError, data } = useJob(id)
    const DetailJob = data?.data
    const { register, handleSubmit, formState: { errors } } = useForm<proposalFormType>();

    const mutation = useCreateProposal(id!)


    const onSubmit = handleSubmit((d) => mutation.mutate(d))

    if (isError)
        return <div><p>המודעה לא קיימת</p></div>
    if (isPending)
        return <div><p>טוען🤌🤌</p></div>

    if (!DetailJob)
        return <div><p>המודעה לא קיימת</p></div>


    return (
        <main className="proposal">
            <div className="proposal__card">
                <h1 className="proposal__title">הגשת הצעה לעבודה</h1>
                <div className="proposal__job">
                    <div className="proposal__job-tag"><Tag text={DetailJob.category} color="var(--color-surface)" textColor="var(--color-primary)" /></div>
                    <div className="proposal__job-row">
                        <h2 className="proposal__job-title">{DetailJob.title}</h2>
                        {DetailJob.budget && <p className="proposal__job-budget">₪{DetailJob.budget}</p>}
                    </div>
                </div>
                <form className="proposal__form" onSubmit={onSubmit}>
                    <TextField label="ההודעה שלך למפרסמת" multiline error={errors.message?.message} {...register("message", { required: "יש למלא הודעה" })} />
                    <TextField label="מחיר" type="number" error={errors.price?.message} {...register("price", { required: "חסר מחיר", valueAsNumber: true, min: { value: 0, message: "המחיר לא יכול להיות שלילי" } })} />
                    <TextField label="כמה זמן תיקח לך העבודה?" type="number" error={errors.delivery_hours?.message} {...register("delivery_hours", { required: "חסר דדלין", valueAsNumber: true, min: { value: 1, message: "יש להזין משך זמן של שעה לפחות." } })} />

                    <Button text={mutation.isPending ? "ההצעה נשלחת..." : " שלחי הודעה למפרסמת"} size="large" full disabled={mutation.isSuccess || mutation.isPending} />
                    {mutation.isError &&
                        <p className="proposal__feedback proposal__feedback--error">לא הצלחנו לשלוח את ההצעה. ייתכן שכבר שלחת הצעה על המודעה הזו, או שהיא שלך, או שהיא כבר לא פתוחה."</p>}
                    {mutation.isSuccess &&
                        <div className="proposal__feedback">
                            <p>ההודעה נשלחה בהצלחה</p>
                            <Link to="/jobs">חזרה ללוח המודעות</Link></div>}

                </form>
            </div>
        </main>
    )


}
