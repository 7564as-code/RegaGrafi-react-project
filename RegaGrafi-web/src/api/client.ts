// שגיאה מהשרת (או מהרשת) עם הסטטוס, כדי שהמסך ידע איך להציג אותה.
// status 0 = אין תקשורת עם השרת בכלל.
export class ApiRequestError extends Error {
    status: number
    code: string

    constructor(status: number, code: string, message: string) {
        super(message)
        this.status = status
        this.code = code
    }
}

export async function api<T>(url:string,init?:RequestInit):Promise<T> {
    let res: Response
    try {
        res = await fetch(url, init)
    } catch {
        throw new ApiRequestError(0, "NETWORK_ERROR", "Network error")
    }

    const json = await res.json().catch(() => null)
    if(!res.ok)
        throw new ApiRequestError(res.status, json?.error?.code ?? "UNKNOWN", json?.error?.message ?? res.statusText)

    return json
}
