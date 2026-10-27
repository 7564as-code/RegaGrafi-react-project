import { useParams } from "react-router-dom";
import { useGetProposals } from "../hook/proposal";
import ProposalCard from "../components/features/ProposalCard";



export default function JobProposalsPage() {
    const { id } = useParams();
    const { isError, isPending, data } = useGetProposals(id)
    if (isPending)
      return  <p>טוען</p>
    if (isError)
      return  <p>שגיאה נסה שוב...</p>
    if (data.data.length==0)
      return  <p>אין  הצעות עדיין</p>

    return <div>
        {data?.data.map((x)=><ProposalCard  key={x.id} data={x}></ProposalCard>)}
    </div>
    
        
}