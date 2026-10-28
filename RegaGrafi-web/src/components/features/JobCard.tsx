import type { jobType } from "../../types/jobsType"
import Button from "../ui/Button"
import Tag from "../ui/Tag"
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./JobCard.css";
import { useAuth } from "../../hook/useAuth";
import { categories } from "../../types/categories";
import { statusType } from "../../types/status";
import { useSetJobStatus } from "../../hook/useJobs";
import ConfirmDialog from "../ui/ConfirmDialog";

type jobcard = {
    jobcard: jobType
}

function JobCard({ jobcard }: jobcard) {
    function deadline(deadline: string): string {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const end = new Date(deadline);
        end.setHours(0, 0, 0, 0);

        const days = Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (days < 0) return "הדדליין עבר";
        if (days === 0) return "עד היום";
        if (days === 1) return "עד מחר";
        return `עוד ${days} ימים`;
    }

    function timeAgo(date: string): string {
        const diffMs = Date.now() - new Date(date).getTime();

        const minutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return "הרגע";
        if (minutes < 60) return minutes === 1 ? "לפני דקה" : `לפני ${minutes} דקות`;
        if (hours < 24) {
            if (hours === 1) return "לפני שעה";
            if (hours === 2) return "לפני שעתיים";
            return `לפני ${hours} שעות`;
        }
        if (days === 1) return "אתמול";
        return `לפני ${days} ימים`;
    }

    const { user } = useAuth()
    const canedit = user?.id == jobcard.owner.id || user?.role === "admin"
    const setStatus = useSetJobStatus(jobcard.id)
    const isClosed = jobcard.status === "closed"
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (!menuOpen) return
        const onDown = (e: MouseEvent) => {
            if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
        }
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false) }
        document.addEventListener("mousedown", onDown)
        document.addEventListener("keydown", onKey)
        return () => {
            document.removeEventListener("mousedown", onDown)
            document.removeEventListener("keydown", onKey)
        }
    }, [menuOpen])
    const [confirmOpen, setConfirmOpen] = useState(false)
    function toggleClosed() {
        setMenuOpen(false)
        if (isClosed) setStatus.mutate("open")
        else setConfirmOpen(true)
    }
    function confirmClose() {
        setStatus.mutate("closed", { onSettled: () => setConfirmOpen(false) })
    }

    return (
        <div className={`job-card${isClosed ? " job-card--closed" : ""}`}>
            <div className="job-card__tags">
                <Tag text={categories.find((x) => jobcard.category === x.value)?.label ?? ""} />
                {jobcard.deadline && (
                    <span className="job-card__deadline"><Tag text={deadline(jobcard.deadline)} color="var(--color-coral-soft)" textColor="var(--color-coral)" /></span>
                )}
            </div>
            {
                jobcard.status !== "open" && <Tag text={statusType.find((s) => s.value === jobcard.status)?.label ?? ""} />
            }

            <h2 className="job-card__title">{jobcard.title}</h2>
            <p className="job-card__description">{jobcard.description}</p>
            <div className="job-card__footer">
                <div className="job-card__price">
                    {jobcard.budget && <span className="job-card__budget">₪{jobcard.budget}</span>}
                    <span className="job-card__meta">{timeAgo(jobcard.created_at)}</span>

                </div>
                <div>
                    {!canedit && !isClosed && <Link to={`/jobs/${jobcard.id}`}><Button text="שלחי הצעה" size="small" /></Link>}
                </div>
                {canedit && (
                    <div className="job-card__menu" ref={menuRef}>
                        <button
                            type="button"
                            className="job-card__menu-btn"
                            aria-label="פעולות על המודעה"
                            aria-haspopup="menu"
                            aria-expanded={menuOpen}
                            onClick={() => setMenuOpen((o) => !o)}
                        >
                            ⋯
                        </button>
                        {menuOpen && (
                            <div className="job-card__menu-list" role="menu">
                                <Link to={`/jobs/${jobcard.id}/proposals`} className="job-card__menu-item" role="menuitem">
                                    <svg className="job-card__menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                    הצעות של מודעה זו
                                </Link>
                                <Link to={`/jobs/${jobcard.id}/edit`} className="job-card__menu-item" role="menuitem">
                                    <svg className="job-card__menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
                                    עדכון
                                </Link>
                                <button
                                    type="button"
                                    className="job-card__menu-item"
                                    role="menuitem"
                                    disabled={setStatus.isPending}
                                    onClick={toggleClosed}
                                >
                                    <svg className="job-card__menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                                    {isClosed ? "פתיחה מחדש" : "סגירת מודעה"}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {confirmOpen && (
                <ConfirmDialog
                    title="לסגור את המודעה?"
                    text="מעצבות לא יוכלו לשלוח הצעות. תמיד אפשר לפתוח אותה מחדש."
                    confirmText="כן, לסגור"
                    isPending={setStatus.isPending}
                    onConfirm={confirmClose}
                    onCancel={() => setConfirmOpen(false)}
                />
            )}
        </div>
    )
}
export default JobCard
