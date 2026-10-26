import type { Ref,FocusEventHandler,ChangeEventHandler } from "react"
import "./TextField.css"

type Element=HTMLInputElement&HTMLTextAreaElement

type textField={
    label:string,
    type?:'text'|'email'|'password'|'number'
    placeholder?:string,
    multiline?:boolean,
onChange:ChangeEventHandler<Element>,
    onBlur:FocusEventHandler<Element>,
name:string,
ref:Ref<Element>,
error?:string
}


export default function TextField({label,type='text',placeholder,multiline=false,onChange,error,ref,name,onBlur}:textField){
   return <div className={`field${error?" field--error":""}`}>
    <label className="field__label" htmlFor={name}>{label}</label>

    {multiline
        ? <textarea className="field__input field__textarea" id={name} placeholder={placeholder} onChange={onChange} name={name} ref={ref} onBlur={onBlur} rows={4}/>
        : <input className="field__input" id={name} placeholder={placeholder} onChange={onChange} name={name} ref={ref} onBlur={onBlur} type={type}/>}
    {error&&<p className="field__error">{error}</p>}
    </div>
}
