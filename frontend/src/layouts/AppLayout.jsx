import { useCallback, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Badge,
  Box,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import { useAuth } from '../auth/useAuth';
import { COMMON_NAV_ITEMS, NAV_ITEMS } from '../utils/navConfig';
import BrandMark from '../components/BrandMark';
import NotificationsProvider from '../components/NotificationsProvider';
import useNotifications from '../hooks/useNotifications';
import UserAvatar from '../components/UserAvatar';
import MonCompteDialog from '../components/MonCompteDialog';

const DRAWER_WIDTH = 264;
const DRAWER_WIDTH_COLLAPSED = 80;
const STORAGE_KEY = 'jobbing.sidebarCollapsed';

const ROLE_LABELS = {
  CLIENT: 'Espace client',
  PRESTATAIRE: 'Espace prestataire',
  ADMIN: 'Administration',
};

function readCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export default function AppLayout() {
  return (
    <NotificationsProvider>
      <AppLayoutContent />
    </NotificationsProvider>
  );
}

function AppLayoutContent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const { user, role, logout } = useAuth();
  const notifications = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  // Sur mobile, le tiroir est toujours en version complète (il se superpose au contenu).
  const isCollapsed = !isMobile && collapsed;
  const drawerWidth = isCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        // stockage indisponible : on garde simplement l'état en mémoire
      }
      return next;
    });
  }, []);

  const navItems = [...(NAV_ITEMS[role] || []), ...COMMON_NAV_ITEMS];
  const currentItem = navItems.find((item) => location.pathname.startsWith(item.path));
  const roleLabel = role ? role.charAt(0) + role.slice(1).toLowerCase() : '';
  const nomAffiche = user?.nom || user?.username || '';
  const [compteOpen, setCompteOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        px: isCollapsed ? 1.5 : 2,
        py: 2.5,
        transition: 'padding 0.2s',
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', px: isCollapsed ? 0 : 1, mb: 3, minHeight: 36 }}
      >
        <BrandMark size={36} />
        {!isCollapsed && (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
              Jobbing Local
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {ROLE_LABELS[role] || 'Plateforme'}
            </Typography>
          </Box>
        )}
      </Stack>

      {!isCollapsed && (
        <Typography
          variant="caption"
          sx={{ px: 1.5, mb: 0.5, color: 'text.secondary', fontWeight: 600, letterSpacing: '0.06em' }}
        >
          MENU
        </Typography>
      )}

      <List sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 0.25, py: 0 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const compteur = item.badge ? notifications[item.badge] || 0 : 0;
          const button = (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              onClick={() => isMobile && setMobileOpen(false)}
              sx={{
                flexGrow: 0,
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                px: isCollapsed ? 0 : 1.5,
                '&.active': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.dark',
                  '& .MuiListItemText-primary': { fontWeight: 600 },
                },
              }}
            >
              {Icon && (
                <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 36, justifyContent: 'center' }}>
                  <Badge
                    color="error"
                    variant="dot"
                    invisible={!isCollapsed || compteur === 0}
                    overlap="circular"
                  >
                    <Icon fontSize="small" />
                  </Badge>
                </ListItemIcon>
              )}
              {!isCollapsed && (
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { variant: 'body2', noWrap: true, sx: { fontWeight: 500 } } }}
                />
              )}
              {!isCollapsed && compteur > 0 && (
                <Box
                  component="span"
                  sx={{
                    ml: 1,
                    minWidth: 20,
                    height: 20,
                    px: 0.75,
                    borderRadius: 10,
                    bgcolor: 'error.main',
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {compteur > 99 ? '99+' : compteur}
                </Box>
              )}
            </ListItemButton>
          );
          return isCollapsed ? (
            <Tooltip
              key={item.path}
              title={compteur > 0 ? `${item.label} (${compteur})` : item.label}
              placement="right"
              arrow
            >
              {button}
            </Tooltip>
          ) : (
            button
          );
        })}
      </List>

      <Box
        sx={{
          mt: 2,
          p: isCollapsed ? 1 : 1.5,
          borderRadius: 3,
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: isCollapsed ? 'column' : 'row',
          alignItems: 'center',
          gap: isCollapsed ? 1 : 1.5,
        }}
      >
        <Tooltip title={isCollapsed ? `${nomAffiche} · Mon compte` : 'Mon compte'} placement="right" arrow>
          <IconButton onClick={() => setCompteOpen(true)} sx={{ p: 0 }} aria-label="mon compte">
            <UserAvatar photo={user?.photo} nom={nomAffiche} size={36} variant="filled" />
          </IconButton>
        </Tooltip>
        {!isCollapsed && (
          <Box
            onClick={() => setCompteOpen(true)}
            sx={{ minWidth: 0, flexGrow: 1, cursor: 'pointer' }}
          >
            <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
              {nomAffiche}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {roleLabel}
            </Typography>
          </Box>
        )}
        <Tooltip title="Déconnexion" placement="right" arrow>
          <IconButton size="small" onClick={handleLogout} aria-label="se déconnecter">
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          transition: theme.transitions.create(['width', 'margin'], { duration: 200 }),
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Tooltip title={isMobile ? 'Menu' : isCollapsed ? 'Afficher le menu' : 'Masquer le menu'}>
              <IconButton
                edge="start"
                onClick={() => (isMobile ? setMobileOpen(true) : toggleCollapsed())}
                aria-label={isMobile ? 'ouvrir le menu' : isCollapsed ? 'afficher le menu' : 'masquer le menu'}
                sx={{
                  bgcolor: 'background.default',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                }}
              >
                {isCollapsed || isMobile ? <MenuIcon fontSize="small" /> : <MenuOpenIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {ROLE_LABELS[role] || 'Jobbing Local'}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>
                {currentItem?.label || 'Jobbing Local'}
              </Typography>
            </Box>
          </Stack>

          <Tooltip title="Mon compte">
            <IconButton onClick={() => setCompteOpen(true)} sx={{ p: 0 }} aria-label="mon compte">
              <UserAvatar photo={user?.photo} nom={nomAffiche} size={34} />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { md: drawerWidth },
          flexShrink: { md: 0 },
          transition: theme.transitions.create('width', { duration: 200 }),
        }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: isMobile ? DRAWER_WIDTH : drawerWidth,
              overflowX: 'hidden',
              transition: theme.transitions.create('width', { duration: 200 }),
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minWidth: 0,
          transition: theme.transitions.create('width', { duration: 200 }),
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 }, px: { xs: 2, md: 4 } }}>
          <Outlet />
        </Container>
      </Box>
      <MonCompteDialog open={compteOpen} onClose={() => setCompteOpen(false)} />
    </Box>
  );
}
