import type { SingleResponse } from "../types/paginationType";
import { api } from "../api/client";
import type { profileFormType, usertype } from "../types/userType";

export function getMe(){
    return api<SingleResponse<usertype>>("/api/me")
}


export function updateMe(data: profileFormType) {
    return api<SingleResponse<usertype>>(`/api/me`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
}