import { alpha, createTheme } from '@mui/material/styles'

// Palette imposée par le contexte projet (voir __Contexte_du_Projet_Frontend__)
// Les trois couleurs de marque sont conservées ; le reste du système
// (neutres, typographie, composants) vise un rendu minimaliste et élégant.
const BRAND = {
  primary: '#4A70A9',
  primaryDark: '#3B5C8F',
  secondary: '#8FABD4',
  background: '#EFECE3',
  ink: '#1B2430',
  muted: '#6B7280',
  line: '#E4E0D6',
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: BRAND.primary,
      dark: BRAND.primaryDark,
      light: BRAND.secondary,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: BRAND.secondary,
      contrastText: BRAND.ink,
    },
    background: {
      default: BRAND.background,
      paper: '#FFFFFF',
    },
    text: {
      primary: BRAND.ink,
      secondary: BRAND.muted,
    },
    divider: BRAND.line,
    success: { main: '#2F9E6E' },
    warning: { main: '#D9892B' },
    error: { main: '#D1484D' },
    info: { main: BRAND.primary },
  },
  shape: {
    borderRadius: 14,
  },
  spacing: 8,
  typography: {
    fontFamily: ['Inter', 'system-ui', '"Segoe UI"', 'Roboto', 'sans-serif'].join(','),
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.75rem' },
    h5: { fontWeight: 700, letterSpacing: '-0.015em', fontSize: '1.375rem' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em', fontSize: '1.0625rem' },
    subtitle1: { fontWeight: 600, fontSize: '0.9375rem' },
    subtitle2: { fontWeight: 600, fontSize: '0.8125rem' },
    body1: { fontSize: '0.9375rem', lineHeight: 1.65 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    caption: { fontSize: '0.75rem', letterSpacing: '0.01em' },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
  },
  shadows: [
    'none',
    '0 1px 2px rgba(27, 36, 48, 0.04)',
    '0 2px 6px rgba(27, 36, 48, 0.06)',
    '0 4px 12px rgba(27, 36, 48, 0.07)',
    '0 8px 24px rgba(27, 36, 48, 0.08)',
    '0 12px 32px rgba(27, 36, 48, 0.10)',
    ...Array(19).fill('0 16px 40px rgba(27, 36, 48, 0.12)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: BRAND.background,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        outlined: {
          borderColor: BRAND.line,
          borderRadius: 16,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${BRAND.line}`,
          boxShadow: 'none',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 20,
          '&:last-child': { paddingBottom: 20 },
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        color: 'inherit',
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: alpha('#FFFFFF', 0.85),
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${BRAND.line}`,
          color: BRAND.ink,
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 64,
          '@media (min-width:600px)': { minHeight: 64 },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRight: `1px solid ${BRAND.line}`,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingTop: 9,
          paddingBottom: 9,
          paddingLeft: 12,
          paddingRight: 12,
          color: BRAND.muted,
          transition: 'background-color 0.15s, color 0.15s',
          '&:hover': {
            backgroundColor: alpha(BRAND.primary, 0.06),
            color: BRAND.ink,
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 36,
          color: 'inherit',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingLeft: 18,
          paddingRight: 18,
          fontWeight: 600,
        },
        sizeLarge: {
          minHeight: 48,
          fontSize: '0.9375rem',
        },
        sizeSmall: {
          borderRadius: 8,
          paddingLeft: 12,
          paddingRight: 12,
        },
        contained: {
          '&:hover': {
            boxShadow: `0 6px 16px ${alpha(BRAND.primary, 0.28)}`,
          },
        },
        outlined: {
          borderColor: BRAND.line,
          backgroundColor: '#FFFFFF',
          '&:hover': {
            borderColor: BRAND.primary,
            backgroundColor: alpha(BRAND.primary, 0.04),
          },
        },
        text: {
          '&:hover': {
            backgroundColor: alpha(BRAND.primary, 0.06),
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#FFFFFF',
          transition: 'box-shadow 0.15s',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: BRAND.line,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: BRAND.secondary,
          },
          '&.Mui-focused': {
            boxShadow: `0 0 0 3px ${alpha(BRAND.primary, 0.14)}`,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 1,
            borderColor: BRAND.primary,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.9rem',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.75rem',
          height: 26,
        },
        sizeSmall: {
          height: 24,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 18,
          padding: 4,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: '1.125rem',
          letterSpacing: '-0.01em',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: BRAND.line,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: BRAND.muted,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          borderBottomColor: BRAND.line,
        },
        root: {
          borderBottomColor: BRAND.line,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          backgroundColor: BRAND.ink,
          fontSize: '0.75rem',
        },
      },
    },
    MuiRating: {
      styleOverrides: {
        iconFilled: {
          color: '#E3A33A',
        },
      },
    },
    MuiLink: {
      defaultProps: {
        underline: 'hover',
      },
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
})

export default theme
