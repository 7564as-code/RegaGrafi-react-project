import JobCard from '../components/features/JobCard'
import { useJobs } from '../hook/useJobs'

export default function JobPage() {
    const{isPending,isError,data}=useJobs()
    return   <div>
        {isPending&&<p>טוען מודעות...</p>}
        {isError&&<p>אירעה שגיאה בטעינת המודעות 😔 נסי שוב בעוד רגע.</p>}
                {data&&data.data.map((x) => <JobCard jobcard={x} key={x.id}/>)}

   </div>
 
}

