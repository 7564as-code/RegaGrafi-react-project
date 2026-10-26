import { useState } from 'react';
import JobCard from '../components/features/JobCard'
import Tag from '../components/ui/Tag';
import { useJobs } from '../hook/useJobs'
import { categories } from '../types/categories';
import type {category} from "../types/jobsType"
import "./JobsPage.css";

export default function JobPage() {
    const [filter,setfilter]=useState<undefined|category>(undefined)
    const { isPending, isError, data } = useJobs({category:filter})

    return <main className="jobs">
   {data && data.data.length > 0 && (
            <div className="jobs__header">
                <h2>מודעות פתוחות</h2>
                <p>עבודות שמחכות עכשיו לגרפיקאית פנויה</p>
            </div> )}

       
        <div className='jobs__filters'>
           <button  type='button' onClick={()=>setfilter(undefined)}> <Tag text="הכל" color={filter===undefined?"var(--color-coral-soft)":"white"}/></button>
{categories.map((x)=><button key={x.value} onClick={()=>setfilter(x.value)} type='button'><Tag text={x.label} color={filter===x.value?"var(--color-coral-soft)":"white"}></Tag></button> )}
       </div>
        <div className="jobs__grid">
            {data && data.data.map((x) => <JobCard jobcard={x} key={x.id} />)}
        </div>
        {isPending && <p>טוען מודעות...</p>}
        {isError && <p>אירעה שגיאה בטעינת המודעות 😔 נסי שוב בעוד רגע.</p>}
        {data && data.data.length === 0 && <p>אין מודעות פתוחות כרגע.</p>}
     
    </main>

}
