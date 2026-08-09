import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { LandingPage } from "./pages/LandingPage";
import { MarketplacePage } from "./pages/MarketplacePage";
import { SkillPage } from "./pages/SkillPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DevelopersPage } from "./pages/DevelopersPage";
import { DemoPage } from "./pages/DemoPage";
import { AgentPage } from "./pages/AgentPage";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/skill/:id" element={<SkillPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/developers" element={<DevelopersPage />} />
        <Route path="/agent" element={<AgentPage />} />
        <Route path="/demo" element={<DemoPage />} />
      </Routes>
    </BrowserRouter>
  );
}
