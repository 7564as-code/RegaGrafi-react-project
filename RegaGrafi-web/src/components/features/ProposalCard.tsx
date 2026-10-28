import { usePetchProposal } from "../../hook/proposal";
import type { proposalType } from "../../types/proposalType";
import Button from "../ui/Button";
import Tag from "../ui/Tag";
import "./ProposalCard.css";


 type t={
    data:proposalType
}
export default function ProposalCard({data}: t) {
const {mutate,isPending,isError,isSuccess}=usePetchProposal(data.job_id)
const name=data.designer?.display_name??""
    return (
        <div className={`proposal-card${data.status==="rejected"?" proposal-card--rejected":""}`}>
            <div className="proposal-card__head">
                <div className="proposal-card__avatar" aria-hidden="true">{name.trim().charAt(0)}</div>
                <h2 className="proposal-card__name">{name}</h2>
                {data.status=="accepted"&&<Tag text="מאושר" color="var(--color-teal-soft)" textColor="var(--color-ink)"></Tag>}
                {data.status=="rejected"&&<Tag text="נדחה" color="var(--color-coral-soft)" textColor="var(--color-coral)"></Tag>}
            </div>

            <p className="proposal-card__message">{data.message}</p>

            <div className="proposal-card__stats">
                <div className="proposal-card__stat">
                    <span className="proposal-card__stat-label">מחיר</span>
                    <span className="proposal-card__stat-value">₪{data.price}</span>
                </div>
                <div className="proposal-card__stat">
                    <span className="proposal-card__stat-label">משך זמן העבודה</span>
                    <span className="proposal-card__stat-value">{data.delivery_hours} שעות</span>
                </div>
            </div>

            {data.designer?.portfolio_url&&<a className="proposal-card__link" href={data.designer.portfolio_url} target="_blank" rel="noreferrer">קישור לתיק העבודות ↗</a>}

            {data.status=="pending"&&
                <div className="proposal-card__actions">
                    <Button text="אישור" size="small" disabled={isPending||isSuccess} onClick={()=>mutate({id:data.id,status:"accepted"})}/>
                    <Button text="דחיה" size="small" color="var(--color-coral-soft)" textColor="var(--color-coral)" disabled={isPending||isSuccess} onClick={()=>mutate({id:data.id,status:"rejected"})}></Button>
                </div>
            }
            {isError&&<p className="proposal-card__feedback proposal-card__feedback--error" role="alert">ההצעה כבר הוחלטה</p>}
            {isPending&&<p className="proposal-card__feedback">מעדכן...</p>}
            {isSuccess&&<p className="proposal-card__feedback">עודכן!!</p>}
        </div>
    )
}
