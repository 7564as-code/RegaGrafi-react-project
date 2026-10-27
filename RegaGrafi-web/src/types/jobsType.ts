

export type jobType = {
    id: string,
    title: string,
    description: string,
    budget?: number | null,
    category: category,
    deadline?: string | null,
    created_at: string,
    status: "in_progress" | "open" | "closed",
    owner: {
        id: string,
        display_name: string,
        logo_url: string|null
    }
}

// export type jobcardType= Omit<jobType,'id'>

export type jobFormType = {
    title: string,
    description: string,
    category: category,
    budget?: number | null,
    deadline?: string | null,
    status:"open"|"closed"|"in_progress"

}
export type category = "other" | "logo" | "banner" | "flyer" | "video" | "ad"|"social"


