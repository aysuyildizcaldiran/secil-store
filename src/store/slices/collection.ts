import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface FilterItem {
  id: string;
  title: string;
  value: string;
  valueName: string;
}

interface Collection {
  id: string;
  info?: { name?: string };
  filters?: { filters?: FilterItem[] };
  salesChannelId?: string;
}

interface Meta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface CollectionState {
  collections: Collection[];
  meta: Meta | null;
  page: number;
  openProducts: { [key: string]: any[] };
  loading: boolean;
  loadingProducts: string | null;
  error: string | null;
}

const initialState: CollectionState = {
  collections: [],
  meta: null,
  page: 1,
  openProducts: {},
  loading: false,
  loadingProducts: null,
  error: null,
};

export const fetchCollections = createAsyncThunk(
  'collection/fetchCollections',
  async ({ token, page }: { token: string; page: number }, { rejectWithValue }) => {
    try {
      const res = await fetch(`https://maestro-api-dev.secil.biz/Collection/GetAll?page=${page}&pageSize=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      return { collections: data.data, meta: data.meta };
    } catch (err) {
      return rejectWithValue('Koleksiyonlar yüklenemedi.');
    }
  }
);

export const fetchCollectionProducts = createAsyncThunk(
  'collection/fetchCollectionProducts',
  async (
    { token, collectionId }: { token: string; collectionId: string | number },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(
        `https://maestro-api-dev.secil.biz/Collection/${collectionId}/GetProductsForConstants`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ additionalFilters: [], page: 1, pageSize: 36 }),
        }
      );
      const data = await res.json();
      return { collectionId, products: data.data.data || [] };
    } catch (err) {
      return rejectWithValue('Ürünler yüklenemedi.');
    }
  }
);

const collectionSlice = createSlice({
  name: 'collection',
  initialState,
  reducers: {
    setPage(state, action) {
      state.page = action.payload;
    },
    clearProducts(state, action) {
      delete state.openProducts[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCollections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.loading = false;
        state.collections = action.payload.collections;
        state.meta = action.payload.meta;
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCollectionProducts.pending, (state, action) => {
        state.loadingProducts = action.meta.arg.collectionId.toString();
        state.error = null;
      })
      .addCase(fetchCollectionProducts.fulfilled, (state, action) => {
        state.loadingProducts = null;
        state.openProducts[action.payload.collectionId] = action.payload.products;
      })
      .addCase(fetchCollectionProducts.rejected, (state, action) => {
        state.loadingProducts = null;
        state.error = action.payload as string;
      });
  },
});

export const { setPage, clearProducts } = collectionSlice.actions;
export default collectionSlice.reducer;
