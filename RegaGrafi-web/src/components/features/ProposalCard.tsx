import { usePetchProposal } from "../../hook/proposal";
import type { proposalType } from "../../types/proposalType";
import Button from "../ui/Button";
import Tag from "../ui/Tag";

 
 type t={
    data:proposalType
}
export default function ProposalCard({data}: t) {
const {mutate,isPending,isError,isSuccess}=usePetchProposal(data.job_id)
    return <>
        <div>
            <h6>שם המעצבת :{data.designer?.display_name}</h6>
            <p>ההודעה:{data.message}</p>
            <p>מחיר:{data.price}</p>
            <p>משך זמן העבודה:{data.delivery_hours}</p>
           {data.designer?.portfolio_url&&<a href={data.designer.portfolio_url} target="_blank">קישור לתיק העבודות</a>}
          {data.status!="pending"&&  <Tag text={data.status=="accepted"?"מאושר":"נדחה"}></Tag>}
            {
            data.status=="pending"&&
            <div>
            <Button text="אישור" disabled={isPending||isSuccess} onClick={()=>mutate({id:data.id,status:"accepted"})}/>
            <Button text="דחיה" disabled={isPending||isSuccess} onClick={()=>mutate({id:data.id,status:"rejected"})}></Button>
            </div>
            }
            {isError&&<p>ההצעה כבר הוחלטה</p>}
            {isPending&&<p>מעדכן...</p>}
            {isSuccess&&<p>עודכן!!</p>}




        </div>
    </>
}