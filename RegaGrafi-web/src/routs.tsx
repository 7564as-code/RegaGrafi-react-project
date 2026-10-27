import { Route, Routes } from "react-router-dom";
import ProposalPage from "./pages/proposalPage";
import HomePages from "./pages/HomePage";
import Layout from "./components/features/Layout";
import JobsPage from "./pages/JobsPage";
import LOGINpage from "./pages/LoginPage"
import SignUpPage from "./pages/SignUpPage";
import PostJobPage from "./pages/PostJobPage";
import ProtectedRoute from "./components/features/ProtectedRoute"
import EditJobPage from "./pages/EditJobPage";
import UnderConstructionPage from "./pages/UnderConstructionPage";
export default function AppRouter() {
    
    return <>
    <Routes>
        <Route element={<Layout/>}>
        <Route path="/" element={<HomePages />} />
        <Route path="/jobs" element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
        <Route path="/jobs/:id" element={<ProtectedRoute><ProposalPage /></ProtectedRoute>} />
         <Route path="/login" element={<LOGINpage />} />
        <Route path="/signUp" element={<SignUpPage />} />
        <Route path="/post" element={<ProtectedRoute><PostJobPage/></ProtectedRoute>}></Route>
        <Route path="/jobs/:id/edit" element={<ProtectedRoute><EditJobPage></EditJobPage></ProtectedRoute>}></Route>


        <Route path="/designers" element={<UnderConstructionPage />} />



        <Route path="*" element={ <UnderConstructionPage/>}></Route>
   </Route>
    </Routes>
    </>
}
