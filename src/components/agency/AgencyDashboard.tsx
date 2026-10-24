import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BioSiteEditor } from './BioSiteEditor';
import { THEME_PRESETS } from '../../data/mockData';
import { 
  List, 
  Eye, 
  Clipboard, 
  Trash2, 
  Plus
} from 'lucide-react';
import emptyStateIllustration from '../../assets/images/empty_state_illustration_1791938807425.jpg';
import { EMPTY_STATE_ILLUSTRATION_BASE64 } from '../../assets/images/emptyStateIllustrationBase64';
import { CreatorProfilePage } from './CreatorProfilePage';
import { ClientManagementPage } from './ClientManagementPage';
import { LinksManagementPage } from '../links/LinksManagementPage';

export const AgencyDashboard: React.FC = () => {
  const { 
    biosites, 
    agencyActiveTab,
    setActiveBiositeId, 
    setCurrentView, 
    addBiosite, 
    deleteBiosite, 
    showToast,
    getBiositeStats,
    setClientActiveTab
  } = useApp();

  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [newSiteModalOpen, setNewSiteModalOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<string | null>(null);

  // New site form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'manicure' | 'barbearia' | 'estetica' | 'salao' | 'outro'>('manicure');
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');

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
      status: 'draft',
    });

    setNewSiteModalOpen(false);
    setNewTitle('');
    setNewClientName('');
    setNewClientPhone('');
    setActiveBiositeId(created.id);
    setClientActiveTab('aparencia');
    setCurrentView('client');
    showToast('Novo mini-site criado com sucesso!', 'success');
  };

  const handleCopyLink = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `bio.mbwebdigital.com.br/${slug}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url);
    }
    showToast('Link copiado com sucesso!', 'success');
  };

  const handleConfirmDelete = () => {
    if (!siteToDelete) return;
    deleteBiosite(siteToDelete);
    setSiteToDelete(null);
    showToast('Mini-site excluído!');
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

  // Profile page tab
  if (agencyActiveTab === 'profile') {
    return <CreatorProfilePage />;
  }

  // Clients management page tab
  if (agencyActiveTab === 'clients') {
    return <ClientManagementPage />;
  }

  // Links management page tab
  if (agencyActiveTab === 'links') {
    return <LinksManagementPage />;
  }

  return (
    <div className="flex-1 bg-white min-h-screen flex flex-col font-sans select-none">
      {/* Título superior: Ícone de lista + "Meus mini-sites" */}
      <header className="h-14 border-b border-neutral-200 bg-white px-6 flex items-center shrink-0">
        <div className="flex items-center gap-2.5 font-bold text-neutral-900 text-sm">
          <List className="w-4 h-4 text-neutral-700 stroke-[2.2]" />
          <span>Meus mini-sites</span>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6 md:p-8 flex flex-col bg-white">
        {/* Lista de Cards dos Sites */}
        {biosites.length > 0 && (
          <div className="w-full flex flex-wrap gap-5 justify-start">
            {biosites.map(site => {
              const stats = getBiositeStats(site.id);
              const viewsCount = stats?.views ?? 0;
              const isDraft = site.status !== 'active';

              return (
                /* Card do site: Um retângulo branco simples com borda arredondada */
                <div 
                  key={site.id}
                  className="w-full max-w-sm bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Linha Superior: Título + Badge minúscula cinza escrito "RASCUNHO" no canto superior direito */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base text-neutral-900 tracking-tight leading-tight">
                        {site.title}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-500 uppercase tracking-wider shrink-0">
                        {isDraft ? 'RASCUNHO' : 'PUBLICADO'}
                      </span>
                    </div>

                    {/* O link "bio.mbwebdigital.com.br/esmalteriavivp" */}
                    <a
                      href={`/${site.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-neutral-500 hover:text-neutral-900 hover:underline mt-1 font-normal inline-block transition cursor-pointer"
                      title="Abrir mini-site em nova aba"
                    >
                      bio.mbwebdigital.com.br/{site.slug}
                    </a>

                    {/* Embaixo disso, ícone de olho com "0 visualizações" */}
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-3">
                      <Eye className="w-4 h-4 text-neutral-400" />
                      <span>{viewsCount} visualizações</span>
                    </div>
                  </div>

                  {/* Embaixo de tudo: Botão verde-limão largo "Editar" e dois botões pequenos quadrados com prancheta e lixeira */}
                  <div className="flex items-center gap-2 mt-5">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveBiositeId(site.id);
                        setClientActiveTab('aparencia');
                        setCurrentView('client');
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#a3e635] hover:bg-[#84cc16] text-neutral-950 text-xs font-bold transition flex items-center justify-center cursor-pointer shadow-xs active:scale-[0.99]"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleCopyLink(site.slug, e)}
                      className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition cursor-pointer shrink-0"
                      title="Copiar link"
                    >
                      <Clipboard className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setSiteToDelete(site.id)}
                      className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-red-50 text-neutral-700 hover:text-red-600 flex items-center justify-center transition cursor-pointer shrink-0"
                      title="Excluir mini-site"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Área de criação: Abaixo do card, centralizado na tela */}
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          {/* Ilustração grande de uma mulher no celular */}
          <div className="relative mb-3 flex justify-center">
            <img 
              src={EMPTY_STATE_ILLUSTRATION_BASE64 || emptyStateIllustration} 
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.onerror = null;
                target.src = emptyStateIllustration || '/empty_state_illustration_1791938807425.jpg';
              }}
              alt="Mulher no celular"
              className="w-64 sm:w-72 h-64 sm:h-72 object-contain mx-auto select-none" 
            />
          </div>

          {/* Texto "Criar novo mini-site" em negrito */}
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Criar novo mini-site
          </h2>

          {/* Subtítulo "29 restantes no seu plano" */}
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 mb-6 font-medium">
            {30 - biosites.length} restantes no seu plano
          </p>

          {/* Botão redondo grande (círculo) na cor rosa com um sinal de "+" no meio */}
          <button
            type="button"
            onClick={() => setNewSiteModalOpen(true)}
            className="w-16 h-16 rounded-full bg-[#ff2a85] hover:bg-[#e61772] text-white flex items-center justify-center shadow-xl shadow-pink-500/30 transition transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Criar novo mini-site"
          >
            <Plus className="w-8 h-8 stroke-[2.5]" />
          </button>
        </div>
      </main>

      {/* CREATE NEW SITE MODAL */}
      {newSiteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-neutral-900">
                Criar Novo Mini-site
              </h3>
              <p className="text-xs text-neutral-500">
                Defina o nome do estabelecimento e os dados do proprietário.
              </p>
            </div>

            <form onSubmit={handleCreateSite} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">
                  Nome do Negócio *
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
                  className="w-1/2 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#ff2a85] hover:bg-[#e61772] text-white text-xs font-bold shadow-md shadow-pink-500/30 transition cursor-pointer"
                >
                  Criar Mini-site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {siteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white border border-neutral-200 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                Excluir mini-site?
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Essa ação é irreversível. Todos os dados, serviços e agendamentos deste mini-site serão removidos.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSiteToDelete(null)}
                className="w-1/2 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/30 cursor-pointer"
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
