

export type jobType={
id:string,
title:string,
description:string,
budget?:number|null,
category:"other"|"logo"|"banner"|"flyer"|"social",
deadline?:string|null,
created_at:string,
status:"in_progress"|"open"|"closed",
owner:{
    id:string,
    display_name:string,
    logo_url:string
}
}

// export type jobcardType= Omit<jobType,'id'>