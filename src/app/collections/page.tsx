'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '../../store/hooks'
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
  const [collections, setCollections] = useState<Collection[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [page, setPage] = useState(1)
  const [openProducts, setOpenProducts] = useState<{ [key: string]: any[] }>({})
  const [loadingProducts, setLoadingProducts] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const { token } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!token) {
      router.replace('/')
      return
    }

    const fetchCollections = async () => {
      try {
        const res = await fetch(`https://maestro-api-dev.secil.biz/Collection/GetAll?page=${page}&pageSize=10`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        const data = await res.json()
        setCollections(data.data)
        setMeta(data.meta)
      } catch (err) {
        setError('Koleksiyonlar yüklenemedi.')
      }
    }

    fetchCollections()
  }, [token, router, page])

  const handleEdit = (id: string) => {
    router.push(`/edit?id=${id}`)
  }

  const handleShowProducts = async (collectionId: string | number) => {
    if (openProducts[collectionId]) {
      setOpenProducts((prev) => {
        const copy = { ...prev }
        delete copy[collectionId]
        return copy
      })
      return
    }

    setLoadingProducts(collectionId.toString())

    try {
      const res = await fetch(`https://maestro-api-dev.secil.biz/Collection/${collectionId}/GetProductsForConstants`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ additionalFilters: [], page: 1, pageSize: 36 }),
      })
      const data = await res.json()
      setOpenProducts((prev) => ({ ...prev, [collectionId]: data.data.data || [] }))
    } catch (err) {
      setError('Ürünler yüklenemedi.')
    } finally {
      setLoadingProducts(null)
    }
  }

  if (!token) return null

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
        {collections.map((collection) => (
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
        ))}
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
                onClick={() => setPage(p)}
                sx={{ minWidth: 36, fontWeight: 'bold', borderRadius: 2 }}
              >
                {p}
              </Button>
            ))}
            {meta.hasNextPage && (
              <Button
                onClick={() => setPage((prev) => prev + 1)}
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
  )
}
