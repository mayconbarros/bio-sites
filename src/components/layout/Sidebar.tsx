import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutGrid, 
  User, 
  Gift, 
  Headphones, 
  LogOut
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    agencyActiveTab,
    setAgencyActiveTab,
    biosites, 
    showToast
  } = useApp();

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col justify-between shrink-0 min-h-screen select-none">
      <div>
        {/* Logo Coonexta */}
        <div className="p-5 flex items-center gap-3 border-b border-neutral-100">
          <div className="w-10 h-10 rounded-xl bg-[#ff2a85] flex items-center justify-center text-white shadow-md shadow-pink-500/20 shrink-0">
            {/* Custom soundwave broadcast icon */}
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 3v18c-1.2 0-2.4-.6-3.1-1.6L5.4 15H3c-1.1 0-2-.9-2-2v-2c0-1.1.9-2 2-2h2.4l3.5-4.4c.7-1 1.9-1.6 3.1-1.6zm4.5 4.5c1.8 1.8 2.8 4.2 2.8 6.5s-1 4.7-2.8 6.5l-1.4-1.4c1.4-1.4 2.2-3.3 2.2-5.1s-.8-3.7-2.2-5.1l1.4-1.4zm3.5-3.5c2.7 2.7 4.2 6.3 4.2 9.9s-1.5 7.2-4.2 9.9l-1.4-1.4c2.3-2.3 3.6-5.4 3.6-8.5s-1.3-6.2-3.6-8.5l1.4-1.4z" />
            </svg>
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-neutral-900 block leading-tight">
              Coonexta
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentView === 'agency' && agencyActiveTab === 'sites'
                    ? 'bg-neutral-100 text-neutral-900 font-bold'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4 text-neutral-700" />
                <span>Meus sites</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentView('agency');
                  setAgencyActiveTab('profile');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition cursor-pointer ${
                  currentView === 'agency' && agencyActiveTab === 'profile'
                    ? 'bg-neutral-100 text-neutral-900 font-bold'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 font-medium'
                }`}
              >
                <User className="w-4 h-4 text-neutral-700" />
                <span>Meu perfil</span>
              </button>

              <button
                type="button"
                onClick={() => showToast('Programa Seja Parceiro: Ganhe comissões indicando a Coonexta!', 'info')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition cursor-pointer"
              >
                <Gift className="w-4 h-4 text-neutral-500" />
                <span>Seja Parceiro</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.open('https://api.whatsapp.com/send?phone=5511999999999&text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20meu%20painel%20Coonexta', '_blank');
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

      {/* Rodapé apenas com botão de "Sair" */}
      <div className="p-4 border-t border-neutral-100">
        <button
          type="button"
          onClick={() => showToast('Sessão encerrada com segurança!', 'info')}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};
