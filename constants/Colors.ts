const primaryBlue = '#0A84FF';
const darkBlue = '#053B78';
const cyanAccent = '#4FD1FF';

export const Colors = {
  light: {
    text: '#0F172A',          // azul quase preto, mais elegante
    background: '#FFFFFF',   // branco puro (ótimo p/ PDF)
    tint: primaryBlue,

    tabIconDefault: '#94A3B8',
    tabIconSelected: primaryBlue,

    primary: primaryBlue,
    secondary: '#10B981',     // verde saúde (macros, sucesso, etc)
    accent: cyanAccent,

    card: '#F8FAFC',         // branco suave, não “estourado”
    border: '#E2E8F0',

    success: '#22C55E',
    error: '#EF4444',
  },

  dark: {
    text: '#fff',
    background: '#1E1E1E',
    tint: primaryBlue,
    tabIconDefault: '#666',
    tabIconSelected: primaryBlue,
    primary: primaryBlue,
    secondary: '#4FD1FF',
    accent: darkBlue,
    card: '#2C2C2E',
    border: '#333',
    success: '#30D158',
    error: '#FF453A',
  },
};

export default Colors;
