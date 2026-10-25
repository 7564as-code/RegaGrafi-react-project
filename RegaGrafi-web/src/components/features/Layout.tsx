import { Outlet } from "react-router-dom"
import Header from "../../components/features/Header"


export default function Layout(){
return <>
<Header/>
<Outlet></Outlet>
</>
}