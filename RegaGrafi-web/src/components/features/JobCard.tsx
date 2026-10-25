import type { jobType } from "../../types/jobsType"
import Button from "../ui/Button"
import Tag from "../ui/Tag"
import { Link } from "react-router-dom";
import "./JobCard.css";
 type jobcard={
jobcard:jobType
}

function JobCard({jobcard}: jobcard) {
    return (
<div className="job-card">
            <div className="job-card__tag"><Tag text={jobcard.category} /></div>
            <h2 className="job-card__title">{jobcard.title}</h2>
            <p className="job-card__description">{jobcard.description}</p>
            <div className="job-card__footer">
                <div className="job-card__price">
                    {jobcard.budget&&<span className="job-card__budget">{jobcard.budget}₪</span>}
                    <span className="job-card__meta">{jobcard.deadline??jobcard.created_at}</span>
                </div>
                <Link to={`/jobs/${jobcard.id}`}><Button text="שלחי הצעה" size="small" /></Link>
            </div>
</div>
    )
}
export default JobCard
