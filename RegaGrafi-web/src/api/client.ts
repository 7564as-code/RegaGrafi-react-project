export async function api<T>(url:string,init?:RequestInit):Promise<T> {
   const res= await fetch(url, init)
   const json= await res.json()
    if(!res.ok) throw json.error;
    
return json
    }
