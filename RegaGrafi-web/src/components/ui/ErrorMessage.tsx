import { getErrorInfo } from "../../lib/errorInfo";
import StatusMessage from "./StatusMessage";

type ErrorMessageProps = {
    error: unknown,
    onRetry?: () => void
}

export default function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
    const { status, title, text } = getErrorInfo(error)

    const action = status === 401
        ? { to: "/login", label: "להתחברות" }
        : status === 404 || status === 403
            ? { to: "/jobs", label: "חזרה ללוח המודעות" }
            : onRetry
                ? { label: "נסי שוב", onClick: onRetry }
                : undefined

    return <StatusMessage variant={status === 404 ? "notFound" : "error"} title={title} text={text} action={action} />
}
