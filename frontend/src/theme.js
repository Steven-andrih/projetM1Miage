import { createTheme } from '@mui/material/styles'

// Palette imposée par le contexte projet (voir __Contexte_du_Projet_Frontend__)
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4A70A9',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#8FABD4',
      contrastText: '#000000',
    },
    background: {
      default: '#EFECE3',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: ['system-ui', '"Segoe UI"', 'Roboto', 'sans-serif'].join(','),
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#4A70A9',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #8FABD4',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
})

export default theme