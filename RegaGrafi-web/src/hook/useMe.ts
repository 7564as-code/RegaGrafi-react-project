
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe, updateMe } from "../api/user";
import type { profileFormType } from "../types/userType";

 export function useMe(){
    return useQuery({queryKey:["user"],queryFn:getMe,retry:false})
 }
 export function useUpdateMe(){
    const queryClient =useQueryClient()
   
    return useMutation({mutationFn:(data:profileFormType)=> updateMe(data),onSuccess:()=>
         {queryClient.invalidateQueries({queryKey:  ["user"]}) }})}
     

