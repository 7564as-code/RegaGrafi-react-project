
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../api/user";

 export function useMe(){
    return useQuery({queryKey:["use"],queryFn:getMe,retry:false})
 }
