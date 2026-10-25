
export type proposalFormType={
message: string,
price: number,
delivery_hours:number
}


export type proposalType={
id: string,
job_id:string,
designer_id:string,
message:string,
price: number,
delivery_hours:number,
status:"pending"|"accepted"|"rejected",
created_at:string,
designer:{
   id:string,
    display_name:string,
    bio:string| null,
    categories:string[],
availability:"available"|"unavailable",
logo_url:string|null,
portfolio_url:string|null
}|null
}

