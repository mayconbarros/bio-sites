import React, { useState } from 'react';
import { MockSiteLink } from './mockLinksData';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Share2, 
  QrCode, 
  MessageCircle,
  Sparkles,
  Globe
} from 'lucide-react';

interface ClientLinkViewProps {
  site: MockSiteLink;
  onOpenQr?: (site: MockSiteLink) => void;
}

export const ClientLinkView: React.FC<ClientLinkViewProps> = ({ site, onOpenQr }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(site.url);
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Olá! Conheça nosso catálogo e agende seu horário no nosso mini-site: ${site.url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-4 md:py-8">
      {/* Card Centralizado e de Destaque */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 shadow-2xs text-center">
        
        {/* Ícone no topo */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-[#ff2a85] mb-5">
          <Globe className="w-7 h-7" />
        </div>

        {/* Nome do Negócio */}
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          {site.name}
        </h2>

        {/* Texto solicitado: Compartilhe seu mini-site: */}
        <p className="text-sm sm:text-base font-semibold text-gray-700 mt-2">
          Compartilhe seu mini-site:
        </p>
        <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
          Envie seu link para clientes, cole na biografia do Instagram e use em suas divulgações para receber agendamentos.
        </p>

        {/* Box da URL com tamanho generoso e texto bem legível */}
        <div className="mt-6 mb-5">
          <div 
            onClick={handleCopy}
            className="w-full bg-gray-50 hover:bg-gray-100/80 border-2 border-dashed border-gray-200 hover:border-[#ff2a85]/50 rounded-2xl p-4 sm:p-5 transition cursor-pointer select-all group relative"
            title="Clique para copiar seu link"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-sm sm:text-lg font-bold text-gray-800 break-all text-center">
                {site.url}
              </span>
            </div>
            <span className="text-[11px] text-gray-400 group-hover:text-[#ff2a85] transition mt-1 block">
              Clique no box ou no botão abaixo para copiar
            </span>
          </div>
        </div>

        {/* Botão de Destaque: "Copiar Link" com cor Rosa */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className={`w-full sm:w-auto min-w-[200px] px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-[0.98] ${
              copied
                ? 'bg-[#84cc16] text-white hover:bg-[#72b312]'
                : 'bg-[#ff2a85] text-white hover:bg-[#e01e72]'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Link Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Link</span>
              </>
            )}
          </button>

          {/* Botão Secundário: Abrir Mini-site */}
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-semibold text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <ExternalLink className="w-4 h-4 text-gray-500" />
            <span>Abrir Site</span>
          </a>
        </div>

        {/* Feedback visual destacado quando copiado */}
        {copied && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in duration-200">
            <Check className="w-4 h-4 text-[#84cc16] stroke-[2.5]" />
            <span>Link copiado para a área de transferência! Pronto para colar onde desejar.</span>
          </div>
        )}

        {/* Ações rápidas extras para o cliente */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={shareOnWhatsApp}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200 transition flex items-center gap-1.5 cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Compartilhar no WhatsApp</span>
          </button>

          {onOpenQr && (
            <button
              type="button"
              onClick={() => onOpenQr(site)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-pink-50 hover:text-[#ff2a85] border border-gray-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-[#ff2a85]" />
              <span>Gerar QR Code</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
