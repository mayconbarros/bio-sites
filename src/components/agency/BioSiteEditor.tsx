import React, { useState } from 'react';
import { Biosite, Service, ThemeConfig } from '../../types';
import { useApp } from '../../context/AppContext';
import { BioSiteView } from '../public/BioSiteView';
import { THEME_PRESETS } from '../../data/mockData';
import { CustomToggle } from '../common/CustomToggle';
import { 
  Palette, 
  Link2, 
  Scissors, 
  CreditCard, 
  Clock, 
  ShieldCheck, 
  Smartphone, 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Copy,
  Check,
  Sparkles,
  Users,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface BioSiteEditorProps {
  biosite: Biosite;
  onBack: () => void;
}

export const BioSiteEditor: React.FC<BioSiteEditorProps> = ({ biosite, onBack }) => {
  const { 
    biosites,
    updateBiosite, 
    services, 
    addService, 
    updateService, 
    deleteService, 
    setCurrentView,
    setActiveBiositeId,
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'appearance' | 'buttons' | 'services' | 'pix_wifi' | 'schedule' | 'whitelabel'>('appearance');
  
  // Local form state for instant preview
  const [formData, setFormData] = useState<Biosite>(biosite);
  
  // Service modal state
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);

  // Sync if prop changes
  React.useEffect(() => {
    setFormData(biosite);
  }, [biosite]);

  const biositeServices = services.filter(s => s.biositeId === biosite.id);

  const handleFieldChange = (field: keyof Biosite, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    updateBiosite(biosite.id, { [field]: value });
  };

  const moveButton = async (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= formData.contactButtons.length) return;
    const nextButtons = [...formData.contactButtons];
    const [moved] = nextButtons.splice(idx, 1);
    nextButtons.splice(targetIdx, 0, moved);
    setFormData(prev => ({ ...prev, contactButtons: nextButtons }));
    try {
      await updateBiosite(biosite.id, { contactButtons: nextButtons });
      showToast('Ordem dos botões alterada e salva no banco Neon!', 'success');
    } catch (err: any) {
      showToast(`Erro ao salvar ordem no banco Neon: ${err?.message || 'Falha'}`, 'error');
    }
  };

  const handleThemePresetSelect = (preset: ThemeConfig) => {
    const updatedTheme = { ...preset };
    setFormData(prev => ({ ...prev, themeConfig: updatedTheme }));
    updateBiosite(biosite.id, { themeConfig: updatedTheme });
    showToast(`Tema "${preset.presetName}" aplicado!`);
  };

  const handleThemeColorChange = (colorKey: keyof ThemeConfig, val: string) => {
    const updatedTheme = { ...formData.themeConfig, [colorKey]: val };
    setFormData(prev => ({ ...prev, themeConfig: updatedTheme }));
    updateBiosite(biosite.id, { themeConfig: updatedTheme });
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.name) return;

    if (editingService.id) {
      updateService(editingService.id, editingService);
    } else {
      addService({
        biositeId: biosite.id,
        name: editingService.name || '',
        description: editingService.description || '',
        category: editingService.category || 'Geral',
        durationMinutes: Number(editingService.durationMinutes) || 45,
        price: Number(editingService.price) || 50,
        promotionalPrice: editingService.promotionalPrice ? Number(editingService.promotionalPrice) : undefined,
        images: editingService.images && editingService.images.length > 0 
          ? editingService.images 
          : ['https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80'],
        orderIndex: biositeServices.length,
        active: true,
      });
    }

    setServiceModalOpen(false);
    setEditingService(null);
  };

  const handleOpenAddService = () => {
    setEditingService({
      name: '',
      description: '',
      category: 'Especialidades',
      durationMinutes: 45,
      price: 70,
      images: ['https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80'],
      active: true,
    });
    setServiceModalOpen(true);
  };

  const handleOpenEditService = (service: Service) => {
    setEditingService(service);
    setServiceModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
      {/* Top action bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-neutral-900">{formData.title}</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-100 text-emerald-800">
                Ativo
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-mono">
              Link: /bio/{formData.slug}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch to client view */}
          <button
            onClick={() => {
              setActiveBiositeId(biosite.id);
              setCurrentView('client');
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium transition border border-neutral-200"
          >
            <Users className="w-3.5 h-3.5 text-amber-500" />
            Painel do Cliente
          </button>

          {/* Switch to public bio site view */}
          <button
            type="button"
            onClick={async () => {
              try {
                showToast('Salvando alterações no banco Neon...');
                await updateBiosite(biosite.id, formData);
                showToast('Mini-site salvo com sucesso no banco Neon!', 'success');
              } catch {
                showToast('Erro ao salvar no banco Neon', 'error');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            Salvar
          </button>

          <a
            href={`/${biosite.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.button === 1) return;
              try {
                const url = `/${biosite.slug}`;
                const win = window.open(url, '_blank');
                if (!win) {
                  e.preventDefault();
                  setActiveBiositeId(biosite.id);
                  window.history.pushState({}, '', url);
                  setCurrentView('public');
                } else {
                  e.preventDefault();
                }
              } catch {
                e.preventDefault();
                setActiveBiositeId(biosite.id);
                window.history.pushState({}, '', `/${biosite.slug}`);
                setCurrentView('public');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ff2a85] hover:bg-[#e61772] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            title={`Abrir ${biosite.title} (${biosite.slug})`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ver Publicado
          </a>
        </div>
      </header>

      {/* Main split grid: Controls on left, Live smartphone mockup on right */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* LEFT COLUMN: Editor Navigation Tabs & Controls (7 cols on lg) */}
        <div className="lg:col-span-7 border-r border-neutral-200 bg-white flex flex-col h-[calc(100vh-61px)] overflow-y-auto">
          {/* Navigation Tabs */}
          <div className="sticky top-0 z-20 bg-white border-b border-neutral-200 px-4 py-2 flex items-center gap-1 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('appearance')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
                activeTab === 'appearance' 
                  ? 'bg-neutral-900 text-white shadow-xs' 
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              Aparência & Cores
            </button>

            <button
              onClick={() => setActiveTab('buttons')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
                activeTab === 'buttons' 
                  ? 'bg-neutral-900 text-white shadow-xs' 
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              Botões de Contato
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
                activeTab === 'services' 
                  ? 'bg-neutral-900 text-white shadow-xs' 
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              Serviços ({biositeServices.length})
            </button>

            <button
              onClick={() => setActiveTab('pix_wifi')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
                activeTab === 'pix_wifi' 
                  ? 'bg-neutral-900 text-white shadow-xs' 
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Pix & Wi-Fi
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
                activeTab === 'schedule' 
                  ? 'bg-neutral-900 text-white shadow-xs' 
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Horários & Maps
            </button>

            <button
              onClick={() => setActiveTab('whitelabel')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
                activeTab === 'whitelabel' 
                  ? 'bg-neutral-900 text-white shadow-xs' 
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              White-label
            </button>
          </div>

          {/* TAB CONTENTS */}
          <div className="p-6 space-y-6">
            
            {/* TAB: APARÊNCIA */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-pink-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Presets Prontos de Alta Conversão
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Escolha um tema profissional ideal para o nicho do seu cliente:
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {THEME_PRESETS.map(preset => {
                      const isSelected = formData.themeConfig.presetId === preset.presetId;
                      return (
                        <div
                          key={preset.presetId}
                          onClick={() => handleThemePresetSelect(preset)}
                          className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                            isSelected 
                              ? 'border-pink-500 bg-neutral-900 shadow-md ring-2 ring-pink-500/20' 
                              : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/80'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">{preset.presetName}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-pink-400" />}
                            </div>
                            <div className="flex gap-1.5 mt-2">
                              <div className="w-5 h-5 rounded-full border border-white/20" style={{ background: preset.bgColor }} />
                              <div className="w-5 h-5 rounded-full border border-white/20" style={{ background: preset.primaryColor }} />
                              <div className="w-5 h-5 rounded-full border border-white/20" style={{ background: preset.cardBg }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <hr className="border-neutral-800" />

                {/* Identity Information */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Dados Visuais & Bio
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-neutral-300 block mb-1">
                        Nome do Estabelecimento *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={e => handleFieldChange('title', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-pink-500 transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-neutral-300 block mb-1">
                        Subtítulo / Especialidade
                      </label>
                      <input
                        type="text"
                        value={formData.subtitle}
                        onChange={e => handleFieldChange('subtitle', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-pink-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-300 block mb-1">
                      Biografia / Descrição Curta
                    </label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={e => handleFieldChange('description', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-pink-500 transition resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-neutral-300 block mb-1">
                        Foto de Perfil / Logo (URL)
                      </label>
                      <input
                        type="text"
                        value={formData.avatarUrl}
                        onChange={e => handleFieldChange('avatarUrl', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-pink-500 transition font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-neutral-300 block mb-1">
                        Instagram (@username)
                      </label>
                      <input
                        type="text"
                        value={formData.instagramHandle}
                        onChange={e => handleFieldChange('instagramHandle', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-pink-500 transition"
                      />
                    </div>
                  </div>

                  {/* Cover options */}
                  <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                    <label className="text-xs font-semibold text-neutral-300 block">
                      Capa do Topo (Banner)
                    </label>
                    <div className="flex gap-2 text-xs">
                      {(['image', 'gradient', 'video'] as const).map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleFieldChange('coverType', type)}
                          className={`px-3 py-1.5 rounded-xl capitalize font-semibold transition ${
                            formData.coverType === type 
                              ? 'bg-pink-600 text-white' 
                              : 'bg-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {type === 'image' ? 'Imagem Estática' : type === 'gradient' ? 'Gradiente' : 'Vídeo em Loop'}
                        </button>
                      ))}
                    </div>

                    {formData.coverType !== 'gradient' && (
                      <input
                        type="text"
                        placeholder="Insira a URL da imagem ou vídeo MP4..."
                        value={formData.coverUrl || ''}
                        onChange={e => handleFieldChange('coverUrl', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs focus:outline-none focus:border-pink-500 transition font-mono"
                      />
                    )}
                  </div>

                  {/* Button style selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-300 block">
                      Estilo Visual dos Botões
                    </label>
                    <div className="grid grid-cols-4 gap-2 text-xs font-medium text-center">
                      {[
                        { id: 'rounded', label: 'Arredondado' },
                        { id: 'pill', label: 'Pílula (Pill)' },
                        { id: 'sharp', label: 'Reto' },
                        { id: 'glass', label: 'Vidro (Glass)' },
                      ].map(style => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => {
                            const updated = { ...formData.themeConfig, buttonStyle: style.id as any };
                            setFormData(prev => ({ ...prev, themeConfig: updated }));
                            updateBiosite(biosite.id, { themeConfig: updated });
                          }}
                          className={`py-2 px-1 rounded-xl border transition ${
                            formData.themeConfig.buttonStyle === style.id
                              ? 'border-pink-500 bg-pink-500/20 text-white font-bold'
                              : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom color pickers */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Cor Primária</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.themeConfig.primaryColor}
                          onChange={e => handleThemeColorChange('primaryColor', e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-xs font-mono">{formData.themeConfig.primaryColor}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Cor de Fundo</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.themeConfig.bgColor}
                          onChange={e => handleThemeColorChange('bgColor', e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-xs font-mono">{formData.themeConfig.bgColor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: BOTÕES & REDES */}
            {activeTab === 'buttons' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Botões de Ação Rápida</h3>
                    <p className="text-xs text-neutral-400">
                      Configure os botões que aparecem no topo do bio site:
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {formData.contactButtons.map((btn, idx) => (
                    <div 
                      key={btn.id}
                      className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5 bg-neutral-800 p-0.5 rounded-lg border border-neutral-700">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveButton(idx, 'up')}
                              className={`w-5 h-5 rounded flex items-center justify-center transition ${
                                idx === 0 ? 'opacity-25 cursor-not-allowed text-neutral-500' : 'text-neutral-300 hover:bg-neutral-700 cursor-pointer'
                              }`}
                              title={idx === 0 ? undefined : "Subir posição"}
                            >
                              <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === formData.contactButtons.length - 1}
                              onClick={() => moveButton(idx, 'down')}
                              className={`w-5 h-5 rounded flex items-center justify-center transition ${
                                idx === formData.contactButtons.length - 1 ? 'opacity-25 cursor-not-allowed text-neutral-500' : 'text-neutral-300 hover:bg-neutral-700 cursor-pointer'
                              }`}
                              title={idx === formData.contactButtons.length - 1 ? undefined : "Descer posição"}
                            >
                              <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </div>
                          <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-white">
                            {btn.label}
                          </span>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={btn.active}
                            onChange={e => {
                              const updated = formData.contactButtons.map(b => 
                                b.id === btn.id ? { ...b, active: e.target.checked } : b
                              );
                              handleFieldChange('contactButtons', updated);
                            }}
                            className="rounded accent-pink-500"
                          />
                          <span className="text-neutral-400">Ativo</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-neutral-400 block mb-1">Texto do Botão</label>
                          <input
                            type="text"
                            value={btn.label}
                            onChange={e => {
                              const updated = formData.contactButtons.map(b => 
                                b.id === btn.id ? { ...b, label: e.target.value } : b
                              );
                              handleFieldChange('contactButtons', updated);
                            }}
                            className="w-full px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-neutral-400 block mb-1">Link de Destino / URL</label>
                          <input
                            type="text"
                            value={btn.url}
                            onChange={e => {
                              const updated = formData.contactButtons.map(b => 
                                b.id === btn.id ? { ...b, url: e.target.value } : b
                              );
                              handleFieldChange('contactButtons', updated);
                            }}
                            className="w-full px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs font-mono"
                          />
                        </div>
                      </div>

                      {btn.isWhatsApp && (
                        <div>
                          <label className="text-[11px] text-emerald-400 block mb-1 font-semibold">
                            💬 Mensagem Automática ao abrir o WhatsApp:
                          </label>
                          <input
                            type="text"
                            value={btn.prefilledMessage || ''}
                            onChange={e => {
                              const updated = formData.contactButtons.map(b => 
                                b.id === btn.id ? { ...b, prefilledMessage: e.target.value } : b
                              );
                              handleFieldChange('contactButtons', updated);
                            }}
                            className="w-full px-3 py-1.5 rounded-xl bg-neutral-950 border border-emerald-500/40 text-white text-xs"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: CATÁLOGO DE SERVIÇOS */}
            {activeTab === 'services' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Catálogo de Procedimentos & Serviços</h3>
                    <p className="text-xs text-neutral-400">
                      Adicione fotos, durações e preços para exibição em carrossel.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenAddService}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Novo Serviço
                  </button>
                </div>

                <div className="space-y-3">
                  {biositeServices.map(service => (
                    <div 
                      key={service.id}
                      className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-3 hover:border-neutral-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={service.images[0] || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&auto=format&fit=crop&q=80'} 
                          alt={service.name} 
                          className="w-14 h-14 rounded-xl object-cover border border-neutral-700 shrink-0" 
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white">{service.name}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-medium">
                              {service.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] mt-1">
                            <span className="text-neutral-400">⏱️ {service.durationMinutes} min</span>
                            <span className="text-neutral-600">•</span>
                            <span className="font-bold text-emerald-400">
                              R$ {(service.promotionalPrice || service.price).toFixed(2).replace('.', ',')}
                            </span>
                            {service.promotionalPrice && (
                              <span className="text-[10px] text-neutral-500 line-through">
                                R$ {service.price.toFixed(2).replace('.', ',')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditService(service)}
                          className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteService(service.id)}
                          className="p-2 rounded-lg bg-neutral-800 hover:bg-red-900/40 text-neutral-400 hover:text-red-400 transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: PIX & WI-FI */}
            {activeTab === 'pix_wifi' && (
              <div className="space-y-6">
                {/* Pix Settings */}
                <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400">
                        Integração Chave Pix
                      </h4>
                      <p className="text-xs text-neutral-400">
                        Permite que clientes copiem a chave em 1 clique ou vejam o QR Code.
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs text-neutral-300 font-medium">
                        {formData.pixConfig.enabled ? 'Habilitado' : 'Desabilitado'}
                      </span>
                      <CustomToggle
                        checked={formData.pixConfig.enabled}
                        onChange={val => {
                          const updated = { ...formData.pixConfig, enabled: val };
                          handleFieldChange('pixConfig', updated);
                        }}
                        title={formData.pixConfig.enabled ? "Desativar Pix" : "Habilitar Pix"}
                        ariaLabel="Habilitar Pix"
                      />
                    </div>
                  </div>

                  {formData.pixConfig.enabled && (
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-neutral-400 block mb-1">Tipo de Chave</label>
                          <select
                            value={formData.pixConfig.keyType}
                            onChange={e => {
                              const updated = { ...formData.pixConfig, keyType: e.target.value as any };
                              handleFieldChange('pixConfig', updated);
                            }}
                            className="w-full px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs"
                          >
                            <option value="phone">Celular</option>
                            <option value="email">E-mail</option>
                            <option value="cpf">CPF</option>
                            <option value="cnpj">CNPJ</option>
                            <option value="random">Chave Aleatória</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] text-neutral-400 block mb-1">Chave Pix *</label>
                          <input
                            type="text"
                            value={formData.pixConfig.pixKey}
                            onChange={e => {
                              const updated = { ...formData.pixConfig, pixKey: e.target.value };
                              handleFieldChange('pixConfig', updated);
                            }}
                            className="w-full px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-neutral-400 block mb-1">Nome do Favorecido</label>
                          <input
                            type="text"
                            value={formData.pixConfig.beneficiaryName}
                            onChange={e => {
                              const updated = { ...formData.pixConfig, beneficiaryName: e.target.value };
                              handleFieldChange('pixConfig', updated);
                            }}
                            className="w-full px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-neutral-400 block mb-1">Cidade / Estado</label>
                          <input
                            type="text"
                            value={formData.pixConfig.city}
                            onChange={e => {
                              const updated = { ...formData.pixConfig, city: e.target.value };
                              handleFieldChange('pixConfig', updated);
                            }}
                            className="w-full px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Wi-Fi Settings */}
                <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                        Integração Wi-Fi do Salão
                      </h4>
                      <p className="text-xs text-neutral-400">
                        Exibe o cartão de Wi-Fi para clientes que estão no espaço físico.
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs text-neutral-300 font-medium">
                        {formData.wifiConfig.enabled ? 'Habilitado' : 'Desabilitado'}
                      </span>
                      <CustomToggle
                        checked={formData.wifiConfig.enabled}
                        onChange={val => {
                          const updated = { ...formData.wifiConfig, enabled: val };
                          handleFieldChange('wifiConfig', updated);
                        }}
                        title={formData.wifiConfig.enabled ? "Desativar Wi-Fi" : "Habilitar Wi-Fi"}
                        ariaLabel="Habilitar Wi-Fi"
                      />
                    </div>
                  </div>

                  {formData.wifiConfig.enabled && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">Nome da Rede (SSID)</label>
                        <input
                          type="text"
                          value={formData.wifiConfig.networkName}
                          onChange={e => {
                            const updated = { ...formData.wifiConfig, networkName: e.target.value };
                            handleFieldChange('wifiConfig', updated);
                          }}
                          className="w-full px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">Senha do Wi-Fi</label>
                        <input
                          type="text"
                          value={formData.wifiConfig.password}
                          onChange={e => {
                            const updated = { ...formData.wifiConfig, password: e.target.value };
                            handleFieldChange('wifiConfig', updated);
                          }}
                          className="w-full px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: HORÁRIOS & LOCAL */}
            {activeTab === 'schedule' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-red-400">
                    Endereço & Rotas no Maps
                  </h4>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Endereço Completo</label>
                    <input
                      type="text"
                      value={formData.locationConfig.address}
                      onChange={e => {
                        const updated = { ...formData.locationConfig, address: e.target.value };
                        handleFieldChange('locationConfig', updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Link do Google Maps</label>
                      <input
                        type="text"
                        value={formData.locationConfig.googleMapsUrl}
                        onChange={e => {
                          const updated = { ...formData.locationConfig, googleMapsUrl: e.target.value };
                          handleFieldChange('locationConfig', updated);
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Link do Waze (Opcional)</label>
                      <input
                        type="text"
                        value={formData.locationConfig.wazeUrl || ''}
                        onChange={e => {
                          const updated = { ...formData.locationConfig, wazeUrl: e.target.value };
                          handleFieldChange('locationConfig', updated);
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Horários de Funcionamento da Semana
                  </h4>
                  <div className="space-y-2">
                    {formData.businessHours.map((schedule, idx) => (
                      <div 
                        key={schedule.dayOfWeek}
                        className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs gap-3"
                      >
                        <span className="font-semibold text-white w-24">{schedule.dayName}</span>

                        <div className="flex items-center gap-2 text-neutral-400">
                          <CustomToggle
                            size="sm"
                            checked={!schedule.closed}
                            onChange={isOpen => {
                              const updated = [...formData.businessHours];
                              updated[idx] = { ...updated[idx], closed: !isOpen };
                              handleFieldChange('businessHours', updated);
                            }}
                            title={schedule.closed ? 'Marcar como aberto' : 'Marcar como fechado'}
                            ariaLabel={`${schedule.dayName}: ${schedule.closed ? 'Fechado' : 'Aberto'}`}
                          />
                          <span className={`text-[11px] font-medium ${!schedule.closed ? 'text-white' : 'text-neutral-500'}`}>
                            {schedule.closed ? 'Fechado' : 'Aberto'}
                          </span>
                        </div>

                        {!schedule.closed && (
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={schedule.openTime}
                              onChange={e => {
                                const updated = [...formData.businessHours];
                                updated[idx] = { ...updated[idx], openTime: e.target.value };
                                handleFieldChange('businessHours', updated);
                              }}
                              className="px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-white text-[11px]"
                            />
                            <span className="text-neutral-500">às</span>
                            <input
                              type="time"
                              value={schedule.closeTime}
                              onChange={e => {
                                const updated = [...formData.businessHours];
                                updated[idx] = { ...updated[idx], closeTime: e.target.value };
                                handleFieldChange('businessHours', updated);
                              }}
                              className="px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-white text-[11px]"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: WHITE-LABEL */}
            {activeTab === 'whitelabel' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400">
                        Rodapé da Sua Agência (White-label)
                      </h4>
                      <p className="text-xs text-neutral-400">
                        Divulgue sua marca no rodapé do bio site para atrair novos clientes recorrentes.
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs text-neutral-300 font-medium">
                        {formData.footerBranding.enabled ? 'Exibindo' : 'Oculto'}
                      </span>
                      <CustomToggle
                        checked={formData.footerBranding.enabled}
                        onChange={val => {
                          const updated = { ...formData.footerBranding, enabled: val };
                          handleFieldChange('footerBranding', updated);
                        }}
                        title={formData.footerBranding.enabled ? "Ocultar rodapé" : "Exibir rodapé"}
                        ariaLabel="Exibir rodapé da agência"
                      />
                    </div>
                  </div>

                  {formData.footerBranding.enabled && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">Nome da Sua Agência</label>
                        <input
                          type="text"
                          value={formData.footerBranding.agencyName}
                          onChange={e => {
                            const updated = { ...formData.footerBranding, agencyName: e.target.value };
                            handleFieldChange('footerBranding', updated);
                          }}
                          className="w-full px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">Link do Rodapé (Site ou WhatsApp da Agência)</label>
                        <input
                          type="text"
                          value={formData.footerBranding.agencyUrl}
                          onChange={e => {
                            const updated = { ...formData.footerBranding, agencyUrl: e.target.value };
                            handleFieldChange('footerBranding', updated);
                          }}
                          className="w-full px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">Slogan ou Chamada</label>
                        <input
                          type="text"
                          value={formData.footerBranding.agencyTagline || ''}
                          onChange={e => {
                            const updated = { ...formData.footerBranding, agencyTagline: e.target.value };
                            handleFieldChange('footerBranding', updated);
                          }}
                          className="w-full px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: Live Smartphone Preview (iPhone Mockup) (5 cols on lg) */}
        <div className="lg:col-span-5 bg-neutral-100 flex flex-col items-center justify-center p-4 lg:p-8 h-[calc(100vh-61px)] overflow-y-auto border-t lg:border-t-0 border-neutral-200">
          <div className="flex items-center gap-2 mb-3 text-xs text-neutral-600 font-semibold">
            <Smartphone className="w-4 h-4 text-[#ff2a85]" />
            <span>Simulador em Tempo Real (Preview ao Vivo)</span>
          </div>

          {/* Smartphone Frame (iPhone 16 style) */}
          <div className="relative w-[360px] h-[720px] rounded-[48px] bg-black p-3.5 shadow-2xl border-[4px] border-neutral-800 flex flex-col overflow-hidden ring-1 ring-neutral-300">
            {/* Dynamic Island / Camera */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-800 mr-2" />
            </div>

            {/* Inner screen content */}
            <div className="w-full h-full rounded-[38px] overflow-y-auto overflow-x-hidden scrollbar-none bg-neutral-900 relative">
              <BioSiteView biosite={formData} isMockupFrame={true} />
            </div>

            {/* Bottom Home indicator bar */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full z-40 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* Add / Edit Service Modal */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-neutral-900">
              {editingService?.id ? 'Editar Serviço' : 'Novo Serviço'}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Nome do Procedimento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Corte Degradê + Barba"
                  value={editingService?.name || ''}
                  onChange={e => setEditingService(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">Categoria</label>
                  <input
                    type="text"
                    placeholder="Ex: Cabelo, Unhas"
                    value={editingService?.category || ''}
                    onChange={e => setEditingService(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">Duração (minutos)</label>
                  <input
                    type="number"
                    value={editingService?.durationMinutes || 45}
                    onChange={e => setEditingService(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">Preço Normal (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingService?.price || 50}
                    onChange={e => setEditingService(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">Preço Promo (Opcional)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 39.90"
                    value={editingService?.promotionalPrice || ''}
                    onChange={e => setEditingService(prev => ({ 
                      ...prev, 
                      promotionalPrice: e.target.value ? Number(e.target.value) : undefined 
                    }))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={editingService?.description || ''}
                  onChange={e => setEditingService(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">URL da Imagem</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={editingService?.images?.[0] || ''}
                  onChange={e => setEditingService(prev => ({ ...prev, images: [e.target.value] }))}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#ff2a85] hover:bg-[#e61772] text-white text-xs font-bold shadow-xs"
                >
                  Salvar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
