


export type usertype={
id:string,
email:string,
display_name:string,
bio:string|null,
categories:string[],
is_designer:boolean,
availability:"available"|"unavailable",
logo_url:string|null,
portfolio_url:string|null,
notify_email:boolean,
role:"admin"|"user",
created_at:string
}

export type profileFormType={
    display_name:string,
    portfolio_url?:string|null
}