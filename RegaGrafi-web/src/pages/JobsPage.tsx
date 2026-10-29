import { useState } from 'react';
import JobCard from '../components/features/JobCard'
import Tag from '../components/ui/Tag';
import { useJobs } from '../hook/useJobs'
import { categories } from '../types/categories';
import "./JobsPage.css";
import StatusMessage from "../components/ui/StatusMessage";
import ErrorMessage from "../components/ui/ErrorMessage";
import TextField from '../components/ui/TextField';
import { useForm } from 'react-hook-form';
import type { filterType } from '../types/filterType';
import Button from '../components/ui/Button';

type search = {
    text: string
}

export default function JobPage() {
    const [filter, setfilter] = useState<filterType>({})
    const { isPending, isError, error, data, refetch } = useJobs(filter)
    const { register, handleSubmit } = useForm<search>();
const totalPages = data
    ? Math.ceil(data.pagination.total / data.pagination.pageSize)
    : 1;

const currentPage = filter.page ?? 1;

    function onSubmit(data: search) {
        setfilter(prev => ({ ...prev, q: data.text.trim() || undefined,page:1 }))
    }

    return <main className="jobs">
     {data && (data.data.length > 0 || filter.category || filter.q) && (
    <div className="jobs__header">
        <h2>מודעות פתוחות</h2>
        <p>עבודות שמחכות עכשיו לגרפיקאית פנויה</p>
    </div>
)}
        <div className="jobs__toolbar">
        <div className="search__header">
            <form onSubmit={handleSubmit(onSubmit)}>
                <TextField label=""
                    {...register("text")}
                />
                <Button text="חיפוש" size="small" />
            </form>
            <select
                value={filter.order || "desc"}
                onChange={e => setfilter(prev => ({ ...prev, order: e.target.value as "desc" | "asc",page:1 }))}
            >
                <option value="desc">מהחדשות</option>
                <option value="asc">מהישנות</option>
            </select>
        </div>
        <div className='jobs__filters'>
            <button type='button' onClick={() => setfilter(prev => ({ ...prev, category: undefined,q:undefined ,page:1}))}>
                <Tag text="הכל" color={filter.category === undefined ? "var(--color-coral-soft)" : "white"} /></button>
            {categories.map((x) => <button key={x.value} onClick={() => setfilter(prev => ({ ...prev, category: x.value ,page:1}))} type='button'><Tag text={x.label}
                color={filter.category === x.value ? "var(--color-coral-soft)" : "white"}></Tag></button>)}
        </div>
        </div>
        <div className="jobs__grid">
            {data && data.data.map((x) => <JobCard jobcard={x} key={x.id} />)}
        </div>
        {isPending && <StatusMessage variant="loading" title="טוען מודעות..." />}

        {isError && (
            <ErrorMessage error={error} onRetry={() => refetch()} />
        )}

        {data && data.data.length === 0 && (
            (filter.category || filter.q)
                ? <StatusMessage variant="empty" title="לא נמצאו מודעות שמתאימות לחיפוש" />
                : <StatusMessage variant="empty" title="אין מודעות פתוחות כרגע" />
        )}
        {totalPages>1&&<div className="jobs__pagination"><Button text='הקודם' color="var(--color-surface)" textColor="var(--color-primary)" borderColor="var(--color-primary)" disabled={currentPage===1} onClick={()=>setfilter(prev => ({ ...prev, page:currentPage-1}))}></Button><p className="jobs__pagination-info">עמוד {currentPage} מתוך {totalPages}</p><Button text='הבא' color="var(--color-surface)" textColor="var(--color-primary)" borderColor="var(--color-primary)" disabled={currentPage===totalPages} onClick={()=>setfilter(prev => ({ ...prev, page:currentPage+1}))}></Button></div>}
    </main>

}
