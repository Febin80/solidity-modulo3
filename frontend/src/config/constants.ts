// Constantes del frontend para evitar long strings
export const NETWORK_CONFIG = {
  SEPOLIA_CHAIN_ID: 11155111,
  SEPOLIA_NAME: "Sepolia",
  SEPOLIA_RPC_URL: "https://eth-sepolia.g.alchemy.com/v2/",
} as const;

export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: "⚠️ Conecta tu wallet para usar la aplicación",
  INVALID_ADDRESS: "Dirección inválida",
  INSUFFICIENT_BALANCE: "Balance insuficiente",
  TRANSACTION_FAILED: "Transacción fallida",
  NETWORK_ERROR: "Error de red",
  CONTRACT_NOT_FOUND: "Contrato no encontrado en la red",
  APPROVAL_REQUIRED: "Aprobación requerida",
  LIQUIDITY_INSUFFICIENT: "Liquidez insuficiente",
  DEADLINE_EXPIRED: "Deadline expirado",
} as const;

export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: "✅ Wallet Conectada",
  SWAP_COMPLETED: "¡Swap completado exitosamente!",
  LIQUIDITY_ADDED: "¡Liquidez agregada exitosamente!",
  LIQUIDITY_REMOVED: "¡Liquidez removida exitosamente!",
  TOKENS_APPROVED: "Tokens aprobados exitosamente",
} as const;

export const UI_LABELS = {
  CONNECT_WALLET: "Conectar Wallet",
  SWITCH_TO_SEPOLIA: "Cambiar a Sepolia",
  SWAP_TOKENS: "Swap de Tokens",
  ADD_LIQUIDITY: "Agregar Liquidez",
  REMOVE_LIQUIDITY: "Remover Liquidez",
  TOKEN_A_INPUT: "Token A (Input)",
  TOKEN_B_OUTPUT: "Token B (Output)",
  AMOUNT_IN: "Cantidad de entrada",
  AMOUNT_OUT: "Cantidad de salida",
  SLIPPAGE: "Slippage (%)",
  EXECUTE_SWAP: "Ejecutar Swap",
  ADD_LIQUIDITY_BTN: "Agregar Liquidez",
  REMOVE_LIQUIDITY_BTN: "Remover Liquidez",
  GET_PRICE: "Obtener Precio",
  POOL_INFO: "Información del Pool",
} as const;

export const PLACEHOLDERS = {
  TOKEN_ADDRESS: "Dirección del Token (0x...)",
  AMOUNT: "Cantidad",
  SLIPPAGE_VALUE: "0.5",
} as const;

export const VALIDATION = {
  ADDRESS_REGEX: /^0x[a-fA-F0-9]{40}$/,
  MIN_SLIPPAGE: 0.1,
  MAX_SLIPPAGE: 50,
  DEFAULT_SLIPPAGE: 0.5,
} as const;

export const STYLES = {
  COLORS: {
    PRIMARY: "#007bff",
    SUCCESS: "#28a745",
    WARNING: "#ffc107",
    DANGER: "#dc3545",
    INFO: "#17a2b8",
    LIGHT: "#f8f9fa",
    DARK: "#343a40",
  },
  BORDER_RADIUS: "8px",
  PADDING: "16px",
  MARGIN: "24px",
} as const; 