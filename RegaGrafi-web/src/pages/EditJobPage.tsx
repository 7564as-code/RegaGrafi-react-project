import { useParams } from "react-router-dom";
import { useEditJob, useJob } from "../hook/useJobs";
import JobForm from "../components/features/JobForm";
import type { jobFormType } from "../types/jobsType";
import { useAuth } from "../hook/useAuth";




export default function EditJobPage(){
        const { id } = useParams();
const {data,isPending,isError}=useJob(id)
const {isPending:isPendinge,isError:isErrore,mutate,isSuccess}=useEditJob(id!)
const {user,isPending:isPendinguser}=useAuth()
const canedit=user?.id==data?.data.owner.id||user?.role === "admin"

    if (isError)
        return <div><p>המודעה לא קיימת</p></div>
    if (isPending||isPendinguser)
        return <div><p>טוען🤌🤌</p></div>

    if (!data)
        return <div><p>המודעה לא קיימת</p></div>
        
if(!canedit)
    return <div><p>רק בעל המודעה יכול לערוך אותה</p></div>
const datafd:jobFormType={
category:data.data.category,
title:data.data.title,
description:data.data.description,
budget:data.data.budget??null,
deadline: data.data.deadline? new Date(data.data.deadline).toLocaleDateString("sv-SE")  : undefined}

  

    return <JobForm values={datafd} onSubmit={mutate} isError={isErrore} isPending={isPendinge||isSuccess} text="עדכון מודעה"/>
   
}