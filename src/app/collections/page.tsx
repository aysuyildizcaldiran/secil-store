'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Grid,
  Paper,
  Typography,
  Collapse,
  Alert,
  IconButton,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import {
  fetchCollections,
  fetchCollectionProducts,
  setPage,
  clearProducts,
} from '../../store/slices/collection'

interface FilterItem {
  id: string
  title: string
  value: string
  valueName: string
}

interface Collection {
  id: string
  info?: { name?: string }
  filters?: { filters?: FilterItem[] }
  salesChannelId?: string
}

interface Meta {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export default function CollectionsPage() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const {
    collections,
    meta,
    page,
    openProducts,
    loading,
    loadingProducts,
    error,
  } = useAppSelector((state) => state.collection);

  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace('/');
      return;
    }
    dispatch(fetchCollections({ token, page }));
  }, [token, router, page, dispatch]);

  const handleEdit = (id: string) => {
    router.push(`/edit?id=${id}`);
  };

  const handleShowProducts = (collectionId: string | number) => {
    if (openProducts[collectionId]) {
      dispatch(clearProducts(collectionId));
      return;
    }
    if (token) {
      dispatch(fetchCollectionProducts({ token, collectionId }));
    }
  };

  if (!token) return null;

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        Koleksiyon Listesi
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box display="flex" bgcolor="grey.100" px={2} py={1.5}>
          <Box flex={3} fontWeight="bold">Başlık</Box>
          <Box flex={5} fontWeight="bold">Ürün Koşulları</Box>
          <Box flex={2} fontWeight="bold">Satış Kanalı</Box>
          <Box flex={2} fontWeight="bold">İşlemler</Box>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          collections.map((collection) => (
            <Box key={collection.id} borderBottom={1} borderColor="grey.200">
              <Box display="flex" alignItems="center" px={2} py={2}>
                <Box flex={3}>{collection.info?.name || '—'}</Box>
                <Box flex={5}>
                  {collection.filters?.filters?.length ? (
                    collection.filters.filters.map((f, i) => (
                      <Typography variant="body2" key={i}>
                        Ürün {f.title} bilgisi Şuna Eşit: <b>{f.valueName}</b>
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                      Koşul yok
                    </Typography>
                  )}
                </Box>
                <Box flex={2}>Satış Kanalı - {collection.salesChannelId}</Box>
                <Box flex={2} display="flex" gap={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleEdit(collection.id.toString())}
                    sx={{ fontWeight: 'bold', borderRadius: 2 }}
                  >
                    Sabitleri Düzenle
                  </Button>
                
                </Box>
              </Box>
              <Collapse in={!!openProducts[collection.id]} timeout="auto" unmountOnExit>
                <Box bgcolor="grey.50" px={3} py={2}>
                  {loadingProducts === collection.id.toString() ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <CircularProgress size={20} />
                      <Typography color="primary">Ürünler yükleniyor...</Typography>
                    </Box>
                  ) : openProducts[collection.id]?.length === 0 ? (
                    <Typography color="text.secondary">Ürün bulunamadı.</Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {openProducts[collection.id]?.map((product: any) => (
                        <Grid item xs={6} md={3} key={product.productCode}>
                          <Card elevation={1} sx={{ borderRadius: 2, p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Box
                              component="img"
                              src={product.imageUrl || '/window.svg'}
                              alt={product.name}
                              sx={{ width: 72, height: 72, objectFit: 'contain', borderRadius: 2, mb: 1, bgcolor: 'white', border: 1, borderColor: 'grey.200' }}
                            />
                            <Typography variant="body2" align="center">{product.name}</Typography>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              </Collapse>
            </Box>
          ))
        )}
      </Paper>
      {/* Sayfalama */}
      {meta && (
        <Box display="flex" justifyContent="flex-end" mt={4}>
          <Box display="flex" gap={1}>
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={page === p ? 'contained' : 'outlined'}
                color={page === p ? 'primary' : 'inherit'}
                size="small"
                onClick={() => dispatch(setPage(p))}
                sx={{ minWidth: 36, fontWeight: 'bold', borderRadius: 2 }}
              >
                {p}
              </Button>
            ))}
            {meta.hasNextPage && (
              <Button
                onClick={() => dispatch(setPage(page + 1))}
                variant="outlined"
                size="small"
                sx={{ minWidth: 36, borderRadius: 2 }}
              >
                &gt;
              </Button>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
