import type { SingleResponse } from "../types/paginationType";
import type { proposalFormType, proposalType } from "../types/proposalType";
import { api } from "./client";



export function postProposal(id:string | undefined,data:proposalFormType){
    return api<SingleResponse<proposalType>>(`/api/jobs/${id}/proposals`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)})
}



export function getProposals(jobId: string | undefined) {
    return api<SingleResponse<proposalType[]>>(`/api/jobs/${jobId}/proposals`)
}

export function petchProposal(id:string ,status:"accepted"|"rejected"){
    return api<SingleResponse<proposalType>>(`/api/proposals/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:status})})
}