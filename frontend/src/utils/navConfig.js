import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import WorkOutlineIcon from '@mui/icons-material/WorkOutlineOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined'
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined'
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined'
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined'
import MapOutlinedIcon from '@mui/icons-material/MapOutlined'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'

// `badge` : clé du compteur à afficher en pastille (voir NotificationsProvider)
export const NAV_ITEMS = {
  CLIENT: [
    { label: 'Tableau de bord', path: '/client/dashboard', icon: DashboardOutlinedIcon },
    { label: 'Mes demandes', path: '/client/demandes', icon: AssignmentOutlinedIcon },
    { label: 'Messages', path: '/client/messages', icon: ChatBubbleOutlineIcon, badge: 'messagesNonLus' },
    { label: 'Mes missions', path: '/client/missions', icon: WorkOutlineIcon },
    { label: 'Mon profil', path: '/client/profil', icon: PersonOutlineIcon },
  ],
  PRESTATAIRE: [
    { label: 'Tableau de bord', path: '/prestataire/dashboard', icon: DashboardOutlinedIcon },
    { label: 'Demandes ouvertes', path: '/prestataire/demandes', icon: ExploreOutlinedIcon },
    { label: 'Mes propositions', path: '/prestataire/propositions', icon: ForumOutlinedIcon },
    { label: 'Messages', path: '/prestataire/messages', icon: ChatBubbleOutlineIcon, badge: 'messagesNonLus' },
    { label: 'Mes missions', path: '/prestataire/missions', icon: WorkOutlineIcon },
    { label: 'Mes services', path: '/prestataire/services', icon: HandymanOutlinedIcon },
    { label: 'Vérification', path: '/prestataire/verification', icon: VerifiedUserOutlinedIcon },
    { label: 'Mon profil', path: '/prestataire/profil', icon: PersonOutlineIcon },
  ],
  ADMIN: [
    { label: 'Tableau de bord', path: '/admin/dashboard', icon: DashboardOutlinedIcon },
    { label: 'Utilisateurs', path: '/admin/utilisateurs', icon: GroupOutlinedIcon },
    {
      label: 'Vérifications',
      path: '/admin/verifications',
      icon: FactCheckOutlinedIcon,
      badge: 'verificationsEnAttente',
    },
    { label: 'Catégories', path: '/admin/categories', icon: CategoryOutlinedIcon },
    { label: 'Services', path: '/admin/services', icon: ListAltOutlinedIcon },
  ],
}

export const COMMON_NAV_ITEMS = [
  { label: 'Carte des prestataires', path: '/carte-prestataires', icon: MapOutlinedIcon },
]
