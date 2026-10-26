import type { jobFormType, jobType } from "../types/jobsType";
import type { PaginatedResponse, SingleResponse } from "../types/paginationType";
import { api } from "../api/client";
import type { filterType } from "../types/filterType";

export function getJobs(filter?:filterType){
    const url=new URLSearchParams();
    if(filter?.category)
    url.set("category",filter.category)
  const query = url.toString();

    return api<PaginatedResponse<jobType>>(`/api/jobs?${query?`${query}`:""}`)
}


export function getJob(id:string | undefined){
    return api<SingleResponse<jobType>>(`/api/jobs/${id}`)
}


export function postJob(data:jobFormType){
    return api<SingleResponse<jobType>>(`/api/jobs`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)})
}