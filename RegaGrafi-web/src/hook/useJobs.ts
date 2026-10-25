import { getJobs, postJob } from "../api/jobs";
import { getJob } from "../api/jobs";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { jobFormType } from "../types/jobsType";
import { useNavigate } from "react-router-dom";

 export function useJobs(){
    return useQuery({queryKey:["jobs"],queryFn:getJobs,retry:false})
 }
  export function useJob(id:string | undefined){
    return useQuery({queryKey:["jobs",id],queryFn:()=>getJob(id),enabled:id !== undefined})
   
 }

 
 
 export function usePostJob(){
 const queryClient =useQueryClient()
const navigate=useNavigate()
 const mutation=useMutation({mutationFn:(data:jobFormType)=>postJob(data),onSuccess:()=>{queryClient.invalidateQueries({queryKey: ["jobs"]})
 navigate("/jobs")}})
 
 
 
 return mutation
 }

