import "./Tag.css"

type TextTag={
text:string|number|null
}

export default function Tag({text}:TextTag){
    return <span className="tag">{text}</span>
}
