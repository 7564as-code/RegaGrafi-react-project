import type { Ref,FocusEventHandler,ChangeEventHandler } from "react"
import "./TextField.css"

type textField={
    label:string,
    type?:'text'|'email'|'password'|'number'
    placeholder?:string,
onChange:ChangeEventHandler<HTMLInputElement>,
    onBlur:FocusEventHandler<HTMLInputElement>,
name:string,
ref:Ref<HTMLInputElement>,
error?:string
}


export default function TextField({label,type='text',placeholder,onChange,error,ref,name,onBlur}:textField){
   return <div className={`field${error?" field--error":""}`}>
    <label className="field__label" htmlFor={name}>{label}</label>

    <input className="field__input" id={name} placeholder={placeholder} onChange={onChange} name={name} ref={ref} onBlur={onBlur} type={type}/>
    {error&&<p className="field__error">{error}</p>}
    </div>
}
