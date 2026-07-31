import { Routes, Route } from "react-router-dom";

import LandingPage from "../pages/public/LandingPage";
import ThankYou from "../pages/public/ThankYou";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import Leads from "../pages/dashboard/Leads";
import AddLead from "../pages/dashboard/AddLead";
import EditLead from "../pages/dashboard/EditLead";
import Members from "../pages/dashboard/Members";
import Requests from "../pages/dashboard/Requests";
import Profile from "../pages/dashboard/Profile";

import ProtectedRoute from "../components/ProtectedRoute";
import RoleRoute from "../components/RoleRoute";
import DashboardLayout from "../layouts/DashboardLayout";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/thank-you" element={<ThankYou />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        {/* Admin Only: Create Lead */}
        <Route
          path="leads/new"
          element={
            <RoleRoute roles={["admin"]}>
              <AddLead />
            </RoleRoute>
          }
        />
        {/* Admin Only: Member Management */}
        <Route
          path="members"
          element={
            <RoleRoute roles={["admin"]}>
              <Members />
            </RoleRoute>
          }
        />
        {/* Admin Only: Lead Request Management */}
        <Route
          path="requests"
          element={
            <RoleRoute roles={["admin"]}>
              <Requests />
            </RoleRoute>
          }
        />
        {/* Both roles can access */}
        <Route path="profile" element={<Profile />} />
        {/* Both roles can access — component adapts based on role */}
        <Route path="leads/:id/edit" element={<EditLead />} />
      </Route>

      <Route
        path="*"
        element={
          <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.2),transparent)]" aria-hidden="true" />
            <div className="relative text-center px-6">
              <p className="font-display text-[10rem] font-bold leading-none bg-gradient-to-b from-white/20 to-white/5 bg-clip-text text-transparent select-none sm:text-[12rem]">404</p>
              <h1 className="font-display text-2xl font-bold text-white -mt-4 sm:text-3xl">Page Not Found</h1>
              <p className="text-slate-400 text-sm mt-3 max-w-xs mx-auto">The page you're looking for doesn't exist or has been moved.</p>
              <a
                href="/"
                className="inline-flex mt-8 px-6 py-3 bg-gradient-to-b from-violet-500 to-violet-600 text-white rounded-xl font-semibold text-sm shadow-[0_1px_2px_rgba(0,0,0,0.1),0_2px_8px_rgba(139,92,246,0.3)] hover:from-violet-600 hover:to-violet-700 hover:shadow-[0_2px_4px_rgba(0,0,0,0.1),0_4px_16px_rgba(139,92,246,0.4)] active:scale-[0.97] transition-all duration-200"
              >
                ← Go Home
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}