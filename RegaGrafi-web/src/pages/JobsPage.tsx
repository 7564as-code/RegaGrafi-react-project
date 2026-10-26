import JobCard from '../components/features/JobCard'
import { useJobs } from '../hook/useJobs'
import "./JobsPage.css";

export default function JobPage() {
    const { isPending, isError, data } = useJobs()
    return <main className="jobs">

        {isPending && <p>טוען מודעות...</p>}
        {isError && <p>אירעה שגיאה בטעינת המודעות 😔 נסי שוב בעוד רגע.</p>}
        {data && data.data.length === 0 && <p>אין מודעות פתוחות כרגע.</p>}
        {data && data.data.length > 0 && (
            <div className="jobs__header">
                <h2>מודעות פתוחות</h2>
                <p>עבודות שמחכות עכשיו לגרפיקאית פנויה</p>
            </div>
        )}
        <div className="jobs__grid">
            {data && data.data.map((x) => <JobCard jobcard={x} key={x.id} />)}
        </div>

    </main>

}
