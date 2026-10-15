import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutGrid, 
  User, 
  Gift, 
  Headphones, 
  LogOut, 
  Sparkles,
  Smartphone,
  ChevronDown,
  Building2,
  Users
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    biosites, 
    activeBiositeId, 
    setActiveBiositeId,
    activeBiosite,
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
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              {currentView === 'client' ? 'PAINEL DO CLIENTE' : 'PAINEL DA AGÊNCIA'}
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-4 space-y-6">
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-3 block mb-2">
              Menu
            </span>

            <nav className="space-y-1">
              <button
                onClick={() => setCurrentView('agency')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  currentView === 'agency'
                    ? 'bg-neutral-100 text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4 text-neutral-700" />
                <span>Meus sites</span>
              </button>

              <button
                onClick={() => showToast('Perfil da conta: mayconconsultoria@gmail.com', 'info')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition"
              >
                <User className="w-4 h-4 text-neutral-500" />
                <span>Meu perfil</span>
              </button>

              <button
                onClick={() => showToast('Programa de afiliados: Ganhe comissões indicando a Coonexta!', 'info')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition"
              >
                <Gift className="w-4 h-4 text-neutral-500" />
                <span>Seja Parceiro</span>
              </button>

              <button
                onClick={() => {
                  window.open('https://api.whatsapp.com/send?phone=5511999999999&text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20meu%20painel%20Coonexta', '_blank');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition"
              >
                <Headphones className="w-4 h-4 text-neutral-500" />
                <span>Falar com gerente</span>
              </button>
            </nav>
          </div>

          {/* Plano Premium Box */}
          <div className="p-3.5 rounded-2xl bg-[#fff5f9] border border-[#fce7f3] space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wide text-neutral-800 block">
              PLANO PREMIUM
            </span>
            <span className="text-xs text-neutral-500 block">
              {biosites.length}/30 sites usados
            </span>
            {/* Visual progress bar */}
            <div className="w-full bg-pink-100 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div 
                className="bg-[#ff2a85] h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (biosites.length / 30) * 100)}%` }}
              />
            </div>
          </div>

          {/* View Switcher (Discreet for prototype testing) */}
          <div className="pt-2 border-t border-neutral-100 space-y-2">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-1 block">
              Visualização de Teste
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                onClick={() => setCurrentView('agency')}
                className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 border transition ${
                  currentView === 'agency'
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <Building2 className="w-3 h-3" />
                Agência
              </button>
              <button
                onClick={() => setCurrentView('client')}
                className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 border transition ${
                  currentView === 'client'
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <Users className="w-3 h-3" />
                Cliente
              </button>
            </div>

            {/* Site selector if in client view */}
            {currentView === 'client' && (
              <div className="pt-1">
                <select
                  value={activeBiositeId}
                  onChange={e => setActiveBiositeId(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-800 text-[11px] font-medium"
                >
                  {biosites.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sair Footer */}
      <div className="p-4 border-t border-neutral-100">
        <button
          onClick={() => showToast('Sessão encerrada com segurança!', 'info')}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};
