import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomToggle } from '../common/CustomToggle';
import { 
  Key, 
  Plus, 
  Check, 
  X, 
  Copy, 
  Send, 
  ShieldCheck, 
  Mail, 
  Search, 
  UserCheck, 
  Clock, 
  CalendarDays, 
  Palette, 
  Type, 
  MousePointerClick, 
  BookOpen, 
  MapPin, 
  MailCheck, 
  Columns, 
  LayoutGrid, 
  Target, 
  BarChart2, 
  DollarSign, 
  Link as LinkIcon, 
  Users, 
  ClipboardList, 
  Gift, 
  Trash2,
  Lock,
  Unlock,
  ExternalLink
} from 'lucide-react';

export interface ClientFeaturePermission {
  id: string;
  name: string;
  description: string;
  category: 'analise' | 'editor' | 'agenda' | 'integracoes';
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
}

const DEFAULT_FEATURES: Omit<ClientFeaturePermission, 'enabled'>[] = [
  // Agenda
  {
    id: 'servicos',
    name: 'Serviços & Preços',
    description: 'Permite cadastrar procedimentos, alterar durações, valores e preços promocionais.',
    category: 'agenda',
    icon: Clock,
  },
  {
    id: 'profissionais',
    name: 'Profissionais & Equipe',
    description: 'Gerenciamento de colaboradores, cores na agenda, horários e folgas individuais.',
    category: 'agenda',
    icon: UserCheck,
  },
  {
    id: 'disponibilidade',
    name: 'Disponibilidade & Folgas',
    description: 'Ajuste de dias de funcionamento, intervalos de almoço e bloqueio de datas.',
    category: 'agenda',
    icon: CalendarDays,
  },
  {
    id: 'agendamentos',
    name: 'Painel de Agendamentos',
    description: 'Visualização da lista de agendamentos recebidos, status e cancelamentos.',
    category: 'agenda',
    icon: Users,
  },

  // Análise & Relatórios
  {
    id: 'estatisticas',
    name: 'Estatísticas & Visitas',
    description: 'Gráficos de acessos, visualizações por período e taxa de conversão.',
    category: 'analise',
    icon: BarChart2,
  },
  {
    id: 'pix',
    name: 'Pix Recebidos',
    description: 'Extrato financeiro com relatório de pagamentos e sinais recebidos via Pix.',
    category: 'analise',
    icon: DollarSign,
  },
  {
    id: 'cadastros',
    name: 'Cadastros & Clientes',
    description: 'Lista de contatos e clientes que agendaram ou se cadastraram pelo mini-site.',
    category: 'analise',
    icon: ClipboardList,
  },
  {
    id: 'links',
    name: 'Cliques nos Links',
    description: 'Métricas detalhadas de cliques em cada botão e rede social.',
    category: 'analise',
    icon: LinkIcon,
  },

  // Edição do Mini-Site
  {
    id: 'catalogo',
    name: 'Catálogo de Trabalhos / Fotos',
    description: 'Upload de fotos, galeria de procedimentos e carrossel de fotos no site.',
    category: 'editor',
    icon: BookOpen,
  },
  {
    id: 'botoes',
    name: 'Botões de Contato & Redes',
    description: 'Configuração do botão de WhatsApp, Instagram, telefone e botões personalizados.',
    category: 'editor',
    icon: MousePointerClick,
  },
  {
    id: 'titulos',
    name: 'Títulos, Bio & Textos',
    description: 'Alteração do nome do estabelecimento, descrição, subtítulo e bio do mini-site.',
    category: 'editor',
    icon: Type,
  },
  {
    id: 'aparencia',
    name: 'Aparência & Cores',
    description: 'Personalização da paleta de cores, tipografia e botões visuais do tema.',
    category: 'editor',
    icon: Palette,
  },
  {
    id: 'endereco',
    name: 'Endereço & Localização',
    description: 'Link do Google Maps, Waze e instruções de rota para o espaço físico.',
    category: 'editor',
    icon: MapPin,
  },
  {
    id: 'leads',
    name: 'Captura de Leads',
    description: 'Formulário integrado para captação de contatos de clientes.',
    category: 'editor',
    icon: MailCheck,
  },
  {
    id: 'layout',
    name: 'Layout & Ordem dos Blocos',
    description: 'Reordenação das seções do mini-site (sobre, galeria, serviços, mapa).',
    category: 'editor',
    icon: Columns,
  },
  {
    id: 'templates',
    name: 'Seleção de Templates',
    description: 'Troca de layouts pré-definidos para o mini-site.',
    category: 'editor',
    icon: LayoutGrid,
  },

  // Integrações
  {
    id: 'pixels',
    name: 'Pixels & Rastreamento',
    description: 'Inserção de Pixel do Meta (Facebook/Instagram), Google Analytics e TikTok.',
    category: 'integracoes',
    icon: Target,
  },
  {
    id: 'seja_parceiro',
    name: 'Programa Seja Parceiro',
    description: 'Acesso ao painel de indicação e comissionamento recorrente.',
    category: 'integracoes',
    icon: Gift,
  },
];

