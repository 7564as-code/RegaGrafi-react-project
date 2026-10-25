import type { Ref,FocusEventHandler,ChangeEventHandler } from "react"

type textField={
    label:string,
    type?:'text'|'email'|'password'|'number'
onChange:ChangeEventHandler<HTMLInputElement>,
    onBlur:FocusEventHandler<HTMLInputElement>,
name:string,
ref:Ref<HTMLInputElement>,
error?:string
}


export default function TextField({label,type='text',onChange,error,ref,name,onBlur}:textField){
   return <>
    <label >{label}</label>

    <input  onChange={onChange} name={name} ref={ref} onBlur={onBlur}type={type}/>
    {error&&<p>{error}</p>}
    </>
}