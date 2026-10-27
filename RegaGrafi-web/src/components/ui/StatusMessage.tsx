import { Link } from "react-router-dom";
import Button from "./Button";
import "./StatusMessage.css";

type StatusMessageProps = {
    variant: "loading" | "error" | "empty" | "notFound",
    title: string,
    text?: string,
    action?: { label: string, to?: string, onClick?: () => void }
}

const icons = {
    error: "!",
    empty: "∅",
    notFound: "?",
}

export default function StatusMessage({ variant, title, text, action }: StatusMessageProps) {
    return (
        <div className={`status status--${variant}`} role={variant === "error" ? "alert" : "status"}>
            {variant === "loading"
                ? <div className="status__dots" aria-hidden="true"><i /><i /><i /></div>
                : <div className="status__icon" aria-hidden="true">{icons[variant]}</div>}
            <h2 className="status__title">{title}</h2>
            {text && <p className="status__text">{text}</p>}
            {action?.to && <Link to={action.to}><Button text={action.label} /></Link>}
            {action?.onClick && <Button text={action.label} onClick={action.onClick} />}
        </div>
    )
}
