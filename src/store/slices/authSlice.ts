import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  expiresIn: number | null;
  refreshExpiresIn: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  refreshToken: null,
  tokenType: null,
  expiresIn: null,
  refreshExpiresIn: null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (
    { username, password }: { username: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch('https://maestro-api-dev.secil.biz/Auth/Login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.data?.accessToken) {
        return rejectWithValue(data.message || 'Giriş başarısız');
      }
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Bir hata oluştu');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.refreshToken = null;
      state.tokenType = null;
      state.expiresIn = null;
      state.refreshExpiresIn = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.token = action.payload.accessToken || null;
        state.refreshToken = action.payload.refreshToken || null;
        state.tokenType = action.payload.tokenType || null;
        state.expiresIn = action.payload.expiresIn || null;
        state.refreshExpiresIn = action.payload.refreshExpiresIn || null;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer; 