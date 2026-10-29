import type { jobFormType, jobType } from "../types/jobsType";
import type { PaginatedResponse, SingleResponse } from "../types/paginationType";
import { api } from "../api/client";
import type { filterType } from "../types/filterType";


export function getJobs(filter?: filterType) {
    const params = new URLSearchParams();
    if (filter?.category)
        params.set("category", filter.category);
    if (filter?.q)
        params.set("q", filter.q);
    if (filter?.order)
        params.set("order", filter.order);
    if (filter?.page)
        params.set("page", String(filter.page));
    const query = params.toString();
    return api<PaginatedResponse<jobType>>(`/api/jobs${query ? `?${query}` : ""}`);
}


export function getJob(id: string | undefined) {
    return api<SingleResponse<jobType>>(`/api/jobs/${id}`)
}


export function postJob(data: jobFormType) {
    return api<SingleResponse<jobType>>(`/api/jobs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
}



export function editJob(id: string, data: jobFormType) {
    return api<SingleResponse<jobType>>(`/api/jobs/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
}

export function patchJobStatus(id: string, status: jobType["status"]) {
    return api<SingleResponse<jobType>>(`/api/jobs/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
}
