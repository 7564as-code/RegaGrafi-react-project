import { Outlet } from "react-router-dom"
import Header from "../../components/features/Header"
import Footer from "./Footer"


export default function Layout(){
return <div className="layout">
<Header/>
<div className="layout__content">
<Outlet></Outlet>
</div>
<Footer/>
</div>
}
