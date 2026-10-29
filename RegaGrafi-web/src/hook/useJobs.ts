import { editJob, getJobs, postJob, patchJobStatus } from "../api/jobs";
import { getJob } from "../api/jobs";

import { useMutation, useQuery, useQueryClient,keepPreviousData } from "@tanstack/react-query";
import type { jobFormType, jobType } from "../types/jobsType";
import { useNavigate } from "react-router-dom";
import type { filterType } from "../types/filterType";

export function useJobs(filter: filterType) {
   return useQuery({ queryKey: ["jobs", filter], queryFn: () => getJobs(filter), retry: false,placeholderData:keepPreviousData })
}
export function useJob(id: string | undefined) {
   return useQuery({ queryKey: ["jobs", id], queryFn: () => getJob(id), enabled: id !== undefined })

}



export function usePostJob() {
   const queryClient = useQueryClient()
   const navigate = useNavigate()
   const mutation = useMutation({
      mutationFn: (data: jobFormType) => postJob(data), onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["jobs"] })
         navigate("/jobs")
      }
   })



   return mutation
}


export function useEditJob(id: string) {
   const queryClient = useQueryClient()
   const navigate = useNavigate()
   const mutation = useMutation({
      mutationFn: (data: jobFormType) => editJob(id, data), onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["jobs"] })
         navigate("/jobs")
      }
   })

   return mutation
}

export function useSetJobStatus(id: string) {
   const queryClient = useQueryClient()
   return useMutation({
      mutationFn: (status: jobType["status"]) => patchJobStatus(id, status),
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["jobs"] }) }
   })
}



