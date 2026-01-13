import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Client } from '@/types/client';

interface ClientState {
  clients: Client[];
  currentClient: Client | null;
  loading: boolean;
  error: string | null;
}

const initialState: ClientState = {
  clients: [],
  currentClient: null,
  loading: false,
  error: null,
};

const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    setClients: (state, action: PayloadAction<Client[]>) => {
      state.clients = action.payload;
    },
    setCurrentClient: (state, action: PayloadAction<Client | null>) => {
      state.currentClient = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addClient: (state, action: PayloadAction<Client>) => {
      state.clients.push(action.payload);
    },
    updateClient: (state, action: PayloadAction<Client>) => {
      const index = state.clients.findIndex(c => c.id === action.payload.id || c._id === action.payload._id);
      if (index !== -1) {
        state.clients[index] = action.payload;
      }
    },
    removeClient: (state, action: PayloadAction<string>) => {
      state.clients = state.clients.filter(c => c.id !== action.payload && c._id !== action.payload);
    },
  },
});

export const { setClients, setCurrentClient, setLoading, setError, addClient, updateClient, removeClient } = clientSlice.actions;
export default clientSlice.reducer;


