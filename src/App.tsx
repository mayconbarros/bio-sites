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
import { CheckCircle2, AlertCircle, Info, Smartphone, Monitor } from 'lucide-react';

function AppContent() {
  const { currentView, activeBiosite, toast, previewDevice, setPreviewDevice } = useApp();

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex font-sans antialiased">
      {/* Left Sidebar Classic SaaS layout for Agency only */}
      {currentView === 'agency' && <Sidebar />}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {currentView === 'agency' && <AgencyDashboard />}
        {currentView === 'client' && <ClientDashboard />}
        {currentView === 'public' && activeBiosite && (
          <div className="flex-1 flex flex-col items-center justify-start py-6 px-4 bg-neutral-100 min-h-screen">
            {/* Device Switcher for Public Bio Site Demo */}
            <div className="mb-4 flex items-center gap-2 p-1 rounded-2xl bg-white border border-neutral-200 text-xs shadow-xs">
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
                  previewDevice === 'mobile' 
                    ? 'bg-[#ff2a85] text-white shadow-xs' 
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Formato Smartphone
              </button>
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
                  previewDevice === 'desktop' 
                    ? 'bg-[#ff2a85] text-white shadow-xs' 
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                Tela Cheia
              </button>
            </div>

            {/* Container */}
            <div className={`w-full transition-all duration-300 ${
              previewDevice === 'mobile' 
                ? 'max-w-[400px] rounded-[44px] overflow-hidden border-[8px] border-neutral-900 shadow-2xl ring-1 ring-neutral-300 my-auto' 
                : 'max-w-2xl rounded-3xl overflow-hidden border border-neutral-200 shadow-xl bg-white'
            }`}>
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

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
