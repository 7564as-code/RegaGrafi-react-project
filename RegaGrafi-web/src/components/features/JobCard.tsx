import type { jobType } from "../../types/jobsType"
import Button from "../ui/Button"
import Tag from "../ui/Tag"
import { Link } from "react-router-dom";
import "./JobCard.css";
import { useAuth } from "../../hook/useAuth";
import { categories } from "../../types/categories";
type jobcard = {
    jobcard: jobType
}

function JobCard({ jobcard }: jobcard) {
    function deadline(deadline: string): string {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const end = new Date(deadline);
        end.setHours(0, 0, 0, 0);

        const days = Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (days < 0) return "הדדליין עבר";
        if (days === 0) return "עד היום";
        if (days === 1) return "עד מחר";
        return `עוד ${days} ימים`;
    }

    function timeAgo(date: string): string {
        const diffMs = Date.now() - new Date(date).getTime();

        const minutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return "הרגע";
        if (minutes < 60) return minutes === 1 ? "לפני דקה" : `לפני ${minutes} דקות`;
        if (hours < 24) {
            if (hours === 1) return "לפני שעה";
            if (hours === 2) return "לפני שעתיים";
            return `לפני ${hours} שעות`;
        }
        if (days === 1) return "אתמול";
        return `לפני ${days} ימים`;
    }
const {user}=useAuth()
const canedit=user?.id==jobcard.owner.id||user?.role === "admin"
    return (
        <div className="job-card">
            <div className="job-card__tags">
                <Tag text={categories.find((x)=>jobcard.category===x.value)?.label??""} />
                {jobcard.deadline && (
                    <span className="job-card__deadline"><Tag text={deadline(jobcard.deadline)} color="var(--color-coral-soft)" textColor="var(--color-coral)" /></span>
                )}
            </div>
{
 (jobcard.status!="open")&&<Tag text={jobcard.status}></Tag>
}
            <h2 className="job-card__title">{jobcard.title}</h2>
            <p className="job-card__description">{jobcard.description}</p>
            <div className="job-card__footer">
                <div className="job-card__price">
                    {jobcard.budget && <span className="job-card__budget">₪{jobcard.budget}</span>}
                    <span className="job-card__meta">{timeAgo(jobcard.created_at)}</span>
               
               </div>
               <div>
            {!canedit&&   <Link to={`/jobs/${jobcard.id}`}><Button text="שלחי הצעה" size="small" /></Link>}
            </div>
              {canedit && <Link to={`/jobs/${jobcard.id}/edit`}><Button text="עדכון" size="small" /></Link>}
            </div>
        </div>
    )
}
export default JobCard
