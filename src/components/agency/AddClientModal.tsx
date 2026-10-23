import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ClientUser } from '../../types';
import { PERMISSION_CATEGORIES, PERMISSION_PRESETS } from '../../data/rbacConstants';
import { 
  X, 
  Copy, 
  Check, 
  User, 
  Mail, 
  Phone, 
  Key, 
  ShieldCheck, 
  Globe, 
  Lock, 
  RefreshCw 
} from 'lucide-react';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<ClientUser, 'id' | 'createdAt'>) => void;
  editingClient?: ClientUser | null;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingClient
}) => {
  const { biosites, showToast } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('SenhaSegura123!');
  const [mustChangePassword, setMustChangePassword] = useState(true);
  const [selectedBiosites, setSelectedBiosites] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [copiedPassword, setCopiedPassword] = useState(false);

  useEffect(() => {
    if (editingClient) {
      setName(editingClient.name);
      setEmail(editingClient.email);
      setPhone(editingClient.phone || '');
      setTemporaryPassword(editingClient.temporaryPassword || 'SenhaSegura123!');
      setMustChangePassword(editingClient.mustChangePassword ?? true);
      setSelectedBiosites(editingClient.assignedBiositeIds || []);
      setSelectedPermissions(editingClient.permissions || []);
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setTemporaryPassword('SenhaSegura123!');
      setMustChangePassword(true);
      // Pre-select first biosite by default
      setSelectedBiosites(biosites.length > 0 ? [biosites[0].id] : []);
      // Default to "Operacional" preset
      setSelectedPermissions([...PERMISSION_PRESETS.operacional]);
    }
  }, [editingClient, isOpen, biosites]);

  if (!isOpen) return null;

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(temporaryPassword);
    setCopiedPassword(true);
    showToast('Senha temporária copiada para a área de transferência!', 'success');
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    let generated = '';
    for (let i = 0; i < 12; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTemporaryPassword(generated);
    showToast('Nova senha temporária gerada!', 'info');
  };

  const toggleBiosite = (id: string) => {
    setSelectedBiosites(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const togglePermission = (item: string) => {
    setSelectedPermissions(prev => 
      prev.includes(item) ? prev.filter(p => p !== item) : [...prev, item]
    );
  };

  const applyPreset = (presetKey: 'leitura' | 'operacional' | 'editor' | 'limpar') => {
    if (presetKey === 'limpar') {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions([...PERMISSION_PRESETS[presetKey]]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Por favor, informe o nome do cliente.', 'error');
      return;
    }
    if (!email.trim()) {
      showToast('Por favor, informe o e-mail do cliente.', 'error');
      return;
    }
    if (selectedBiosites.length === 0) {
      showToast('Assinale pelo menos um mini-site para este cliente.', 'error');
      return;
    }
    if (selectedPermissions.length === 0) {
      showToast('Marque pelo menos uma permissão de acesso.', 'error');
      return;
    }

    onSave({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role: 'client',
      assignedBiositeIds: selectedBiosites,
      permissions: selectedPermissions,
      status: editingClient?.status || 'active',
      mustChangePassword,
      temporaryPassword,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans select-none animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-gray-200 max-w-2xl w-full p-6 sm:p-7 shadow-xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-[#ff2a85]" />
              <span>{editingClient ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Defina as credenciais provisórias e os acessos que o cliente terá no mini-site.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Seção 1: Dados Básicos */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>1. Dados do Cliente</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800 block">
                  Nome completo *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Ana Beatriz Lima"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff2a85]/20 focus:border-[#ff2a85]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800 block">
                  E-mail de acesso *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cliente@exemplo.com"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff2a85]/20 focus:border-[#ff2a85]"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-800 block">
                  WhatsApp / Telefone (opcional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-8888"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff2a85]/20 focus:border-[#ff2a85]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seção 2: Senha Temporária e Segurança */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>2. Credenciais de Acesso & Segurança</span>
            </h3>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800 block">
                  Senha Temporária
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Key className="w-4 h-4 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      value={temporaryPassword}
                      onChange={(e) => setTemporaryPassword(e.target.value)}
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-mono font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ff2a85]/20 focus:border-[#ff2a85]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="h-[38px] px-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    title="Copiar senha"
                  >
                    {copiedPassword ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                        <span className="text-emerald-700">Copiada</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="h-[38px] px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                    title="Gerar nova senha"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Checkbox Exigir troca de senha no primeiro login */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={mustChangePassword}
                  onChange={(e) => setMustChangePassword(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#ff2a85] accent-[#ff2a85] cursor-pointer"
                />
                <span className="text-xs font-bold text-gray-800">
                  Exigir troca de senha no primeiro login (Recomendado)
                </span>
              </label>
              <p className="text-[11px] text-gray-500 pl-6 leading-tight">
                O cliente será bloqueado até alterar a senha provisória ao entrar na conta pela primeira vez.
              </p>
            </div>
          </div>

          {/* Seção 3: Vinculação de Mini-Sites */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>3. Mini-sites com Acesso Liberado</span>
              </h3>
              <span className="text-xs text-gray-500">
                {selectedBiosites.length} de {biosites.length} selecionado(s)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {biosites.map(site => {
                const isSelected = selectedBiosites.includes(site.id);
                return (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => toggleBiosite(site.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition ${
                      isSelected
                        ? 'bg-[#fff7fa] border-[#ff2a85] text-gray-900'
                        : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                        {site.avatarUrl ? (
                          <img src={site.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Globe className="w-4 h-4 m-1.5 text-gray-400" />
                        )}
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold block truncate">{site.title}</span>
                        <span className="text-[10px] text-gray-400 block truncate font-mono">/{site.slug}</span>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border shrink-0 ${
                      isSelected ? 'bg-[#ff2a85] border-[#ff2a85] text-white' : 'border-gray-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seção 4: Permissões de Acesso (Presets & Checkboxes) */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>4. Permissões de Gestão (RBAC)</span>
              </h3>

              {/* Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-gray-500 mr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPreset('leitura')}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 transition cursor-pointer shadow-2xs"
                >
                  Só leitura
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('operacional')}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 transition cursor-pointer shadow-2xs"
                >
                  Operacional
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('editor')}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 transition cursor-pointer shadow-2xs"
                >
                  Editor completo
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('limpar')}
                  className="px-2 py-1 rounded-lg text-xs font-medium bg-white hover:bg-gray-50 text-gray-500 border border-gray-200 transition cursor-pointer"
                >
                  Limpar
                </button>
              </div>
            </div>

            {/* Grid dos 4 grupos de permissões */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {PERMISSION_CATEGORIES.map(cat => (
                <div key={cat.id} className="bg-white rounded-xl border border-gray-200 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-extrabold text-gray-700 uppercase tracking-wider">
                      {cat.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {cat.items.filter(i => selectedPermissions.includes(i)).length}/{cat.items.length}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {cat.items.map(item => {
                      const isChecked = selectedPermissions.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => togglePermission(item)}
                          className="w-full flex items-center gap-2.5 text-left cursor-pointer group py-0.5 select-none"
                        >
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            isChecked
                              ? 'bg-[#ff2a85] border border-[#ff2a85]'
                              : 'bg-white border-2 border-gray-300 group-hover:border-gray-500'
                          }`}>
                            {isChecked && <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />}
                          </div>
                          <span className={`text-xs font-medium ${
                            isChecked ? 'text-gray-900 font-semibold' : 'text-gray-600'
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
          </div>

          {/* Rodapé com botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#84cc16] hover:bg-[#65a30d] text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{editingClient ? 'Salvar Alterações' : 'Salvar Cliente'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
