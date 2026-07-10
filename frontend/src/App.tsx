import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AppLayout } from "./layouts/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<div className="p-8 text-center">Forgot Password Page Coming Soon</div>} />
          
          {/* Protected Routes */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Stubs for future milestone pages */}
            <Route path="/alarms" element={<div className="p-8">Alarms Module</div>} />
            <Route path="/habits" element={<div className="p-8">Habits Module</div>} />
            <Route path="/challenges" element={<div className="p-8">Challenges Module</div>} />
            <Route path="/reports" element={<div className="p-8">Reports Module</div>} />
            <Route path="/settings" element={<div className="p-8">Settings Module</div>} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
