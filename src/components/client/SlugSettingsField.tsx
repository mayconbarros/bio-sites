import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2, Link2 } from 'lucide-react';

interface SlugInputProps {
  currentSiteId?: string;
  initialSlug?: string;
  onSlugChange?: (slug: string, isAvailable: boolean) => void;
  onSave?: (slug: string) => void | Promise<void>;
}

export const SlugSettingsField: React.FC<SlugInputProps> = ({
  currentSiteId = '',
  initialSlug = '',
  onSlugChange,
  onSave,
}) => {
  const [slug, setSlug] = useState<string>(initialSlug);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(initialSlug ? true : null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Formata o slug removendo caracteres inválidos e espaços
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = e.target.value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '');

    setSlug(formatted);
    setIsAvailable(null);
    setErrorMessage('');
  };

  // Efeito com Debounce de 500ms para verificação do slug
  useEffect(() => {
    const trimmed = slug.trim();

    if (!trimmed) {
      setIsAvailable(null);
      setIsChecking(false);
      setErrorMessage('');
      onSlugChange?.(trimmed, false);
      return;
    }

    // Se o slug for idêntico ao original cadastrado, já está disponível para o próprio site
    if (initialSlug && trimmed.toLowerCase() === initialSlug.toLowerCase()) {
      setIsAvailable(true);
      setIsChecking(false);
      setErrorMessage('');
      onSlugChange?.(trimmed, true);
      return;
    }

    setIsChecking(true);
    setErrorMessage('');

    const timer = setTimeout(async () => {
      try {
        const queryParams = new URLSearchParams({
          slug: trimmed,
          ...(currentSiteId ? { excludeId: currentSiteId } : {}),
        });

        const res = await fetch(`/api/check-slug?${queryParams.toString()}`);
        const data = await res.json();

        if (res.ok) {
          const available = Boolean(data.available);
          setIsAvailable(available);
          onSlugChange?.(trimmed, available);
        } else {
          setIsAvailable(false);
          setErrorMessage(data.error || 'Erro ao validar slug.');
          onSlugChange?.(trimmed, false);
        }
      } catch (err) {
        setIsAvailable(false);
        setErrorMessage('Erro de conexão ao verificar slug.');
        onSlugChange?.(trimmed, false);
      } finally {
        setIsChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slug, initialSlug, currentSiteId]);

  const handleSave = async () => {
    if (!isAvailable || isChecking || !slug.trim()) return;

    try {
      setIsSaving(true);
      if (onSave) {
        await onSave(slug.trim());
      }
    } finally {
      setIsSaving(false);
    }
  };

  const isSaveDisabled = !slug.trim() || isChecking || isAvailable !== true || isSaving;

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
      {/* Label e Descrição */}
      <div>
        <label htmlFor="site-slug" className="block text-sm font-bold text-neutral-800">
          URL do Mini-site
        </label>
        <p className="text-xs text-neutral-500 mt-0.5">
          Defina o link de acesso público do seu mini-site.
        </p>
      </div>

      {/* Input com prefixo de domínio */}
      <div className="space-y-1.5">
        <div className="flex items-center rounded-xl border border-neutral-300 focus-within:border-neutral-900 focus-within:ring-2 focus-within:ring-neutral-900/10 overflow-hidden transition-all bg-neutral-50">
          <span className="px-3 py-2.5 text-xs text-neutral-400 font-medium select-none flex items-center gap-1.5 border-r border-neutral-200 bg-neutral-100/70">
            <Link2 className="w-3.5 h-3.5" />
            seusite.com/
          </span>
          <input
            id="site-slug"
            type="text"
            value={slug}
            onChange={handleInputChange}
            placeholder="minha-loja"
            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none font-medium"
          />
          {/* Indicador de carregamento no final do input */}
          <div className="pr-3">
            {isChecking && (
              <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
            )}
          </div>
        </div>

        {/* Feedback visual dinâmico em tempo real */}
        <div className="min-h-[22px] flex items-center">
          {isChecking ? (
            <p className="text-xs text-neutral-500 flex items-center gap-1.5">
              <span>Verificando disponibilidade...</span>
            </p>
          ) : isAvailable === true ? (
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              URL disponível
            </p>
          ) : isAvailable === false ? (
            <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5 animate-in fade-in duration-200">
              <XCircle className="w-3.5 h-3.5 shrink-0" />
              {errorMessage || 'URL já em uso'}
            </p>
          ) : null}
        </div>
      </div>

      {/* Botão de Salvar Alterações com estado disabled */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaveDisabled}
          className={`w-full py-2.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            isSaveDisabled
              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200'
              : 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-md active:scale-[0.99]'
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar alterações'
          )}
        </button>
      </div>
    </div>
  );
};