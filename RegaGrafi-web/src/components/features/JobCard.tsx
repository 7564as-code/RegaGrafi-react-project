import type { jobType } from "../../types/jobsType"
import Button from "../ui/Button"
import Tag from "../ui/Tag"
import { Link } from "react-router-dom";
 type jobcard={
jobcard:jobType
}

function JobCard({jobcard}: jobcard) {
    return (<>
<div style={{ backgroundColor: "white", border: "2px solid blue"}}>
                <h1>{jobcard.title}</h1>
            <h6>{jobcard.description}</h6>
           { jobcard.budget&&<Tag text={`${jobcard.budget}₪`} />}
            <p>{jobcard.category}</p>
            {jobcard.deadline &&<p>{jobcard.deadline}</p>}
            <p>{jobcard.created_at}</p>
</div>
<Link to={`/jobs/${jobcard.id}`}><Button text="שלחי הצעה" /></Link>

       </> 
    )
}
export default JobCard