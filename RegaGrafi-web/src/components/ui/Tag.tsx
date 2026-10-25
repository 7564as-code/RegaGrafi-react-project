

type TextTag={
text:string|number
}

export default function Tag({text}:TextTag){
    return<>
    <div>{text}</div>
    </>
}
