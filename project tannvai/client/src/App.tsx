import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DemoProvider } from './context/DemoContext';
import { Navbar } from './components/Navbar';
import { DemoBanner } from './components/DemoBanner';
import { Footer } from './components/Footer';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExplorerPage } from './pages/ExplorerPage';
import { SubmitReportPage } from './pages/SubmitReportPage';
import { AIAnalysisPage } from './pages/AIAnalysisPage';
import { CoordinationPage } from './pages/CoordinationPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AdminReviewPage } from './pages/AdminReviewPage';
import { AboutPage } from './pages/AboutPage';

export function App() {
  const [currentPage, setCurrentPage] = useState<string>('landing');

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} />;
      case 'explorer':
        return <ExplorerPage onNavigate={setCurrentPage} />;
      case 'submit':
        return <SubmitReportPage onNavigate={setCurrentPage} />;
      case 'analysis':
        return <AIAnalysisPage onNavigate={setCurrentPage} />;
      case 'coordination':
        return <CoordinationPage onNavigate={setCurrentPage} />;
      case 'analytics':
        return <AnalyticsPage onNavigate={setCurrentPage} />;
      case 'admin':
        return <AdminReviewPage onNavigate={setCurrentPage} />;
      case 'about':
        return <AboutPage onNavigate={setCurrentPage} />;
      default:
        return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <AuthProvider>
      <DemoProvider onNavigate={setCurrentPage}>
        <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
          {/* Top Demo Banner */}
          <DemoBanner onNavigate={setCurrentPage} />

          {/* Navigation Bar */}
          <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />

          {/* Page Content */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {renderPage()}
          </main>

          {/* Footer */}
          <Footer onNavigate={setCurrentPage} />
        </div>
      </DemoProvider>
    </AuthProvider>
  );
}

export default App;
