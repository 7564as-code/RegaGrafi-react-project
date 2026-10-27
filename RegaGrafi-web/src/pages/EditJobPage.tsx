import { useParams } from "react-router-dom";
import { useEditJob, useJob } from "../hook/useJobs";
import JobForm from "../components/features/JobForm";
import type { jobFormType } from "../types/jobsType";
import { useAuth } from "../hook/useAuth";
import "./PostJobPage.css";
import StatusMessage from "../components/ui/StatusMessage";
import ErrorMessage from "../components/ui/ErrorMessage";




export default function EditJobPage(){
        const { id } = useParams();
const {data,isPending,isError,error,refetch}=useJob(id)
const {isPending:isPendinge,isError:isErrore,error:errore,mutate,isSuccess}=useEditJob(id!)
const {user,isPending:isPendinguser}=useAuth()
const canedit=user?.id==data?.data.owner.id||user?.role === "admin"

    if (isError)
        return <ErrorMessage error={error} onRetry={() => refetch()} />
    if (isPending||isPendinguser)
        return <StatusMessage variant="loading" title="טוען..." />

    if (!data)
        return <StatusMessage variant="notFound" title="המודעה לא קיימת" action={{ to: "/jobs", label: "חזרה ללוח המודעות" }} />
        
if(!canedit)
    return <StatusMessage variant="error" title="רק בעל המודעה יכול לערוך אותה" action={{ to: "/jobs", label: "חזרה ללוח המודעות" }} />
const datafd:jobFormType={
category:data.data.category,
title:data.data.title,
description:data.data.description,
budget:data.data.budget??null,
deadline: data.data.deadline? new Date(data.data.deadline).toLocaleDateString("sv-SE")  : undefined,
status:data.data.status}

  

    return (
        <main className="post-job post-job--single">
            <section className="post-job__card">
                <h1 className="post-job__title">עריכת מודעה</h1>
                <JobForm values={datafd} onSubmit={mutate} isError={isErrore} error={errore} isPending={isPendinge||isSuccess} text="עדכון מודעה"/>
            </section>
        </main>
    )
   
}