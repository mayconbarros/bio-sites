import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BioSiteEditor } from './BioSiteEditor';
import { THEME_PRESETS } from '../../data/mockData';
import { 
  Plus, 
  Settings, 
  ExternalLink, 
  Edit3, 
  Copy, 
  Trash2, 
  Eye, 
  Calendar, 
  DollarSign, 
  MousePointerClick, 
  Sparkles,
  Users,
  LayoutGrid,
  Check,
  FolderPlus
} from 'lucide-react';
import emptyStateIllustration from '../../assets/images/empty_state_illustration_1791938807425.jpg';
import { EMPTY_STATE_ILLUSTRATION_BASE64 } from '../../assets/images/emptyStateIllustrationBase64';

export const AgencyDashboard: React.FC = () => {
  const { 
    biosites, 
    setActiveBiositeId, 
    setCurrentView, 
    addBiosite, 
    duplicateBiosite, 
    deleteBiosite, 
    agencySettings, 
    updateAgencySettings, 
    getBiositeStats 
  } = useApp();

  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [newSiteModalOpen, setNewSiteModalOpen] = useState(false);
  const [agencyModalOpen, setAgencyModalOpen] = useState(false);
  const [viewTab, setViewTab] = useState<'create_screen' | 'list_screen'>('create_screen');

  // New site form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'manicure' | 'barbearia' | 'estetica' | 'salao' | 'outro'>('manicure');
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');

  // Agency settings form state
  const [agencyForm, setAgencyForm] = useState(agencySettings);

  const stats = getBiositeStats();

  const handleCreateSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const baseSlug = newTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const slug = `${baseSlug}-${Math.floor(Math.random() * 100)}`;

    const presetTheme = newCategory === 'barbearia' 
      ? THEME_PRESETS[1] 
      : newCategory === 'estetica' 
        ? THEME_PRESETS[3] 
        : THEME_PRESETS[0];

    const defaultAvatar = newCategory === 'barbearia'
      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80';

    const defaultCover = newCategory === 'barbearia'
      ? 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&auto=format&fit=crop&q=80';

    const created = addBiosite({
      title: newTitle,
      subtitle: newCategory === 'barbearia' ? 'Barbearia & Estilo Masculino' : 'Especialista em Beleza & Cuidados',
      slug,
      category: newCategory,
      clientName: newClientName || 'Dono(a) do Estabelecimento',
      clientPhone: newClientPhone || '(11) 99999-0000',
      clientEmail: 'contato@cliente.com',
      avatarUrl: defaultAvatar,
      coverType: 'image',
      coverUrl: defaultCover,
      themeConfig: presetTheme,
      status: 'active',
    });

    setNewSiteModalOpen(false);
    setNewTitle('');
    setNewClientName('');
    setNewClientPhone('');
    setActiveBiositeId(created.id);
    setCurrentView('client');
  };

  const handleSaveAgencySettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateAgencySettings(agencyForm);
    setAgencyModalOpen(false);
  };

  // If user is editing a specific site, render the BioSiteEditor
  const activeEditingSite = biosites.find(s => s.id === editingSiteId);
  if (activeEditingSite) {
    return (
      <BioSiteEditor
        biosite={activeEditingSite}
        onBack={() => setEditingSiteId(null)}
      />
    );
  }

  return (
    <div className="flex-1 bg-white min-h-screen flex flex-col">
      {/* Top Header Bar matching screenshot */}
      <header className="h-14 border-b border-neutral-200 bg-white px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 font-bold text-neutral-800 text-sm">
          <LayoutGrid className="w-4 h-4 text-neutral-600" />
          <span>Meus mini-sites</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick tab switcher between Initial Screen & Created Sites list */}
          <div className="flex items-center p-1 rounded-xl bg-neutral-100 text-xs">
            <button
              onClick={() => setViewTab('create_screen')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                viewTab === 'create_screen'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Tela Inicial
            </button>
            <button
              onClick={() => setViewTab('list_screen')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                viewTab === 'list_screen'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <span>Mini-sites criados</span>
              <span className="w-5 h-5 rounded-full bg-pink-100 text-[#ff2a85] text-[10px] font-bold flex items-center justify-center">
                {biosites.length}
              </span>
            </button>
          </div>

          <button
            onClick={() => {
              setAgencyForm(agencySettings);
              setAgencyModalOpen(true);
            }}
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition"
            title="Configurações da Agência"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Area */}
      {viewTab === 'create_screen' ? (
        /* EXACT SCREEN FROM USER SCREENSHOT */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          
          {/* Exact Image Loaded Directly in the Code */}
          <div className="relative mb-4 flex justify-center">
            <img 
              src={EMPTY_STATE_ILLUSTRATION_BASE64 || emptyStateIllustration} 
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.onerror = null;
                target.src = emptyStateIllustration || '/empty_state_illustration_1791938807425.jpg';
              }}
              alt="Bora criar seu primeiro mini-site"
              className="w-72 sm:w-80 h-72 sm:h-80 object-contain mx-auto select-none" 
            />
          </div>

          {/* Heading */}
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            Bora criar seu primeiro mini-site?
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 mb-6 font-medium">
            {30 - biosites.length} restantes no seu plano
          </p>

          {/* Large Hot Pink Circular Plus Button matching screenshot */}
          <button
            onClick={() => setNewSiteModalOpen(true)}
            className="w-16 h-16 rounded-full bg-[#ff2a85] hover:bg-[#e61772] text-white flex items-center justify-center shadow-xl shadow-pink-500/30 transition transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Criar novo mini-site"
          >
            <Plus className="w-8 h-8 stroke-[2.5]" />
          </button>

          {/* Quick link to view existing sites if any */}
          {biosites.length > 0 && (
            <button
              onClick={() => setViewTab('list_screen')}
              className="mt-6 text-xs font-semibold text-neutral-500 hover:text-neutral-900 underline"
            >
              Ou veja seus {biosites.length} mini-sites já criados →
            </button>
          )}
        </div>
      ) : (
        /* SITES LIST & MANAGEMENT VIEW */
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">
                Seus Mini-sites Criados
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Você tem {biosites.length} mini-sites ativos no seu plano.
              </p>
            </div>

            <button
              onClick={() => setNewSiteModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#ff2a85] hover:bg-[#e61772] text-white text-xs font-bold flex items-center gap-2 transition shadow-md shadow-pink-500/20"
            >
              <Plus className="w-4 h-4" />
              Criar Novo Mini-site
            </button>
          </div>

          {/* Metric summary banner */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
              <span className="text-xs text-neutral-500 block">Total de Visitas</span>
              <strong className="text-lg font-black text-neutral-900">{stats.views}</strong>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
              <span className="text-xs text-neutral-500 block">Cliques em Links</span>
              <strong className="text-lg font-black text-neutral-900">{stats.clicks}</strong>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
              <span className="text-xs text-neutral-500 block">Agendamentos</span>
              <strong className="text-lg font-black text-emerald-600">{stats.bookings}</strong>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
              <span className="text-xs text-neutral-500 block">Receita Estimada</span>
              <strong className="text-lg font-black text-emerald-600">
                R$ {stats.revenue.toFixed(2).replace('.', ',')}
              </strong>
            </div>
          </div>

          {/* Sites Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {biosites.map(site => {
              const siteStats = getBiositeStats(site.id);
              return (
                <div 
                  key={site.id}
                  className="rounded-3xl bg-white border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div>
                    {/* Cover image */}
                    <div className="relative h-28 w-full overflow-hidden bg-neutral-100">
                      <img 
                        src={site.coverUrl || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80'} 
                        alt={site.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                      />
                      <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-black/60 text-white">
                        {site.category}
                      </span>
                    </div>

                    {/* Profile and details */}
                    <div className="px-5 pb-4 -mt-9 relative space-y-3">
                      <div className="flex items-end justify-between">
                        <img 
                          src={site.avatarUrl} 
                          alt={site.title} 
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md bg-neutral-100" 
                        />
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => duplicateBiosite(site.id)}
                            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition"
                            title="Duplicar"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          {biosites.length > 1 && (
                            <button
                              onClick={() => deleteBiosite(site.id)}
                              className="p-2 rounded-xl bg-neutral-100 hover:bg-red-50 text-neutral-600 hover:text-red-600 transition"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-extrabold text-base text-neutral-900">
                          {site.title}
                        </h3>
                        <p className="text-xs text-neutral-500 font-mono">
                          /bio/{site.slug}
                        </p>
                        <p className="text-xs text-neutral-600 mt-1">
                          Cliente: <strong className="text-neutral-900">{site.clientName}</strong>
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-2xl bg-neutral-50 border border-neutral-100 text-center">
                        <div>
                          <span className="text-[10px] text-neutral-400 block">Visitas</span>
                          <strong className="text-xs text-neutral-800">{siteStats.views}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-400 block">Cliques</span>
                          <strong className="text-xs text-neutral-800">{siteStats.clicks}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-400 block">Agendados</span>
                          <strong className="text-xs text-emerald-600">{siteStats.bookings}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 pt-0 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setActiveBiositeId(site.id);
                          setCurrentView('client');
                        }}
                        className="py-2.5 px-3 rounded-xl bg-[#ff2a85] hover:bg-[#e61772] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Gerenciar Site
                      </button>

                      <button
                        onClick={() => {
                          setActiveBiositeId(site.id);
                          setCurrentView('client');
                        }}
                        className="py-2.5 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <Users className="w-3.5 h-3.5 text-amber-500" />
                        Painel Cliente
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setActiveBiositeId(site.id);
                        setCurrentView('public');
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-neutral-600 text-xs font-medium flex items-center justify-center gap-1.5 transition border border-neutral-200"
                    >
                      <ExternalLink className="w-3 h-3 text-[#ff2a85]" />
                      Abrir Bio Site Público
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE NEW SITE MODAL */}
      {newSiteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#ff2a85] flex items-center gap-1.5">
                <FolderPlus className="w-3.5 h-3.5" />
                Novo Mini-site
              </span>
              <h3 className="text-lg font-bold text-neutral-900 mt-1">
                Criar Mini-site para Negócio Local
              </h3>
              <p className="text-xs text-neutral-500">
                Defina o nome do estabelecimento e os dados do proprietário.
              </p>
            </div>

            <form onSubmit={handleCreateSite} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">
                  Nome do Negócio (Ex: Studio Bella Nails, Barbearia) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Studio Bella Estética"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs focus:outline-none focus:border-[#ff2a85] transition"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">
                  Nicho de Atuação
                </label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs"
                >
                  <option value="manicure">Manicure & Nail Designer</option>
                  <option value="barbearia">Barbearia Clássica / Moderna</option>
                  <option value="estetica">Clínica de Estética & Spa</option>
                  <option value="salao">Salão de Cabelo Feminino</option>
                  <option value="outro">Outro Negócio Local</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">
                    Nome do(a) Dono(a)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Amanda Santos"
                    value={newClientName}
                    onChange={e => setNewClientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">
                    WhatsApp do Cliente
                  </label>
                  <input
                    type="text"
                    placeholder="(11) 99999-8888"
                    value={newClientPhone}
                    onChange={e => setNewClientPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewSiteModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#ff2a85] hover:bg-[#e61772] text-white text-xs font-bold shadow-md shadow-pink-500/30"
                >
                  Criar e Abrir Editor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AGENCY WHITE-LABEL SETTINGS MODAL */}
      {agencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#ff2a85] flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5" />
                Configurações da Sua Agência
              </span>
              <h3 className="text-lg font-bold text-neutral-900 mt-1">
                Identidade White-label
              </h3>
              <p className="text-xs text-neutral-500">
                Esses dados aparecem no rodapé padrão dos bio sites que você vende.
              </p>
            </div>

            <form onSubmit={handleSaveAgencySettings} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">
                  Nome da Agência
                </label>
                <input
                  type="text"
                  required
                  value={agencyForm.name}
                  onChange={e => setAgencyForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">
                  Site ou Link de WhatsApp da Agência
                </label>
                <input
                  type="text"
                  required
                  value={agencyForm.url}
                  onChange={e => setAgencyForm(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">
                  Slogan ou Frase de Chamada
                </label>
                <input
                  type="text"
                  value={agencyForm.tagline}
                  onChange={e => setAgencyForm(prev => ({ ...prev, tagline: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAgencyModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#ff2a85] hover:bg-[#e61772] text-white text-xs font-bold shadow-md shadow-pink-500/20"
                >
                  Salvar Dados
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
