'use client'

import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Paper,
  Container,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAppSelector } from '../../store/hooks'

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDraggable, useDroppable } from '@dnd-kit/core'

interface Product {
  productCode: string
  name: string
  imgUrl: string
}

function ProductCard({
  product,
  listeners,
  attributes,
  setNodeRef,
  transform,
  transition,
  isDragging,
}: any) {
  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      sx={{
        width: 150,
        height: 220,
        opacity: isDragging ? 0.5 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: 'move',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Box
        sx={{
          height: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <CardMedia
          component="img"
          image={product.imgUrl}
          alt={product.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </Box>
      <CardContent sx={{ textAlign: 'center', p: 1 }}>
        <Typography variant="subtitle2" fontWeight={600} noWrap>
          {product.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {product.productCode}
        </Typography>
      </CardContent>
    </Card>
  )
}

function DraggableProduct({ product }: { product: Product }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: product.productCode })
  return (
    <ProductCard
      product={product}
      attributes={attributes}
      listeners={listeners}
      setNodeRef={setNodeRef}
      transform={transform}
      isDragging={isDragging}
    />
  )
}

function SortableProduct({
  product,
  onRemove,
}: {
  product: Product
  onRemove?: (productCode: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.productCode })

  return (
    <Box sx={{ position: 'relative' }}>
      {onRemove && (
        <Button
          size="small"
          onClick={() => onRemove(product.productCode)}
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            minWidth: 0,
            padding: '2px 6px',
            zIndex: 1,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            '&:hover': {
              backgroundColor: '#f44336',
              color: 'white',
            },
          }}
        >
          ✕
        </Button>
      )}
      <ProductCard
        product={product}
        attributes={attributes}
        listeners={listeners}
        setNodeRef={setNodeRef}
        transform={transform}
        transition={transition}
        isDragging={isDragging}
      />
    </Box>
  )
}

function DroppableContainer({ id, children }: { id: string, children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id })
  return (
    <Grid container spacing={2} ref={setNodeRef} minHeight={140}>
      {children}
    </Grid>
  )
}

export default function EditConstants() {
  const searchParams = useSearchParams()
  const collectionId = searchParams.get('id')
  const router = useRouter()
  const { token } = useAppSelector((state) => state.auth)

  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [constants, setConstants] = useState<Product[]>([])

  useEffect(() => {
    if (!token) {
      router.replace('/')
      return
    }
    if (!collectionId) return

    const fetchProducts = async () => {
      const res = await fetch(`https://maestro-api-dev.secil.biz/Collection/${collectionId}/GetProductsForConstants`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ additionalFilters: [], page: 1, pageSize: 36 }),
      })
      const data = await res.json()
      const products = (data?.data?.data || []).map((item: any) => ({
        productCode: item.productCode,
        name: item.name,
        imgUrl: item.imageUrl,
      }))
      setAllProducts(products)
      setConstants([])
    }

    fetchProducts()
  }, [collectionId, token])

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const isInConstants = constants.some((p) => p.productCode === active.id)
    const isOverConstants = over.id === 'constants' || constants.some((p) => p.productCode === over.id)

    if (isInConstants && constants.some((p) => p.productCode === over.id) && active.id !== over.id) {
      const oldIndex = constants.findIndex((p) => p.productCode === active.id)
      const newIndex = constants.findIndex((p) => p.productCode === over.id)
      setConstants((items) => arrayMove(items, oldIndex, newIndex))
      return
    }

    const draggedItem = allProducts.find((p) => p.productCode === active.id)
    if (
      draggedItem &&
      !constants.find((p) => p.productCode === draggedItem.productCode) &&
      isOverConstants
    ) {
      setConstants((prev) => [...prev, draggedItem])
      setAllProducts((prev) => prev.filter((p) => p.productCode !== draggedItem.productCode))
    }
  }

  const handleRemoveConstant = (productCode: string) => {
    const removed = constants.find((p) => p.productCode === productCode)
    if (!removed) return
    setConstants((prev) => prev.filter((p) => p.productCode !== productCode))
    setAllProducts((prev) => [...prev, removed])
  }

  const handleSave = async () => {
    if (!collectionId) return
    const productCodes = constants.map((p) => p.productCode)

    const res = await fetch(`https://maestro-api-dev.secil.biz/Collection/${collectionId}/UpdateConstants`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ constants: productCodes }),
    })

    if (res.ok) {
      alert('Sabitler başarıyla kaydedildi!')
      router.push('/collections')
    } else {
      const error = await res.json()
      alert('Hata: ' + (error.message || 'Bilinmeyen bir hata'))
    }
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <Box sx={{ display: 'flex', gap: 4 }}>
          {/* Koleksiyon Ürünleri */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 2, maxHeight: '75vh', overflowY: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Koleksiyon Ürünleri
              </Typography>
              <Grid container spacing={2}>
                {allProducts.map((product) => (
                  <Grid item key={product.productCode}>
                    <DraggableProduct product={product} />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>

          {/* Sabitler */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 2, maxHeight: '75vh', overflowY: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Sabitler
              </Typography>
              <SortableContext
                items={constants.map((p) => p.productCode)}
                strategy={rectSortingStrategy}
              >
                <DroppableContainer id="constants">
                  {constants.map((product) => (
                    <Grid item key={product.productCode}>
                      <SortableProduct product={product} onRemove={handleRemoveConstant} />
                    </Grid>
                  ))}

                  {/* Boş slotlar */}
                  {Array.from({ length: allProducts.length - constants.length }, (_, i) => (
                    <Grid item key={`empty-slot-${i}`}>
                      <Box
                        sx={{
                          width: 150,
                          height: 220,
                          border: '2px dashed #90caf9',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#e3f2fd',
                          transition: '0.2s',
                          '&:hover': {
                            borderColor: '#42a5f5',
                            backgroundColor: '#bbdefb',
                          },
                        }}
                      >
                        <Typography variant="h4" color="primary">+</Typography>
                      </Box>
                    </Grid>
                  ))}
                </DroppableContainer>
              </SortableContext>
            </Paper>
          </Box>
        </Box>
      </DndContext>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
        <Button variant="outlined" color="inherit" onClick={() => router.push('/collections')}>
          Vazgeç
        </Button>
        <Button variant="contained" color="success" onClick={handleSave}>
          Kaydet
        </Button>
      </Box>
    </Container>
  )
}
