import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CartItem {
  productoId: number
  nombre: string
  precio: number
  cantidad: number
}

interface CartState {
  sucursalId: number | null
  items: CartItem[]
}

const initialState: CartState = {
  sucursalId: null,
  items: [],
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setSucursal: (state, action: PayloadAction<number>) => {
      // If we change branches, clear the cart to prevent cross-branch orders
      if (state.sucursalId !== action.payload) {
        state.items = []
      }
      state.sucursalId = action.payload
    },
    addItem: (state, action: PayloadAction<Omit<CartItem, 'cantidad'>>) => {
      const existing = state.items.find((item) => item.productoId === action.payload.productoId)
      if (existing) {
        existing.cantidad += 1
      } else {
        state.items.push({ ...action.payload, cantidad: 1 })
      }
    },
    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.productoId !== action.payload)
    },
    clearCart: (state) => {
      state.items = []
    },
  },
})

export const { setSucursal, addItem, removeItem, clearCart } = cartSlice.actions
export default cartSlice.reducer
