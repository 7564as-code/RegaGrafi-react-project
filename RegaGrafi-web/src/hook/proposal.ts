

import {useMutation} from "@tanstack/react-query"
import type { proposalFormType } from "../types/proposalType"
import { postProposal } from "../api/proposals"


export function useCreateProposal(id:string){

const mutation=useMutation({mutationFn:(data:proposalFormType)=>postProposal(id,data)})



return mutation
}