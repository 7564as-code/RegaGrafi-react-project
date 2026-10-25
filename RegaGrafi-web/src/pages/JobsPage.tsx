import JobCard from '../components/features/JobCard'
import { useJobs } from '../hook/useJobs'
import "./JobsPage.css";

export default function JobPage() {
    const{isPending,isError,data}=useJobs()
    return   <main className="jobs">
        {isPending&&<p>טוען מודעות...</p>}
        {isError&&<p>אירעה שגיאה בטעינת המודעות 😔 נסי שוב בעוד רגע.</p>}
        <div className="jobs__grid">
            {data&&data.data.map((x) => <JobCard jobcard={x} key={x.id}/>)}
        </div>

   </main>
 
}
