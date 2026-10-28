import { useParams } from "react-router-dom";
import { useGetProposals } from "../hook/proposal";
import ProposalCard from "../components/features/ProposalCard";
import StatusMessage from "../components/ui/StatusMessage";
import ErrorMessage from "../components/ui/ErrorMessage";
import Tag from "../components/ui/Tag";
import "./JobProposalsPage.css";



export default function JobProposalsPage() {
    const { id } = useParams();
    const { isError, error, isPending, data, refetch } = useGetProposals(id)
    if (isPending)
      return  <StatusMessage variant="loading" title="טוען..." />
    if (isError)
      return  <ErrorMessage error={error} onRetry={() => refetch()} />
    if (data.data.length==0)
      return  <StatusMessage variant="empty" title="אין הצעות עדיין" text="כשמעצבות ישלחו הצעות הן יופיעו כאן." action={{ to: "/jobs", label: "חזרה ללוח המודעות" }} />

    return <main className="proposals">
        <div className="proposals__header">
            <h1 className="proposals__title">הצעות למודעה</h1>
            <Tag text={`${data.data.length} הצעות`} />
        </div>
        <div className="proposals__grid">
            {data?.data.map((x)=><ProposalCard  key={x.id} data={x}></ProposalCard>)}
        </div>
    </main>


}
