import React, { useState } from 'react';
import { MockSiteLink } from './mockLinksData';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Search, 
  Globe, 
  Link as LinkIcon,
  Sparkles,
  QrCode
} from 'lucide-react';

interface AdminLinksViewProps {
  sites: MockSiteLink[];
  onOpenQr?: (site: MockSiteLink) => void;
}

export const AdminLinksView: React.FC<AdminLinksViewProps> = ({ sites, onOpenQr }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCopy = (siteId: string, url: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopiedId(siteId);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const filteredSites = sites.filter(site => 
    site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (site.category && site.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-full space-y-6">
      {/* Top action bar: Search & counter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome do negócio ou URL..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs md:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#ff2a85] focus:ring-1 focus:ring-[#ff2a85] transition"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 self-end sm:self-center">
          <span className="px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-700">
            {filteredSites.length} {filteredSites.length === 1 ? 'link cadastrado' : 'links cadastrados'}
          </span>
        </div>
      </div>

      {/* Lista de Sites / Links */}
      {filteredSites.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 space-y-2">
          <Globe className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="text-sm font-medium text-gray-700">Nenhum mini-site encontrado para a busca.</p>
          <p className="text-xs text-gray-400">Tente buscar por outro termo ou nome de negócio.</p>
        </div>
      ) : (
        <ul className="space-y-3.5">
          {filteredSites.map((site) => {
            const isCopied = copiedId === site.id;

            return (
              <li
                key={site.id}
                className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 transition hover:border-gray-300 shadow-2xs"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Business Name & info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-sm md:text-base tracking-tight truncate">
                        {site.name}
                      </h3>
                      {site.category && (
                        <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                          {site.category}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        site.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {site.status === 'active' ? 'Online' : 'Rascunho'}
                      </span>
                    </div>

                    {site.clientName && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Cliente: <span className="text-gray-700 font-medium">{site.clientName}</span>
                      </p>
                    )}
                  </div>

                  {/* Right: URL box (readonly simulation) + Copy button */}
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    {/* Readonly simulated input box */}
                    <div 
                      onClick={() => handleCopy(site.id, site.url)}
                      title="Clique para copiar a URL"
                      className="flex-1 md:w-80 bg-gray-100 border border-gray-200 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2 cursor-pointer hover:bg-gray-150 transition select-all group"
                    >
                      <span className="text-xs font-mono text-gray-700 truncate">
                        {site.url}
                      </span>
                      {isCopied && (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 shrink-0 animate-in fade-in">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          Copiado!
                        </span>
                      )}
                    </div>

                    {/* Botão de ícone Copiar: outline/cinza com hover em Rosa */}
                    <button
                      type="button"
                      onClick={() => handleCopy(site.id, site.url)}
                      title={isCopied ? "Copiado!" : "Copiar URL do mini-site"}
                      className={`p-2.5 rounded-xl border transition cursor-pointer shrink-0 flex items-center justify-center ${
                        isCopied
                          ? 'border-[#84cc16] bg-emerald-50 text-emerald-600'
                          : 'border-gray-300 bg-white text-gray-600 hover:text-[#ff2a85] hover:border-[#ff2a85] hover:bg-pink-50/40'
                      }`}
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-[#84cc16] stroke-[2.5]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    {/* Botão de abrir em nova aba */}
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Abrir mini-site em nova aba"
                      className="p-2.5 rounded-xl border border-gray-300 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition cursor-pointer shrink-0 flex items-center justify-center"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    {onOpenQr && (
                      <button
                        type="button"
                        onClick={() => onOpenQr(site)}
                        title="Ver QR Code deste mini-site"
                        className="p-2.5 rounded-xl border border-gray-300 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition cursor-pointer shrink-0 flex items-center justify-center"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
