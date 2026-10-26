import { Route, Routes } from "react-router-dom";
import ProposalPage from "./pages/proposalPage";
import HomePages from "./pages/HomePage";
import Layout from "./components/features/Layout";
import JobsPage from "./pages/JobsPage";
import LOGINpage from "./pages/LoginPage"
import SignUpPage from "./pages/SignUpPage";
import PostJobPage from "./pages/PostJobPage";
import ProtectedRoute from "./components/features/ProtectedRoute"
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


        <Route path="*" element={<div>הדף לא נמצא</div>}></Route>
   </Route>
    </Routes>
    </>
}
