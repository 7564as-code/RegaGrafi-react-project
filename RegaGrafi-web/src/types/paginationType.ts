export type PaginatedResponse<T>={
data:T[]
pagination:pagination
}

export type pagination={
    page:number,
    pageSize:number,
    total:number
}

export type SingleResponse<T>={
    data:T
}