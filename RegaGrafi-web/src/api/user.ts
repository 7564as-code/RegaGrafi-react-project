import type { SingleResponse } from "../types/paginationType";
import { api } from "../api/client";
import type { usertype } from "../types/userType";

export function getMe(){
    return api<SingleResponse<usertype>>("/api/me")
}

