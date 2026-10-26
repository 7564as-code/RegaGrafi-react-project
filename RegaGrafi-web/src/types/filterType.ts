import type { category } from "./jobsType"


export type filterType={
category?:category,
q?:string,
sort?:"created_at"|"budget"|"deadline",
order?:"asc"|"desc"
}