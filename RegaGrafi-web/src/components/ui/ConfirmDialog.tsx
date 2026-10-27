import { useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";
import "./ConfirmDialog.css";

type ConfirmDialogProps = {
    title: string,
    text?: string,
    confirmText: string,
    cancelText?: string,
    isPending?: boolean,
    onConfirm: () => void,
    onCancel: () => void
}

// חלון אישור מעוצב במקום window.confirm.
export default function ConfirmDialog({ title, text, confirmText, cancelText = "ביטול", isPending, onConfirm, onCancel }: ConfirmDialogProps) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel() }
        document.addEventListener("keydown", onKey)
        return () => document.removeEventListener("keydown", onKey)
    }, [onCancel])

    return createPortal(
        <div className="confirm" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel() }}>
            <div className="confirm__box" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
                <div className="confirm__icon" aria-hidden="true">!</div>
                <h2 className="confirm__title" id="confirm-title">{title}</h2>
                {text && <p className="confirm__text">{text}</p>}
                <div className="confirm__actions">
                    <Button text={confirmText} size="small" color="var(--color-coral)" disabled={isPending} onClick={onConfirm} />
                    <Button text={cancelText} size="small" color="var(--color-surface)" textColor="var(--color-primary)" borderColor="var(--color-primary-border)" onClick={onCancel} />
                </div>
            </div>
        </div>,
        document.body
    )
}
