import { getJobs } from "../api/jobs";
import { getJob } from "../api/jobs";

import { useQuery } from "@tanstack/react-query";

 export function useJobs(){
    return useQuery({queryKey:["jobs"],queryFn:getJobs})
 }
  export function useJob(id:string | undefined){
    return useQuery({queryKey:["jobs",id,id !== undefined],queryFn:()=>getJob(id)})
 }