interface ClientAccessProfile {
  email: string;
  name: string;
  active: boolean;
  permissions: Record<string, boolean>;
  updatedAt: string;
}

export const AcessoClienteTab: React.FC = () => {
  const { activeBiosite, updateBiosite } = useApp();

  // Input states
  const [emailInput, setEmailInput] = useState(activeBiosite?.clientEmail || '');
  const [selectedEmail, setSelectedEmail] = useState<string>(activeBiosite?.clientEmail || '');
  const [profiles, setProfiles] = useState<Record<string, ClientAccessProfile>>({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Permissões de acesso salvas com sucesso!');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'agenda' | 'analise' | 'editor' | 'integracoes'>('all');

  // Load profiles from localStorage on mount
  useEffect(() => {
    const storageKey = `biosaas_client_profiles_${activeBiosite?.id || 'default'}`;
    const saved = localStorage.getItem(storageKey);
    let initialProfiles: Record<string, ClientAccessProfile> = {};

    if (saved) {
      try {
        initialProfiles = JSON.parse(saved);
      } catch (err) {
        console.error('Error parsing client profiles:', err);
      }
    }

    // Ensure active client is in the profiles map
    const defaultEmail = (activeBiosite?.clientEmail || 'cliente@exemplo.com.br').toLowerCase().trim();
    if (!initialProfiles[defaultEmail]) {
      const defaultPermissions: Record<string, boolean> = {};
      DEFAULT_FEATURES.forEach(f => {
        defaultPermissions[f.id] = true;
      });

      initialProfiles[defaultEmail] = {
        email: defaultEmail,
        name: activeBiosite?.clientName || 'Cliente Principal',
        active: true,
        permissions: defaultPermissions,
        updatedAt: new Date().toISOString(),
      };
    }

    setProfiles(initialProfiles);
    if (!selectedEmail) {
      setSelectedEmail(defaultEmail);
      setEmailInput(defaultEmail);
    }
  }, [activeBiosite?.id]);

  // Save profiles to localStorage
  const saveProfilesToStorage = (updated: Record<string, ClientAccessProfile>) => {
    setProfiles(updated);
    const storageKey = `biosaas_client_profiles_${activeBiosite?.id || 'default'}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  // Submit / search email
  const handleEmailSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) return;

    let updated = { ...profiles };
    if (!updated[cleanEmail]) {
      // New client access profile with all features enabled initially
      const initialPermissions: Record<string, boolean> = {};
      DEFAULT_FEATURES.forEach(f => {
        initialPermissions[f.id] = true;
      });

      updated[cleanEmail] = {
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        active: true,
        permissions: initialPermissions,
        updatedAt: new Date().toISOString(),
      };

      setToastMessage(`Acesso criado para ${cleanEmail}! Funções liberadas.`);
    } else {
      setToastMessage(`Acesso de ${cleanEmail} carregado.`);
    }

    saveProfilesToStorage(updated);
    setSelectedEmail(cleanEmail);

    // Also update biosite if this is the primary client
    if (activeBiosite && (!activeBiosite.clientEmail || activeBiosite.clientEmail === cleanEmail)) {
      updateBiosite(activeBiosite.id, { clientEmail: cleanEmail });
    }

    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3500);
  };

  // Toggle single permission for current profile
  const handleTogglePermission = (featureId: string, enabled: boolean) => {
    if (!selectedEmail || !profiles[selectedEmail]) return;

    const currentProfile = profiles[selectedEmail];
    const updatedPermissions = {
      ...currentProfile.permissions,
      [featureId]: enabled,
    };

    const updatedProfiles = {
      ...profiles,
      [selectedEmail]: {
        ...currentProfile,
        permissions: updatedPermissions,
        updatedAt: new Date().toISOString(),
      },
    };

    saveProfilesToStorage(updatedProfiles);
  };

  // Toggle all permissions on / off
  const handleToggleAll = (enableAll: boolean) => {
    if (!selectedEmail || !profiles[selectedEmail]) return;

    const currentProfile = profiles[selectedEmail];
    const updatedPermissions: Record<string, boolean> = {};
    DEFAULT_FEATURES.forEach(f => {
      updatedPermissions[f.id] = enableAll;
    });

    const updatedProfiles = {
      ...profiles,
      [selectedEmail]: {
        ...currentProfile,
        permissions: updatedPermissions,
        updatedAt: new Date().toISOString(),
      },
    };

    saveProfilesToStorage(updatedProfiles);
    setToastMessage(enableAll ? 'Todas as funções foram liberadas!' : 'Todas as funções foram bloqueadas.');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  // Toggle client account active status
  const handleToggleClientActive = (active: boolean) => {
    if (!selectedEmail || !profiles[selectedEmail]) return;

    const currentProfile = profiles[selectedEmail];
    const updatedProfiles = {
      ...profiles,
      [selectedEmail]: {
        ...currentProfile,
        active,
        updatedAt: new Date().toISOString(),
      },
    };

    saveProfilesToStorage(updatedProfiles);
    setToastMessage(active ? 'Acesso do cliente ativado!' : 'Acesso do cliente desativado temporariamente.');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  // Save all permissions with toast
  const handleSaveAll = () => {
    setToastMessage('Permissões de acesso salvas com sucesso!');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3500);
  };

  // Copy access link
  const handleCopyLink = () => {
    const link = `https://www.coonexta.com.br/painel/${activeBiosite?.slug || 'site'}`;
    navigator.clipboard.writeText(link);
    setToastMessage('Link de acesso do cliente copiado!');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  // Active profile data
  const currentProfile = selectedEmail ? profiles[selectedEmail] : null;
  const currentPermissions = currentProfile?.permissions || {};

  // Count active permissions
  const activeCount = DEFAULT_FEATURES.filter(f => currentPermissions[f.id] !== false).length;
  const totalCount = DEFAULT_FEATURES.length;

  // Filtered features list
  const filteredFeatures = DEFAULT_FEATURES.filter(f => {
    if (categoryFilter === 'all') return true;
    return f.category === categoryFilter;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans select-none animate-in fade-in duration-200">
      
      {/* Toast Notification matching Print 2 dark pill: #0b1c14 + green checkmark badge */}
      {showSuccessToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="bg-[#0b1c14] border border-emerald-950/80 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-3 text-white">
            <button 
              onClick={() => setShowSuccessToast(false)}
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

      {/* Main Card with exact paddings and styling from Serviços & Profissionais */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-7 shadow-2xs space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
            <Key className="w-5 h-5 text-neutral-700" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Acesso do cliente
            </h2>
            <p className="text-xs text-neutral-500 mt-1 font-normal leading-relaxed">
              Como administrador do SaaS, defina quais funções e ferramentas específicas ficam liberadas para cada cliente informando apenas o e-mail no campo abaixo.
            </p>
          </div>
        </div>

        {/* Input do E-mail do Cliente (Formulário no mesmo estilo de Serviços) */}
        <form onSubmit={handleEmailSubmit} className="pt-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            
            {/* E-mail do cliente */}
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-bold text-neutral-800 block">
                E-mail do cliente
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Ex: cliente@salaoexemplo.com.br"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition font-medium"
                />
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Botão Verde com Ícone + / Salvar */}
            <div className="sm:self-end flex items-center gap-2">
              <button
                type="submit"
                className="w-full sm:w-auto h-[42px] px-5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white flex items-center justify-center gap-2 font-bold transition shadow-xs cursor-pointer active:scale-95 text-xs"
                title="Gerenciar e Liberar Funções"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Liberar / Gerenciar</span>
              </button>
            </div>

          </div>
        </form>

        {/* E-mails Cadastrados / Sugestões rápidas */}
        {Object.keys(profiles).length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-neutral-400 font-bold text-[11px] uppercase tracking-wider shrink-0">
              Clientes configurados:
            </span>
            {Object.keys(profiles).map(emailKey => {
              const prof = profiles[emailKey];
              const isSelected = selectedEmail === emailKey;
              return (
                <button
                  key={emailKey}
                  type="button"
                  onClick={() => {
                    setSelectedEmail(emailKey);
                    setEmailInput(emailKey);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shrink-0 border ${
                    isSelected 
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs' 
                      : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${prof.active ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
                  <span>{emailKey}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Separador */}
        <div className="border-t border-neutral-100 pt-5">
          
          {/* PRINT 1: Estado sem cliente selecionado */}
          {!currentProfile ? (
            <div className="py-14 px-4 text-center rounded-2xl border-2 border-dashed border-neutral-200/80 bg-neutral-50/50 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
                <Key className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-neutral-800 mb-1">
                Nenhum cliente selecionado
              </h4>
              <p className="text-xs text-neutral-500 max-w-md">
                Digite o e-mail do cliente no campo acima e clique em <strong className="font-semibold text-neutral-700">Liberar / Gerenciar</strong> para habilitar e customizar individualmente quais ferramentas e funções estarão ativas para ele.
              </p>
            </div>
          ) : (
            /* PRINT 2: Visão com as funções liberadas e controle granular */
            <div className="space-y-6">
              
              {/* Barra de Status do Cliente e Ações Rápidas */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50/90 border border-neutral-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Info do Cliente */}
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#ff2a85]/10 text-[#ff2a85] flex items-center justify-center font-bold text-base shrink-0 border border-[#ff2a85]/20">
                    {currentProfile.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-neutral-900">
                        {currentProfile.email}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        currentProfile.active 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-neutral-100 text-neutral-500 border-neutral-300'
                      }`}>
                        {currentProfile.active ? 'Acesso Ativo' : 'Acesso Desativado'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      <strong className="text-neutral-800 font-semibold">{activeCount} de {totalCount}</strong> funções liberadas para este cliente
                    </p>
                  </div>
                </div>

                {/* Ações da Conta: Toggle Ativo + Copiar Link */}
                <div className="flex items-center gap-2.5 flex-wrap self-start md:self-center">
                  <div className="flex items-center gap-2 pr-2 border-r border-neutral-200">
                    <span className="text-xs text-neutral-600 font-medium">Conta ativa:</span>
                    <CustomToggle 
                      checked={currentProfile.active} 
                      onChange={handleToggleClientActive}
                      title={currentProfile.active ? "Desativar login do cliente" : "Ativar login do cliente"}
                      ariaLabel="Ativar ou desativar acesso do cliente"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const link = `https://www.coonexta.com.br/painel/${activeBiosite?.slug || 'site'}`;
                      const msg = encodeURIComponent(`Olá! Seu acesso ao painel do seu Mini-site está liberado!\n\n🔗 Link: ${link}\n👤 Login: ${currentProfile.email}\n\nVocê já pode gerenciar os serviços e agendamentos liberados.`);
                      window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar WhatsApp</span>
                  </button>
                </div>

              </div>

              {/* Filtros de Categoria e Ações em Massa */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                
                {/* Abas de filtro */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {[
                    { id: 'all', label: 'Todas as Funções' },
                    { id: 'agenda', label: 'Agenda & Serviços' },
                    { id: 'analise', label: 'Análise & Métricas' },
                    { id: 'editor', label: 'Edição do Site' },
                    { id: 'integracoes', label: 'Integrações' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setCategoryFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 ${
                        categoryFilter === tab.id
                          ? 'bg-[#ff2a85] text-white shadow-xs'
                          : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/80'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Botões Marcar Todas / Desmarcar Todas */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleAll(true)}
                    className="text-xs font-bold text-neutral-600 hover:text-neutral-900 hover:underline px-2 py-1 transition cursor-pointer"
                  >
                    Liberar todas
                  </button>
                  <span className="text-neutral-300">•</span>
                  <button
                    type="button"
                    onClick={() => handleToggleAll(false)}
                    className="text-xs font-bold text-neutral-600 hover:text-neutral-900 hover:underline px-2 py-1 transition cursor-pointer"
                  >
                    Bloquear todas
                  </button>
                </div>

              </div>

              {/* Lista das Funções com os Switches CustomToggle exatos */}
              <div className="space-y-2.5">
                {filteredFeatures.map(feature => {
                  const Icon = feature.icon;
                  const isEnabled = currentPermissions[feature.id] !== false;

                  return (
                    <div 
                      key={feature.id}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
                        isEnabled 
                          ? 'border-neutral-200 bg-white hover:border-neutral-300 shadow-2xs' 
                          : 'border-neutral-200/60 bg-neutral-50/50 opacity-75'
                      }`}
                    >
                      {/* Ícone + Nome da Função + Descrição */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                          isEnabled 
                            ? 'bg-neutral-100 text-neutral-800 border-neutral-200' 
                            : 'bg-neutral-100 text-neutral-400 border-neutral-200/60'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-bold text-neutral-900">
                              {feature.name}
                            </h4>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isEnabled 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                            }`}>
                              {isEnabled ? 'Liberado' : 'Bloqueado'}
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs text-neutral-500 font-normal leading-relaxed mt-0.5">
                            {feature.description}
                          </p>
                        </div>
                      </div>

                      {/* Switch Liga/Desliga Exato */}
                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                        <CustomToggle
                          checked={isEnabled}
                          onChange={(checked) => handleTogglePermission(feature.id, checked)}
                          title={isEnabled ? `Bloquear ${feature.name}` : `Liberar ${feature.name}`}
                          ariaLabel={`Liberar ou bloquear ${feature.name}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botão Inferior de Salvar */}
              <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-neutral-400">
                  As permissões são atualizadas instantaneamente para o cliente <strong className="text-neutral-700">{currentProfile.email}</strong>.
                </span>

                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Salvar Permissões</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
