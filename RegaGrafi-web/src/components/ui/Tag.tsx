import "./Tag.css"

type TextTag = {
    text: string | number
    color?: string
    textColor?: string
}

export default function Tag({ text, color = "var(--color-primary-soft)", textColor = "var(--color-primary)" }: TextTag) {
    return <span className="tag" style={{ backgroundColor: color, color: textColor ,
        border: `1px solid ${textColor}`
    }}>{text}</span>
}
