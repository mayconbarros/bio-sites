import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_MOCK_SITES, MockSiteLink } from './mockLinksData';
import { AdminLinksView } from './AdminLinksView';
import { ClientLinkView } from './ClientLinkView';
import { 
  Link as LinkIcon, 
  ShieldCheck, 
  UserCheck, 
  QrCode, 
  X, 
  Download,
  Copy,
  Check
} from 'lucide-react';

export const LinksManagementPage: React.FC = () => {
  const { 
    currentUser, 
    switchUserRole, 
    biosites, 
    activeBiosite,
    showToast 
  } = useApp();

  const [qrModalSite, setQrModalSite] = useState<MockSiteLink | null>(null);
  const [copiedModal, setCopiedModal] = useState(false);

  // Determina se o papel atual é Admin ou Cliente
  const isClientRole = currentUser?.role === 'client';
  const pageTitle = isClientRole ? 'Meu link' : 'Meus links';

  // Monta a lista completa de mockSites com base nos dados iniciais + biosites criados
  const allSites: MockSiteLink[] = useMemo(() => {
    const list: MockSiteLink[] = [...INITIAL_MOCK_SITES];

    // Se houver algum biosite criado no contexto que não esteja nos mocks, adiciona
    biosites.forEach(b => {
      const exists = list.some(item => item.id === b.id || item.slug === b.slug);
      if (!exists) {
        list.push({
          id: b.id,
          name: b.title,
          url: `https://bio.mbwebdigital.com.br/${b.slug}`,
          slug: b.slug,
          category: b.category === 'barbearia' ? 'Barbearia' : b.category === 'estetica' ? 'Estética' : 'Manicure & Beleza',
          status: b.status === 'active' ? 'active' : 'draft',
          clientName: b.clientName,
          clientEmail: b.clientEmail
        });
      }
    });

    return list;
  }, [biosites]);

  // Se for 'client', entrega apenas 1 objeto correspondente ao site do cliente
  const clientSingleSite: MockSiteLink = useMemo(() => {
    // 1. Tenta achar pelo assignedBiositeIds do usuário cliente
    if (currentUser?.assignedBiositeIds && currentUser.assignedBiositeIds.length > 0) {
      const match = allSites.find(s => currentUser.assignedBiositeIds?.includes(s.id));
      if (match) return match;
    }

    // 2. Tenta pelo activeBiosite atual
    if (activeBiosite) {
      const match = allSites.find(s => s.id === activeBiosite.id || s.slug === activeBiosite.slug);
      if (match) return match;
    }

    // 3. Fallback padrão garantido: "Mayrah - Esmalteria Vip"
    return allSites[0] || INITIAL_MOCK_SITES[0];
  }, [currentUser, activeBiosite, allSites]);

  const handleCopyModalUrl = () => {
    if (!qrModalSite) return;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(qrModalSite.url);
    }
    setCopiedModal(true);
    setTimeout(() => setCopiedModal(false), 2000);
    showToast('Link copiado!', 'success');
  };

  return (
    <div className="flex-1 bg-white min-h-screen flex flex-col font-sans select-none">
      {/* Header da Página com Título Condicional: "Meus links" (Admin) ou "Meu link" (Cliente) */}
      <header className="h-14 border-b border-gray-200 bg-white px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 font-bold text-gray-900 text-sm">
          <LinkIcon className="w-4 h-4 text-[#ff2a85] stroke-[2.2]" />
          <span>{pageTitle}</span>
          <span className="text-[11px] font-medium text-gray-400 hidden sm:inline">
            {isClientRole ? '• Link oficial para compartilhamento' : '• Gerencie e copie links de todos os mini-sites'}
          </span>
        </div>

        {/* Simulador rápido de alternância Admin / Cliente */}
        <div className="flex items-center gap-2">
          {isClientRole ? (
            <button
              type="button"
              onClick={() => switchUserRole('admin')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 transition cursor-pointer"
              title="Alternar para visão de Administrador"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#ff2a85]" />
              <span className="hidden sm:inline">Alternar p/</span>
              <span>Admin (Plural)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => switchUserRole('client')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fff7fa] border border-[#fce7f3] text-[#ff2a85] hover:bg-[#ffedf4] text-xs font-semibold transition cursor-pointer"
              title="Alternar para visão de Cliente"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Alternar p/</span>
              <span>Cliente (Singular)</span>
            </button>
          )}
        </div>
      </header>

      {/* Área de Conteúdo Principal */}
      <main className="flex-1 p-6 md:p-8 bg-gray-50/50">
        <div className="max-w-5xl mx-auto">
          {isClientRole ? (
            /* Visão do Cliente: recebe apenas 1 objeto do site */
            <ClientLinkView 
              site={clientSingleSite} 
              onOpenQr={(site) => setQrModalSite(site)}
            />
          ) : (
            /* Visão do Admin: recebe o array completo */
            <AdminLinksView 
              sites={allSites} 
              onOpenQr={(site) => setQrModalSite(site)}
            />
          )}
        </div>
      </main>

      {/* Modal de QR Code */}
      {qrModalSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-gray-200 text-center relative">
            <button
              type="button"
              onClick={() => setQrModalSite(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-100 text-[#ff2a85] flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-5 h-5" />
            </div>

            <h3 className="font-bold text-gray-900 text-base">
              QR Code do Mini-site
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {qrModalSite.name}
            </p>

            {/* Imagem do QR Code gerada via API limpa */}
            <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-200 inline-block mx-auto">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrModalSite.url)}&color=000000`} 
                alt={`QR Code ${qrModalSite.name}`}
                className="w-44 h-44 rounded-lg block"
              />
            </div>

            <div className="mt-4 bg-gray-100 rounded-xl p-2.5 text-xs font-mono text-gray-700 truncate select-all">
              {qrModalSite.url}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleCopyModalUrl}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {copiedModal ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#84cc16]" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar URL</span>
                  </>
                )}
              </button>

              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(qrModalSite.url)}&download=1`}
                download={`qrcode-${qrModalSite.slug}.png`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-[#ff2a85] hover:bg-[#e01e72] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Imagem</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
