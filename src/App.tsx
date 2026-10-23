/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { AgencyDashboard } from './components/agency/AgencyDashboard';
import { ClientDashboard } from './components/client/ClientDashboard';
import { BioSiteView } from './components/public/BioSiteView';
import { LoginPage } from './components/auth/LoginPage';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

function AppContent() {
  const { currentView, activeBiosite, toast } = useApp();

  if (currentView === 'login') {
    return (
      <>
        <LoginPage />
        {/* Toast Notification Container */}
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
            <div className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : toast.type === 'info'
                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                  : 'bg-white border-emerald-300 text-emerald-800 shadow-emerald-500/10'
            }`}>
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-500" />
              ) : toast.type === 'info' ? (
                <Info className="w-4 h-4 text-blue-500" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div 
      className="min-h-screen flex font-sans antialiased"
      style={{
        background: currentView === 'public' && activeBiosite 
          ? (activeBiosite.themeConfig.bgGradient || activeBiosite.themeConfig.bgColor || '#ffffff') 
          : '#ffffff',
        color: currentView === 'public' && activeBiosite
          ? (activeBiosite.themeConfig.textColor || '#171717')
          : '#171717'
      }}
    >
      {/* Left Sidebar Classic SaaS layout for Agency only */}
      {currentView === 'agency' && <Sidebar />}

      {/* Main Content Area */}
      <div 
        className="flex-1 flex flex-col min-w-0"
        style={{
          background: currentView === 'public' && activeBiosite 
            ? (activeBiosite.themeConfig.bgGradient || activeBiosite.themeConfig.bgColor || '#ffffff') 
            : '#ffffff'
        }}
      >
        {currentView === 'agency' && <AgencyDashboard />}
        {currentView === 'client' && <ClientDashboard />}
        {currentView === 'public' && activeBiosite && (
          <div 
            className="w-full min-h-screen flex justify-center selection:bg-pink-500 selection:text-white"
            style={{
              background: activeBiosite.themeConfig.bgGradient || activeBiosite.themeConfig.bgColor || '#ffffff',
            }}
          >
            <div className="w-full max-w-lg min-h-screen">
              <BioSiteView biosite={activeBiosite} />
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border backdrop-blur-md ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : toast.type === 'info'
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : 'bg-white border-emerald-300 text-emerald-800 shadow-emerald-500/10'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : toast.type === 'info' ? (
              <Info className="w-4 h-4 text-blue-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 text-neutral-900 font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-xl border border-neutral-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto font-bold text-xl">
              !
            </div>
            <h3 className="text-base font-bold text-neutral-900">Ops, ocorreu um erro temporário</h3>
            <p className="text-xs text-neutral-500">
              {this.state.error?.message || 'Clique no botão abaixo para restaurar o estado.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-5 py-2.5 rounded-xl bg-[#ff2a85] text-white text-xs font-bold shadow-md hover:opacity-90 transition cursor-pointer"
            >
              Recarregar aplicação
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
