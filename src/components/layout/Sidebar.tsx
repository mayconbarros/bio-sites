import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutGrid, 
  User, 
  Gift, 
  Headphones, 
  LogOut,
  Users,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    agencyActiveTab,
    setAgencyActiveTab,
    biosites, 
    clients,
    showToast,
    logout,
    currentUser,
    switchUserRole
  } = useApp();

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col justify-between shrink-0 min-h-screen select-none">
      <div>
        {/* Logo MB Web Digital */}
        <div className="p-5 flex items-center gap-3 border-b border-neutral-100">
          <div className="w-10 h-10 rounded-xl bg-[#ff2a85] flex items-center justify-center text-white shadow-md shadow-pink-500/20 shrink-0">
            {/* Custom soundwave broadcast icon */}
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 3v18c-1.2 0-2.4-.6-3.1-1.6L5.4 15H3c-1.1 0-2-.9-2-2v-2c0-1.1.9-2 2-2h2.4l3.5-4.4c.7-1 1.9-1.6 3.1-1.6zm4.5 4.5c1.8 1.8 2.8 4.2 2.8 6.5s-1 4.7-2.8 6.5l-1.4-1.4c1.4-1.4 2.2-3.3 2.2-5.1s-.8-3.7-2.2-5.1l1.4-1.4zm3.5-3.5c2.7 2.7 4.2 6.3 4.2 9.9s-1.5 7.2-4.2 9.9l-1.4-1.4c2.3-2.3 3.6-5.4 3.6-8.5s-1.3-6.2-3.6-8.5l1.4-1.4z" />
            </svg>
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-neutral-900 block leading-tight">
              MB Web Digital
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-4 space-y-6">
          <div>
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setCurrentView('agency');
                  setAgencyActiveTab('sites');
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentView === 'agency' && agencyActiveTab === 'sites'
                    ? 'bg-neutral-100 text-neutral-900 font-bold border-l-2 border-[#ff2a85]'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutGrid className="w-4 h-4 text-neutral-700" />
                  <span>Meus sites</span>
                </div>
                <span className="text-[10px] bg-neutral-200/70 text-neutral-600 px-1.5 py-0.5 rounded-full font-bold">
                  {biosites.length}
                </span>
              </button>

              {/* Novo Item: Gestão de Clientes */}
              <button
                type="button"
                onClick={() => {
                  setCurrentView('agency');
                  setAgencyActiveTab('clients');
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentView === 'agency' && agencyActiveTab === 'clients'
                    ? 'bg-neutral-100 text-neutral-900 font-bold border-l-2 border-[#ff2a85]'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-neutral-700" />
                  <span>Clientes</span>
                </div>
                <span className="text-[10px] bg-[#fff7fa] border border-[#fce7f3] text-[#ff2a85] px-1.5 py-0.5 rounded-full font-bold">
                  {clients?.length || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentView('agency');
                  setAgencyActiveTab('profile');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition cursor-pointer ${
                  currentView === 'agency' && agencyActiveTab === 'profile'
                    ? 'bg-neutral-100 text-neutral-900 font-bold border-l-2 border-[#ff2a85]'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 font-medium'
                }`}
              >
                <User className="w-4 h-4 text-neutral-700" />
                <span>Meu perfil</span>
              </button>

              <button
                type="button"
                onClick={() => showToast('Programa Seja Parceiro: Ganhe comissões indicando a MB Web Digital!', 'info')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition cursor-pointer"
              >
                <Gift className="w-4 h-4 text-neutral-500" />
                <span>Seja Parceiro</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.open('https://api.whatsapp.com/send?phone=5511999999999&text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20meu%20painel%20MB%20Web%20Digital', '_blank');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition cursor-pointer"
              >
                <Headphones className="w-4 h-4 text-neutral-500" />
                <span>Falar com gerente</span>
              </button>
            </nav>
          </div>

          {/* Card rosa claro escrito "PLANO PREMIUM - 1/30 sites usados" */}
          <div className="p-3.5 rounded-2xl bg-[#fff7fa] border border-[#fce7f3] space-y-0.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wide text-neutral-800 block">
              PLANO PREMIUM
            </span>
            <span className="text-xs text-neutral-500 block font-medium">
              {biosites.length}/30 sites usados
            </span>
          </div>
        </div>
      </div>

      {/* Rodapé com perfil do usuário e botão de Sair */}
      <div className="p-4 border-t border-neutral-100 space-y-3">
        
        {/* Simulador rápido de RBAC */}
        <div className="bg-neutral-50 rounded-xl p-2.5 border border-neutral-200 space-y-1.5">
          <div className="flex items-center justify-between text-neutral-600 font-semibold px-0.5 text-[11px]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#ff2a85]" />
              Papel atual:
            </span>
            <span className="text-[10px] bg-neutral-200/80 px-1.5 py-0.5 rounded font-mono font-bold text-neutral-800">
              ADMIN
            </span>
          </div>
          <button
            type="button"
            onClick={() => switchUserRole('client')}
            className="w-full py-1.5 px-2 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-800 font-semibold flex items-center justify-center gap-1.5 transition text-[11px] cursor-pointer shadow-2xs"
            title="Simular visão como cliente"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#ff2a85]" />
            <span>Simular como Cliente</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 rounded-full bg-[#ff2a85]/10 text-[#ff2a85] font-bold text-xs flex items-center justify-center shrink-0 border border-[#ff2a85]/20 shadow-2xs">
            MB
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-neutral-900 block truncate">
              {currentUser?.name || 'Maycon Barros (Admin)'}
            </span>
            <span className="text-[10px] text-neutral-500 block truncate">
              {currentUser?.email || 'mayconconsultoria@gmail.com'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            logout();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};
