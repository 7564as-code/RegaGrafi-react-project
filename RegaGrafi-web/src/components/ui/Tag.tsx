

type TextTag={
text:string|number|null
}

export default function Tag({text}:TextTag){
    return<>
    <div>{text}</div>
    </>
}
