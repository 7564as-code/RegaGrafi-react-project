

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { proposalFormType } from "../types/proposalType"
import { getProposals, petchProposal, postProposal } from "../api/proposals"


export function useCreateProposal(id: string) {

    const mutation = useMutation({ mutationFn: (data: proposalFormType) => postProposal(id, data) })



    return mutation
}


export function useGetProposals(jobId: string | undefined) {
    return useQuery({ queryKey: ["proposals", jobId], queryFn: () => getProposals(jobId), enabled: jobId !== undefined })
}


  export function usePetchProposal(idJob:string){
 const queryClient =useQueryClient()
 const mutation=useMutation({mutationFn:({id,status}:{status:"accepted"|"rejected",id:string})=>petchProposal(id,status),onSuccess:()=>{queryClient.invalidateQueries({queryKey:  ["proposals", idJob]})
}})
 
 return mutation
 }
