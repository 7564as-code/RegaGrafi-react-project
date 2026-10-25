import type { jobFormType, jobType } from "../types/jobsType";
import type { PaginatedResponse, SingleResponse } from "../types/paginationType";
import { api } from "../api/client";

export function getJobs(){
    return api<PaginatedResponse<jobType>>("/api/jobs")
}


export function getJob(id:string | undefined){
    return api<SingleResponse<jobType>>(`/api/jobs/${id}`)
}


export function postJob(data:jobFormType){
    return api<SingleResponse<jobType>>(`/api/jobs`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)})
}