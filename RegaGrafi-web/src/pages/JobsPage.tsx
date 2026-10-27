import { useState } from 'react';
import JobCard from '../components/features/JobCard'
import Tag from '../components/ui/Tag';
import { useJobs } from '../hook/useJobs'
import { categories } from '../types/categories';
import "./JobsPage.css";
import TextField from '../components/ui/TextField';
import { useForm } from 'react-hook-form';
import type { filterType } from '../types/filterType';
import Button from '../components/ui/Button';

type search = {
    text: string
}

export default function JobPage() {
    const [filter, setfilter] = useState<filterType>({})
    const { isPending, isError, data } = useJobs(filter)
    const { register, handleSubmit } = useForm<search>();



    function onSubmit(data: search) {
        setfilter(prev => ({ ...prev, q: data.text.trim() || undefined }))
    }

    return <main className="jobs">
        {data && data.data.length > 0 && (
            <div className="jobs__header">
                <h2>מודעות פתוחות</h2>
                <p>עבודות שמחכות עכשיו לגרפיקאית פנויה</p>
            </div>)}
        <div className="jobs__toolbar">
        <div className="search__header">
            <form onSubmit={handleSubmit(onSubmit)}>
                <TextField label=""
                    {...register("text")}
                />
                <Button text="חיפוש" size="small" />
            </form>
            <select
                value={filter.order || undefined}
                onChange={e => setfilter(prev => ({ ...prev, order: e.target.value as "desc" | "asc" }))}
            >
                <option value="desc">הכי חדשות קודם</option>
                <option value="asc">הכי ישנות קודם</option>
            </select>
        </div>
        <div className='jobs__filters'>
            <button type='button' onClick={() => setfilter(prev => ({ ...prev, category: undefined }))}>
                <Tag text="הכל" color={filter.category === undefined ? "var(--color-coral-soft)" : "white"} /></button>
            {categories.map((x) => <button key={x.value} onClick={() => setfilter(prev => ({ ...prev, category: x.value }))} type='button'><Tag text={x.label}
                color={filter.category === x.value ? "var(--color-coral-soft)" : "white"}></Tag></button>)}
        </div>
        </div>
        <div className="jobs__grid">
            {data && data.data.map((x) => <JobCard jobcard={x} key={x.id} />)}
        </div>
        {isPending && <p>טוען מודעות...</p>}

        {isError && (
            <p>אירעה שגיאה בטעינת המודעות 😔 נסי שוב בעוד רגע.</p>
        )}

        {data && data.data.length === 0 && (
            (filter.category || filter.q)
                ? <p>לא נמצאו מודעות שמתאימות לחיפוש</p>
                : <p>אין מודעות פתוחות כרגע.</p>
        )}
    </main>

}
