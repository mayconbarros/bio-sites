import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Upload, Check, SquareUser } from 'lucide-react';
import confetti from 'canvas-confetti';

export const CreatorProfilePage: React.FC = () => {
  const { creatorProfile, updateCreatorProfile, showToast } = useApp();

  const [name, setName] = useState(creatorProfile?.name || 'Vision Local');
  const [photoUrl, setPhotoUrl] = useState(creatorProfile?.photoUrl || '');
  const [linkType, setLinkType] = useState<'none' | 'whatsapp' | 'site'>(creatorProfile?.linkType || 'whatsapp');
  const [linkUrl, setLinkUrl] = useState(creatorProfile?.linkUrl || 'https://wa.me/5541996958060');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione uma imagem válida (JPG ou PNG).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
        showToast('Foto selecionada com sucesso!', 'success');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
    showToast('Foto removida!');
  };

  const handleRadioChange = (type: 'none' | 'whatsapp' | 'site') => {
    setLinkType(type);
    if (type === 'whatsapp' && (!linkUrl || !linkUrl.includes('wa.me'))) {
      setLinkUrl('https://wa.me/5541996958060');
    } else if (type === 'site' && (!linkUrl || linkUrl.includes('wa.me'))) {
      setLinkUrl('https://visionlocal.com.br');
    }
  };

  const handleSave = () => {
    updateCreatorProfile({
      name: name.trim() || 'Vision Local',
      photoUrl,
      linkType,
      linkUrl: linkType === 'none' ? '' : linkUrl.trim(),
    });

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.3 }
    });

    showToast('Perfil salvo com sucesso!', 'success');
  };

  return (
    <div className="flex-1 bg-white min-h-screen flex flex-col font-sans select-none">
      {/* Top Header Bar: [ID icon] Meu perfil */}
      <header className="h-14 border-b border-neutral-200 bg-white px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 font-bold text-neutral-900 text-sm">
          <SquareUser className="w-4 h-4 text-neutral-700 stroke-[2]" />
          <span>Meu perfil</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 flex items-start justify-center bg-white">
        <div className="max-w-2xl w-full bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 shadow-xs space-y-6">
          
          {/* Section Heading */}
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Assinatura do criador
            </h2>
            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
              Esse nome e link aparecem no rodapé de <strong className="font-bold text-neutral-900">todos os seus mini-sites</strong>, no lugar de "Feito por MB Web Digital".
            </p>
          </div>

          {/* Foto do criador: avatar "on" / preview + "Trocar foto" roxo + "Remover" */}
          <div>
            <div className="flex items-center gap-4">
              {/* Avatar Redondo */}
              <div className={`w-14 h-14 rounded-full overflow-hidden shrink-0 shadow-xs border border-neutral-200/80 flex items-center justify-center ${photoUrl ? 'bg-transparent' : 'bg-black'}`}>
                {photoUrl ? (
                  <img 
                    src={photoUrl} 
                    alt="Logo do criador" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-[#00e5ff] font-extrabold text-sm tracking-tighter select-none font-mono">
                    on
                  </span>
                )}
              </div>

              {/* Botão Trocar foto roxo + Remover + legenda */}
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-[#9333ea] hover:bg-[#801fd6] active:scale-95 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Trocar foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-xs font-semibold text-neutral-900 hover:text-red-600 transition cursor-pointer"
                  >
                    Remover
                  </button>
                </div>

                <span className="text-[11px] text-neutral-400 block font-normal">
                  JPG ou PNG. Fica redonda.
                </span>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Campo 1: Nome ou marca que aparece no rodapé */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-900 block">
              Nome ou marca que aparece no rodapé
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Vision Local"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-pink-500 bg-white"
            />
          </div>

          {/* Campo 2: Link do criador (opcional) com 3 Radio Buttons e Input */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-neutral-900 block">
              Link do criador (opcional)
            </label>

            {/* Radio Options: Sem link, WhatsApp, Site */}
            <div className="flex items-center gap-6">
              <label 
                onClick={() => handleRadioChange('none')}
                className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-neutral-800"
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                  linkType === 'none' ? 'border-[#ff2a85]' : 'border-neutral-400'
                }`}>
                  {linkType === 'none' && <div className="w-2 h-2 rounded-full bg-[#ff2a85]" />}
                </div>
                <span>Sem link</span>
              </label>

              <label 
                onClick={() => handleRadioChange('whatsapp')}
                className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-neutral-800"
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                  linkType === 'whatsapp' ? 'border-[#ff2a85]' : 'border-neutral-400'
                }`}>
                  {linkType === 'whatsapp' && <div className="w-2 h-2 rounded-full bg-[#ff2a85]" />}
                </div>
                <span>WhatsApp</span>
              </label>

              <label 
                onClick={() => handleRadioChange('site')}
                className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-neutral-800"
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                  linkType === 'site' ? 'border-[#ff2a85]' : 'border-neutral-400'
                }`}>
                  {linkType === 'site' && <div className="w-2 h-2 rounded-full bg-[#ff2a85]" />}
                </div>
                <span>Site</span>
              </label>
            </div>

            {/* Input do Link */}
            <input
              type="text"
              disabled={linkType === 'none'}
              value={linkType === 'none' ? '' : linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              placeholder={
                linkType === 'none' 
                  ? 'Nenhum link configurado' 
                  : linkType === 'whatsapp' 
                    ? 'https://wa.me/5541996958060' 
                    : 'https://visionlocal.com.br'
              }
              className={`w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-pink-500 bg-white ${
                linkType === 'none' ? 'opacity-50 cursor-not-allowed bg-neutral-50' : ''
              }`}
            />
          </div>

          {/* Campo 3: PRÉVIA DO RODAPÉ */}
          <div className="rounded-xl border border-neutral-200 bg-white p-4 flex items-center justify-between min-h-[58px]">
            <span className="text-[10px] font-black text-neutral-900 tracking-wider uppercase">
              PRÉVIA DO RODAPÉ
            </span>

            {/* Badge da prévia com ícone e "Feito por Vision Local" */}
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center overflow-hidden shrink-0 ${photoUrl ? 'bg-transparent' : 'bg-black'}`}>
                {photoUrl ? (
                  <img src={photoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[#00e5ff] font-extrabold text-[7px] tracking-tighter font-mono">
                    on
                  </span>
                )}
              </div>
              <span className="text-xs text-neutral-800 font-medium">
                Feito por <span className="font-semibold text-neutral-900">{name || 'Vision Local'}</span>
              </span>
            </div>
          </div>

          {/* Botão de Salvar no canto inferior direito */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-[#d9f92e] hover:bg-[#c8ea23] active:scale-95 text-neutral-950 font-black text-xs shadow-xs transition cursor-pointer"
            >
              Salvar perfil
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};
