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

interface Product {
  productCode: string;
  name: string;
  imgUrl: string;
}

interface FilterData {
  id: string;
  title: string;
  values: Array<{
    value: string;
    valueName: string | null;
  }>;
  currency: string | null;
  comparisonType: number;
}

interface CollectionState {
  collections: Collection[];
  meta: Meta | null;
  page: number;
  openProducts: { [key: string]: any[] };
  allProducts: Product[];
  constants: Product[];
  filterData: FilterData[];
  loadingFilters: boolean;
  loading: boolean;
  loadingProducts: string | null;
  error: string | null;
}

const initialState: CollectionState = {
  collections: [],
  meta: null,
  page: 1,
  openProducts: {},
  allProducts: [],
  constants: [],
  filterData: [],
  loadingFilters: false,
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

export const fetchProductsForConstants = createAsyncThunk(
  'collection/fetchProductsForConstants',
  async (
    { token, collectionId, additionalFilters = [] }: { 
      token: string; 
      collectionId: string; 
      additionalFilters?: any[] 
    },
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
          body: JSON.stringify({ additionalFilters, page: 1, pageSize: 36 }),
        }
      );
      const data = await res.json();
      const products = (data?.data?.data || []).map((item: any) => ({
        productCode: item.productCode,
        name: item.name,
        imgUrl: item.imageUrl,
      }));
      return products;
    } catch (err) {
      return rejectWithValue('Ürünler yüklenemedi.');
    }
  }
);

export const fetchFiltersForConstants = createAsyncThunk(
  'collection/fetchFiltersForConstants',
  async (
    { token, collectionId }: { token: string; collectionId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        `https://maestro-api-dev.secil.biz/Collection/${collectionId}/GetFiltersForConstants`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 200) {
        return data.data;
      } else {
        throw new Error(data.message || 'Filtre verileri alınamadı');
      }
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu');
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
    setConstants(state, action) {
      state.constants = action.payload;
    },
    addToConstants(state, action) {
      state.constants.push(action.payload);
    },
    removeFromConstants(state, action) {
      state.constants = state.constants.filter(p => p.productCode !== action.payload);
    },
    clearConstants(state) {
      state.constants = [];
    },
    clearAllProducts(state) {
      state.allProducts = [];
    },
    removeFromAllProducts(state, action) {
      state.allProducts = state.allProducts.filter(p => p.productCode !== action.payload);
    },
    addToAllProducts(state, action) {
      state.allProducts.push(action.payload);
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
      })
      .addCase(fetchProductsForConstants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsForConstants.fulfilled, (state, action) => {
        state.loading = false;
        state.allProducts = action.payload;
        state.constants = [];
      })
      .addCase(fetchProductsForConstants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchFiltersForConstants.pending, (state) => {
        state.loadingFilters = true;
        state.error = null;
      })
      .addCase(fetchFiltersForConstants.fulfilled, (state, action) => {
        state.loadingFilters = false;
        state.filterData = action.payload;
      })
      .addCase(fetchFiltersForConstants.rejected, (state, action) => {
        state.loadingFilters = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setPage, 
  clearProducts, 
  setConstants, 
  addToConstants, 
  removeFromConstants, 
  clearConstants, 
  clearAllProducts,
  removeFromAllProducts,
  addToAllProducts
} = collectionSlice.actions;
export default collectionSlice.reducer;
