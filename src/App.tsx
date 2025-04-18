import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WalletProvider } from "@/context/WalletContext";
import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";
import Index from "./pages/Index";
import SearchPage from "./pages/search";
import UploadPage from "./pages/upload";
import ProjectDetailsPage from "./pages/project/[id]";
import InstitutionsPage from "./pages/Institutions";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminLoginPage from "./pages/admin/login";
import AdminDashboard from "./pages/admin/dashboard";
import AdminStudentsPage from "./pages/admin/students";
import AdminBulkUploadPage from "./pages/admin/bulk-upload";
import AdminAnalyticsPage from "./pages/admin/analytics";
import AdminSettingsPage from "./pages/admin/settings";

const queryClient = new QueryClient();

// Protected route component for admin routes
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AdminAuthProvider>
        <WalletProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/project/:id" element={<ProjectDetailsPage />} />
              <Route path="/institutions" element={<InstitutionsPage />} />

              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/dashboard" element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/students" element={
                <ProtectedAdminRoute>
                  <AdminStudentsPage />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/bulk-upload" element={
                <ProtectedAdminRoute>
                  <AdminBulkUploadPage />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/analytics" element={
                <ProtectedAdminRoute>
                  <AdminAnalyticsPage />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedAdminRoute>
                  <AdminSettingsPage />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </WalletProvider>
      </AdminAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
