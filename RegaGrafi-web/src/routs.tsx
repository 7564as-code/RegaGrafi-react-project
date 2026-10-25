import { Route, Routes } from "react-router-dom";
import ProposalPage from "./pages/proposalPage";
import HomePages from "./pages/HomePage";
import Layout from "./components/features/Layout";
import JobsPage from "./pages/JobsPage";
import LOGINpage from "./pages/LoginPage"
import SignUpPage from "./pages/SignUpPage";
export default function AppRouter() {
    
    return <>
    <Routes>
        <Route element={<Layout/>}>
        <Route path="/" element={<HomePages />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<ProposalPage />} />
         <Route path="/login" element={<LOGINpage />} />
        <Route path="/signUp" element={<SignUpPage />} />


        <Route path="*" element={<div>הדף לא נמצא</div>}></Route>
   </Route>
    </Routes>
    </>
}
