export interface MockSiteLink {
  id: string;
  name: string; // Nome do negócio (ex: "Mayrah - Esmalteria Vip")
  url: string;  // URL completa (ex: "https://bio.mbwebdigital.com.br/esmalteriavip")
  slug: string;
  category?: string;
  status?: 'active' | 'draft';
  clientName?: string;
  clientEmail?: string;
}

export const INITIAL_MOCK_SITES: MockSiteLink[] = [
  {
    id: 'bio-bella-nails',
    name: 'Mayrah - Esmalteria Vip',
    url: 'https://bio.mbwebdigital.com.br/esmalteriavip',
    slug: 'esmalteriavip',
    category: 'Esmalteria & Spa',
    status: 'active',
    clientName: 'Ana Beatriz Lima',
    clientEmail: 'cliente@esmalteriavip.com'
  },
  {
    id: 'bio-barber-club',
    name: 'Barber Club Vintage',
    url: 'https://bio.mbwebdigital.com.br/barberclub',
    slug: 'barberclub',
    category: 'Barbearia & Estilo',
    status: 'active',
    clientName: 'Carlos Eduardo Rocha',
    clientEmail: 'carlos@barberclub.com'
  },
  {
    id: 'bio-estetica-glow',
    name: 'Dra. Mariana Souza - Estética Avançada',
    url: 'https://bio.mbwebdigital.com.br/esteticaglow',
    slug: 'esteticaglow',
    category: 'Estética & Harmonização',
    status: 'active',
    clientName: 'Mariana Souza',
    clientEmail: 'mariana@estetica.com'
  },
  {
    id: 'bio-salao-elegance',
    name: 'Espaço Elegance Cabelos & Make',
    url: 'https://bio.mbwebdigital.com.br/salaoelegance',
    slug: 'salaoelegance',
    category: 'Salão de Beleza',
    status: 'active',
    clientName: 'Juliana Mendes',
    clientEmail: 'juliana@espacoelegance.com'
  },
  {
    id: 'bio-studio-fit',
    name: 'Studio Rafa Personal Trainer',
    url: 'https://bio.mbwebdigital.com.br/rafapersonal',
    slug: 'rafapersonal',
    category: 'Saúde & Fitness',
    status: 'draft',
    clientName: 'Rafael Silva',
    clientEmail: 'rafael@studiopersonal.com'
  }
];
