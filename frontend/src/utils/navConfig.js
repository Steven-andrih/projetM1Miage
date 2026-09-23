export const NAV_ITEMS = {
  CLIENT: [
    { label: 'Tableau de bord', path: '/client/dashboard' },
    { label: 'Mes demandes', path: '/client/demandes' },
    { label: 'Mes missions', path: '/client/missions' },
    { label: 'Mon profil', path: '/client/profil' },
  ],
  PRESTATAIRE: [
    { label: 'Tableau de bord', path: '/prestataire/dashboard' },
    { label: 'Demandes ouvertes', path: '/prestataire/demandes' },
    { label: 'Mes propositions', path: '/prestataire/propositions' },
    { label: 'Mes missions', path: '/prestataire/missions' },
    { label: 'Mes services', path: '/prestataire/services' },
    { label: 'Mon profil', path: '/prestataire/profil' },
  ],
  ADMIN: [
    { label: 'Tableau de bord', path: '/admin/dashboard' },
    { label: 'Catégories', path: '/admin/categories' },
    { label: 'Services', path: '/admin/services' },
  ],
}

export const COMMON_NAV_ITEMS = [
  { label: 'Carte des prestataires', path: '/carte-prestataires' },
]