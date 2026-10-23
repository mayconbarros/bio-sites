import { ClientUser } from '../types';

export interface PermissionCategory {
  id: string;
  title: string;
  items: string[];
}

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: 'analise',
    title: 'ANÁLISE',
    items: [
      'Estatísticas',
      'Meus Links',
      'Cadastros deste site',
      'Pix recebidos',
      'Agendamentos',
    ],
  },
  {
    id: 'editar_site',
    title: 'EDITAR SITE',
    items: [
      'Templates',
      'Aparência',
      'Títulos',
      'Botões',
      'Catálogo',
      'Endereço',
      'Captura de leads',
      'Layout',
    ],
  },
  {
    id: 'agenda',
    title: 'AGENDA',
    items: [
      'Serviços',
      'Disponibilidade',
    ],
  },
  {
    id: 'integracoes',
    title: 'INTEGRAÇÕES',
    items: [
      'Pixels & Rastreio',
    ],
  },
];

export const PERMISSION_PRESETS = {
  leitura: [
    'Estatísticas',
    'Meus Links',
    'Cadastros deste site',
    'Pix recebidos',
    'Agendamentos',
  ],
  operacional: [
    'Estatísticas',
    'Cadastros deste site',
    'Agendamentos',
    'Serviços',
    'Disponibilidade',
  ],
  editor: [
    'Templates',
    'Aparência',
    'Títulos',
    'Botões',
    'Catálogo',
    'Endereço',
    'Captura de leads',
    'Layout',
  ],
};

export const INITIAL_CLIENTS: ClientUser[] = [
  {
    id: 'client-1',
    name: 'Ana Beatriz Lima',
    email: 'cliente@esmalteriavip.com',
    phone: '(11) 98765-4321',
    role: 'client',
    assignedBiositeIds: ['bio-bella-nails'],
    permissions: [
      'Estatísticas',
      'Meus Links',
      'Agendamentos',
      'Aparência',
      'Serviços',
      'Disponibilidade'
    ],
    status: 'active',
    mustChangePassword: true, // Primeiro login -> dispara banner e modal de segurança!
    temporaryPassword: 'SenhaSegura123!',
    createdAt: '22/10/2026',
  },
  {
    id: 'client-2',
    name: 'Carlos Eduardo Rocha',
    email: 'carlos@barberclub.com',
    phone: '(21) 99123-4567',
    role: 'client',
    assignedBiositeIds: ['bio-barber-club'],
    permissions: [
      'Estatísticas',
      'Cadastros deste site',
      'Agendamentos',
      'Serviços',
      'Disponibilidade'
    ],
    status: 'active',
    mustChangePassword: false,
    temporaryPassword: 'SenhaSegura123!',
    createdAt: '15/10/2026',
  },
  {
    id: 'client-3',
    name: 'Mariana Souza',
    email: 'mariana@estetica.com',
    phone: '(31) 98877-6655',
    role: 'client',
    assignedBiositeIds: ['bio-bella-nails'],
    permissions: [
      'Estatísticas',
      'Meus Links',
      'Agendamentos'
    ],
    status: 'pending',
    mustChangePassword: true,
    temporaryPassword: 'SenhaSegura123!',
    createdAt: '20/10/2026',
  },
];
