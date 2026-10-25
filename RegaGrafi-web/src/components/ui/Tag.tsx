import "./Tag.css"

type TextTag={
text:string|number
}

export default function Tag({text}:TextTag){
    return <span className="tag">{text}</span>
}
