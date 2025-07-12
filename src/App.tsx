
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { DynamicColorProvider } from "./components/DynamicColorProvider";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import QRCode from "./pages/QRCode";
import LeadForm from "./pages/LeadForm";
import Apresentacao from "./pages/Apresentacao";
import Login from "./pages/Login";
import SecretInstall from "./pages/SecretInstall";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DynamicColorProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/secret-install" element={<SecretInstall />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/qr-code" element={<QRCode />} />
              <Route path="/form" element={<LeadForm />} />
              <Route path="/lead-form" element={<LeadForm />} />
              <Route path="/apresentacao" element={<Apresentacao />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DynamicColorProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
