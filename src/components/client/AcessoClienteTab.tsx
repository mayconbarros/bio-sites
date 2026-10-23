import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  UserPlus, 
  Send, 
  Check, 
  ShieldCheck, 
  Trash2, 
  Copy, 
  X
} from 'lucide-react';

interface GrantedAccess {
  id: string;
  email: string;
  permissions: string[];
  createdAt: string;
}

// Definição dos 4 cards de categoria e seus itens exatos
const CATEGORIES = [
  {
    id: 'analise',
    title: 'ANÁLISE',
    items: [
      'Estatísticas',
      'Meus Links',
      'Cadastros deste site',
      'Pix recebidos',
      'Agendamentos',
    ],
  },
  {
    id: 'editar_site',
    title: 'EDITAR SITE',
    items: [
      'Templates',
      'Aparência',
      'Títulos',
      'Botões',
      'Catálogo',
      'Endereço',
      'Captura de leads',
      'Layout',
    ],
  },
  {
    id: 'agenda',
    title: 'AGENDA',
    items: [
      'Serviços',
      'Disponibilidade',
    ],
  },
  {
    id: 'integracoes',
    title: 'INTEGRAÇÕES',
    items: [
      'Pixels & Rastreio',
    ],
  },
];

const ALL_ITEMS = CATEGORIES.flatMap(cat => cat.items);

