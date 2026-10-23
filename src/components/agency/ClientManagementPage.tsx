import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClientUser } from '../../types';
import { AddClientModal } from './AddClientModal';
import { 
  Users, 
  Plus, 
  Search, 
  UserCheck, 
  ShieldCheck, 
  KeyRound, 
  Copy, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  AlertCircle,
  Globe,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const ClientManagementPage: React.FC = () => {
  const { 
    clients, 
    addClient, 
    updateClient, 
    deleteClient, 
    biosites, 
    switchUserRole, 
    showToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'blocked'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientUser | null>(null);
  const [clientToDelete, setClientToDelete] = useState<ClientUser | null>(null);

  // Filtros de busca e status
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.phone && client.phone.includes(searchQuery));

    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: ClientUser) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleSaveClient = (data: Omit<ClientUser, 'id' | 'createdAt'>) => {
    if (editingClient) {
      updateClient(editingClient.id, data);
    } else {
      addClient(data);
    }
  };

  const handleConfirmDelete = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete.id);
      setClientToDelete(null);
    }
  };

  const handleCopyClientAccess = (client: ClientUser) => {
    const siteSlug = biosites.find(s => client.assignedBiositeIds?.includes(s.id))?.slug || 'site';
    const text = `Acesso ao Painel MB Web Digital:\nLink: https://bio.mbwebdigital.com.br/painel/${siteSlug}\nE-mail: ${client.email}\nSenha provisória: ${client.temporaryPassword || 'SenhaSegura123!'}`;
    navigator.clipboard.writeText(text);
    showToast('Dados de acesso e link copiados!', 'success');
  };

  // Métricas
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'active').length;
  const pendingPasswordChange = clients.filter(c => c.mustChangePassword).length;

  return (
    <div className="flex-1 bg-white min-h-screen flex flex-col font-sans select-none">
      
      {/* 1. Header Superior */}
      <header className="h-16 border-b border-gray-200 bg-white px-6 md:px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 border border-gray-200">
            <Users className="w-5 h-5 text-gray-800 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-tight leading-tight">
              Gestão de Clientes
            </h1>
            <p className="text-xs text-gray-500 font-normal">
              Controle de acessos, multi-tenancy e permissões (RBAC)
            </p>
          </div>
        </div>

        {/* Botão Rosa "Adicionar Novo Cliente" */}
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="h-10 px-4 md:px-5 rounded-xl bg-[#ff2a85] hover:bg-[#e01e72] active:scale-95 text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Adicionar Novo Cliente</span>
        </button>
      </header>

      {/* 2. Conteúdo Principal com espaçamento generoso */}
      <main className="flex-1 p-6 md:p-8 bg-gray-50/70 space-y-6">
        
        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Total de Clientes
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-gray-900">{totalClients}</span>
              <span className="text-xs text-gray-400 font-medium">Cadastrados</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Clientes Ativos
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-600">{activeClients}</span>
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                Acesso Liberado
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Troca de Senha Pendente
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-600">{pendingPasswordChange}</span>
              <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                1º Login Obrigatório
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Input de Busca */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome, e-mail ou telefone..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff2a85]/20 focus:border-[#ff2a85]"
            />
          </div>

          {/* Filtros de Status */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos ({clients.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Ativos ({clients.filter(c => c.status === 'active').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pendentes ({clients.filter(c => c.status === 'pending').length})
            </button>
          </div>

        </div>

        {/* Tabela de Clientes */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          {filteredClients.length === 0 ? (
            <div className="py-16 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Nenhum cliente encontrado</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {searchQuery ? 'Tente ajustar os termos da sua pesquisa.' : 'Comece cadastrando seu primeiro cliente.'}
                </p>
              </div>
              {!searchQuery && (
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 rounded-xl bg-[#ff2a85] text-white text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Cliente</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-6">Cliente</th>
                    <th className="py-3.5 px-6">Mini-sites Atribuídos</th>
                    <th className="py-3.5 px-6">Permissões (RBAC)</th>
                    <th className="py-3.5 px-6">Status & Senha</th>
                    <th className="py-3.5 px-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredClients.map((client) => {
                    const assignedSites = biosites.filter(b => client.assignedBiositeIds?.includes(b.id));

                    return (
                      <tr key={client.id} className="hover:bg-gray-50/60 transition group">
                        
                        {/* Coluna 1: Cliente */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#ff2a85]/10 text-[#ff2a85] font-bold text-xs flex items-center justify-center shrink-0 border border-[#ff2a85]/20">
                              {client.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-gray-900 text-xs block truncate">
                                {client.name}
                              </span>
                              <span className="text-[11px] text-gray-500 font-normal block truncate">
                                {client.email}
                              </span>
                              {client.phone && (
                                <span className="text-[10px] text-gray-400 block font-mono">
                                  {client.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Coluna 2: Mini-sites Atribuídos */}
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {assignedSites.map(site => (
                                <span 
                                  key={site.id}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 text-gray-800 text-[11px] font-medium"
                                >
                                  <Globe className="w-3 h-3 text-gray-500" />
                                  <span>{site.title}</span>
                                </span>
                              ))}
                            </div>
                            <span className="text-[10px] text-gray-400 block font-normal">
                              {assignedSites.length} {assignedSites.length === 1 ? 'site vinculado' : 'sites vinculados'}
                            </span>
                          </div>
                        </td>

                        {/* Coluna 3: Permissões */}
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 flex-wrap max-w-xs">
                              {client.permissions?.slice(0, 3).map(p => (
                                <span 
                                  key={p} 
                                  className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-700 text-[10px] font-semibold"
                                >
                                  {p}
                                </span>
                              ))}
                              {client.permissions && client.permissions.length > 3 && (
                                <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[10px] font-bold">
                                  +{client.permissions.length - 3}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400 block">
                              {client.permissions?.length || 0} permissões ativas
                            </span>
                          </div>
                        </td>

                        {/* Coluna 4: Status & Senha */}
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              client.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : client.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                client.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                              }`} />
                              <span>{client.status === 'active' ? 'Ativo' : 'Pendente'}</span>
                            </span>

                            {client.mustChangePassword ? (
                              <span className="flex items-center gap-1 text-[10px] text-amber-600 font-semibold">
                                <Lock className="w-3 h-3 text-amber-500" />
                                <span>Troca de senha pendente</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                <span>Senha definitiva</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Coluna 5: Ações */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Botão para simular visão como este cliente */}
                            <button
                              type="button"
                              onClick={() => switchUserRole('client', client)}
                              className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-[#fff7fa] hover:border-[#fce7f3] hover:text-[#ff2a85] text-gray-700 text-xs font-semibold border border-gray-200 transition cursor-pointer flex items-center gap-1.5"
                              title="Acessar painel como este cliente"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-[#ff2a85]" />
                              <span className="hidden md:inline">Acessar</span>
                            </button>

                            {/* Copiar dados de acesso */}
                            <button
                              type="button"
                              onClick={() => handleCopyClientAccess(client)}
                              className="p-1.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer"
                              title="Copiar dados de acesso"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {/* Editar */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(client)}
                              className="p-1.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer"
                              title="Editar cliente"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Excluir */}
                            <button
                              type="button"
                              onClick={() => setClientToDelete(client)}
                              className="p-1.5 rounded-xl border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition cursor-pointer"
                              title="Excluir cliente"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      {/* Modal Adicionar / Editar Cliente */}
      <AddClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClient}
        editingClient={editingClient}
      />

      {/* Modal de Confirmação de Exclusão */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-900">Excluir cliente?</h3>
              <p className="text-xs text-gray-500">
                Tem certeza que deseja remover o cliente <strong>{clientToDelete.name}</strong>? Os acessos aos mini-sites serão revogados.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setClientToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
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