export const AcessoClienteTab: React.FC = () => {
  const { activeBiosite, clients, addClient, updateClient } = useApp();

  const [email, setEmail] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [grantedList, setGrantedList] = useState<GrantedAccess[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Storage key
  const storageKey = `biosaas_acessos_liberados_${activeBiosite?.id || 'default'}`;

  // Carregar lista salva ao montar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setGrantedList(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Erro ao ler acessos liberados:', e);
    }
  }, [storageKey]);

  // Salvar no localStorage
  const saveGrantedList = (list: GrantedAccess[]) => {
    setGrantedList(list);
    try {
      localStorage.setItem(storageKey, JSON.stringify(list));
    } catch (e) {
      console.error('Erro ao salvar acessos:', e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Alternar seleção de um item individual
  const togglePermission = (item: string) => {
    setSelectedPermissions(prev => 
      prev.includes(item) 
        ? prev.filter(p => p !== item) 
        : [...prev, item]
    );
  };

  // Presets
  const applyPreset = (preset: 'leitura' | 'operacional' | 'editor' | 'limpar') => {
    switch (preset) {
      case 'leitura':
        setSelectedPermissions([
          'Estatísticas',
          'Meus Links',
          'Cadastros deste site',
          'Pix recebidos',
          'Agendamentos',
        ]);
        break;
      case 'operacional':
        setSelectedPermissions([
          'Estatísticas',
          'Cadastros deste site',
          'Agendamentos',
          'Serviços',
          'Disponibilidade',
        ]);
        break;
      case 'editor':
        setSelectedPermissions([
          'Templates',
          'Aparência',
          'Títulos',
          'Botões',
          'Catálogo',
          'Endereço',
          'Captura de leads',
          'Layout',
        ]);
        break;
      case 'limpar':
        setSelectedPermissions([]);
        break;
    }
  };

  // Liberar acesso
  const handleLiberarAcesso = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      showToast('Por favor, informe o email do cliente.');
      return;
    }

    if (selectedPermissions.length === 0) {
      showToast('Marque pelo menos uma permissão para liberar o acesso.');
      return;
    }

    // Atualiza ou insere novo acesso no histórico local
    const existingIndex = grantedList.findIndex(g => g.email.toLowerCase() === cleanEmail);
    let updated: GrantedAccess[];

    if (existingIndex >= 0) {
      updated = [...grantedList];
      updated[existingIndex] = {
        ...updated[existingIndex],
        permissions: [...selectedPermissions],
        createdAt: new Date().toLocaleDateString('pt-BR'),
      };
      showToast(`Permissões atualizadas para ${cleanEmail}!`);
    } else {
      const newAccess: GrantedAccess = {
        id: `access-${Date.now()}`,
        email: cleanEmail,
        permissions: [...selectedPermissions],
        createdAt: new Date().toLocaleDateString('pt-BR'),
      };
      updated = [newAccess, ...grantedList];
      showToast(`Acesso liberado com sucesso para ${cleanEmail}!`);
    }

    // Sincroniza com o estado global de Gestão de Clientes
    const matchedClient = clients.find(c => c.email.toLowerCase() === cleanEmail);
    if (matchedClient) {
      const currentAssigned = matchedClient.assignedBiositeIds || [];
      const siteId = activeBiosite?.id;
      const newAssigned = siteId && !currentAssigned.includes(siteId) 
        ? [...currentAssigned, siteId] 
        : currentAssigned;
      updateClient(matchedClient.id, {
        permissions: Array.from(new Set([...matchedClient.permissions, ...selectedPermissions])),
        assignedBiositeIds: newAssigned,
        status: 'active'
      });
    } else {
      const inferredName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      addClient({
        name: inferredName || 'Novo Cliente',
        email: cleanEmail,
        role: 'client',
        status: 'active',
        assignedBiositeIds: activeBiosite?.id ? [activeBiosite.id] : [],
        permissions: [...selectedPermissions],
        mustChangePassword: true,
        temporaryPassword: 'SenhaSegura123!'
      });
    }

    saveGrantedList(updated);
    setEmail('');
    setSelectedPermissions([]);
  };

  // Remover acesso
  const handleRemoveAccess = (id: string, emailToRemove: string) => {
    const updated = grantedList.filter(g => g.id !== id);
    saveGrantedList(updated);
    showToast(`Acesso de ${emailToRemove} removido.`);
  };

  // Copiar link do cliente
  const handleCopyClientLink = () => {
    const link = `https://bio.mbwebdigital.com.br/painel/${activeBiosite?.slug || 'site'}`;
    navigator.clipboard.writeText(link);
    showToast('Link de acesso copiado!');
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans select-none animate-in fade-in duration-200">
      
      {/* Toast de Notificação */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="bg-[#0b1c14] border border-emerald-950/80 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-3 text-white">
            <button 
              onClick={() => setToastMessage(null)}
              className="w-4 h-4 rounded-full border border-neutral-600 flex items-center justify-center text-[10px] text-neutral-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-2.5 h-2.5" />
            </button>
            <span className="text-xs font-medium tracking-wide">{toastMessage}</span>
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          </div>
        </div>
      )}

      {/* Card Principal - Padrão do SaaS */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-7 shadow-2xs space-y-6">
        
        {/* 1. Topo da Página (Ações Principais) */}
        <div className="space-y-4">
          
          {/* Título e Subtítulo */}
          <div>
            <div className="flex items-center gap-2.5 text-neutral-900">
              <UserPlus className="w-5 h-5 text-neutral-800 stroke-[2.2]" />
              <h2 className="text-base font-bold text-neutral-900">
                Liberar acesso pro cliente final
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1 font-normal leading-relaxed">
              Informe o email do seu cliente e marque só o que ele pode ver/editar. Ele acessa pelo mesmo login do sistema.
            </p>
          </div>

          {/* Input e Botão Liberar Acesso */}
          <form onSubmit={handleLiberarAcesso}>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5">
              
              {/* Campo de texto longo */}
              <div className="flex-1 space-y-1">
                <label className="text-xs font-bold text-neutral-800 block">
                  Email do cliente
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@exemplo.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#84cc16]/30 focus:border-[#84cc16] transition font-medium"
                />
              </div>

              {/* Botão Liberar Acesso (verde limão com ícone de envelope) */}
              <button
                type="submit"
                className="h-[42px] px-6 rounded-xl bg-[#84cc16] hover:bg-[#65a30d] text-white flex items-center justify-center gap-2 font-bold transition shadow-xs cursor-pointer active:scale-95 text-xs whitespace-nowrap"
              >
                <Send className="w-4 h-4 stroke-[2.2]" />
                <span>Liberar acesso</span>
              </button>

            </div>
          </form>

          {/* Linha de Presets */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-xs font-semibold text-neutral-600">
              Presets:
            </span>
            <button
              type="button"
              onClick={() => applyPreset('leitura')}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 transition cursor-pointer active:scale-95 shadow-2xs"
            >
              Só leitura
            </button>
            <button
              type="button"
              onClick={() => applyPreset('operacional')}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 transition cursor-pointer active:scale-95 shadow-2xs"
            >
              Operacional
            </button>
            <button
              type="button"
              onClick={() => applyPreset('editor')}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 transition cursor-pointer active:scale-95 shadow-2xs"
            >
              Editor completo
            </button>
            <button
              type="button"
              onClick={() => applyPreset('limpar')}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 transition cursor-pointer active:scale-95 shadow-2xs"
            >
              Limpar
            </button>
          </div>

        </div>

        {/* 2. Grid de Permissões: Exatas 2 Colunas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-xl border border-neutral-200/80 p-4 sm:p-5 transition hover:border-neutral-300"
            >
              {/* Título da Categoria */}
              <h3 className="text-xs font-bold text-neutral-800 tracking-wider uppercase mb-3.5">
                {cat.title}
              </h3>

              {/* Lista Vertical de Itens */}
              <div className="space-y-2.5">
                {cat.items.map((item) => {
                  const isChecked = selectedPermissions.includes(item);

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => togglePermission(item)}
                      className="w-full flex items-center gap-3 text-left cursor-pointer group py-0.5 select-none"
                    >
                      {/* Checkbox Circular Customizado */}
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-[#ff2a85] border-2 border-[#ff2a85]'
                            : 'bg-white border-2 border-neutral-400 group-hover:border-neutral-600'
                        }`}
                      >
                        {isChecked && (
                          <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />
                        )}
                      </div>

                      {/* Nome do Item */}
                      <span className={`text-sm font-medium transition-colors ${
                        isChecked ? 'text-neutral-900' : 'text-neutral-700 group-hover:text-neutral-950'
                      }`}>
                        {item}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 4. Rodapé da Página: Acessos liberados */}
        <div className="pt-2 space-y-3">
          
          {/* Subtítulo em negrito: Ícone de escudo + texto */}
          <div className="flex items-center gap-2 text-neutral-900">
            <ShieldCheck className="w-4 h-4 text-neutral-700 stroke-[2.2]" />
            <h4 className="text-xs font-bold text-neutral-900">
              Acessos liberados ({grantedList.length})
            </h4>
          </div>

          {/* Caixa grande largura total */}
          {grantedList.length === 0 ? (
            <div className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/50 py-10 px-4 text-center">
              <p className="text-xs text-neutral-500 font-medium">
                Nenhum acesso liberado ainda.
              </p>
            </div>
          ) : (
            <div className="w-full rounded-xl border border-neutral-200/80 bg-white divide-y divide-neutral-100 overflow-hidden">
              {grantedList.map((access) => (
                <div 
                  key={access.id}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/60 transition"
                >
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-neutral-900">
                        {access.email}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        • Liberado em {access.createdAt}
                      </span>
                    </div>

                    {/* Tags das permissões */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {access.permissions.map((p) => (
                        <span 
                          key={p} 
                          className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-[10px] font-medium"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={handleCopyClientLink}
                      className="px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                      title="Copiar link de acesso"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar link</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveAccess(access.id, access.email)}
                      className="p-1.5 rounded-lg border border-neutral-200 hover:border-red-200 hover:bg-red-50 text-neutral-400 hover:text-red-600 transition cursor-pointer"
                      title="Revogar acesso"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
