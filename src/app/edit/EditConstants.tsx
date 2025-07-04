'use client'

import React, { useEffect, useState } from 'react'
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
  Dialog,
  DialogContent,
  IconButton,
  Slide
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import {
  fetchProductsForConstants,
  fetchFiltersForConstants,
  setConstants,
  addToConstants,
  removeFromConstants,
  clearConstants,
  clearAllProducts,
  removeFromAllProducts,
  addToAllProducts,
} from '../../store/slices/collection'

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
import { useDraggable, useDroppable } from '@dnd-kit/core'
import ProductCard from '../components/ProductCard'
import FilterPanel from '../components/FilterPanel'

interface Product {
  productCode: string
  name: string
  imgUrl: string
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
    <Box 
      display="grid" 
      gridTemplateColumns="repeat(auto-fill, minmax(150px, 1fr))" 
      gap={2} 
      ref={setNodeRef} 
      minHeight={140}
    >
      {children}
    </Box>
  )
}



const Transition = React.forwardRef(function Transition(props: any, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function EditConstants() {
  const searchParams = useSearchParams()
  const collectionId = searchParams.get('id')
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { token } = useAppSelector((state) => state.auth)
  const { 
    allProducts, 
    constants, 
    filterData, 
    loading, 
    loadingFilters, 
    error 
  } = useAppSelector((state) => state.collection)

  const [filterOpen, setFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!token) {
      router.replace('/')
      return
    }
    if (!collectionId) return

    const additionalFilters = Object.entries(appliedFilters).flatMap(([filterId, values]) =>
      values.map(value => ({
        id: filterId,
        value: value,
        comparisonType: filterId === 'stock' ? 3 : 0
      }))
    );
    
    dispatch(fetchProductsForConstants({ token, collectionId, additionalFilters }))
  }, [collectionId, token, dispatch, appliedFilters])

  useEffect(() => {
    if (!token || !collectionId) return;
    dispatch(fetchFiltersForConstants({ token, collectionId }));
  }, [token, collectionId, dispatch]);

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const isInConstants = constants.some((p: Product) => p.productCode === active.id)
    const isOverConstants = over.id === 'constants' || constants.some((p: Product) => p.productCode === over.id)

    if (isInConstants && constants.some((p: Product) => p.productCode === over.id) && active.id !== over.id) {
      const oldIndex = constants.findIndex((p: Product) => p.productCode === active.id)
      const newIndex = constants.findIndex((p: Product) => p.productCode === over.id)
      const newConstants = arrayMove(constants, oldIndex, newIndex)
      dispatch(setConstants(newConstants))
      return
    }

    const draggedItem = allProducts.find((p: Product) => p.productCode === active.id)
    if (
      draggedItem &&
      !constants.find((p: Product) => p.productCode === draggedItem.productCode) &&
      isOverConstants
    ) {
      dispatch(addToConstants(draggedItem))
      dispatch(removeFromAllProducts(draggedItem.productCode))
    }
  }

  const handleRemoveConstant = (productCode: string) => {
    const removed = constants.find((p: Product) => p.productCode === productCode)
    if (!removed) return
    dispatch(removeFromConstants(productCode))
    dispatch(addToAllProducts(removed))
  }

  const handleSave = async () => {
    if (!collectionId) return
    const productCodes = constants.map((p) => p.productCode)

    const constantsList = constants.map((product, index) => 
      `${index + 1}. ${product.name} (${product.productCode})`
    ).join('\n');

    
    const alertMessage = constants.length > 0 
      ? `Sabitler başarıyla kaydedildi!\n\nKaydedilen ürünler:\n${constantsList}`
      : 'Sabitler başarıyla kaydedildi!\n\nKaydedilen ürün bulunmuyor.';

    const stabilMessage="\nÖrnek bir request PostMan de göremediğim için bu şekilde yazdım."
    alert(alertMessage + stabilMessage)
    router.push('/collections')
  }

  const handleFiltersChange = (filters: Record<string, { values: string[], comparisonType: number }>) => {
    const simpleFilters: Record<string, string[]> = {};
    Object.entries(filters).forEach(([filterId, filterData]) => {
      simpleFilters[filterId] = filterData.values;
    });
    
    setAppliedFilters(simpleFilters);
    console.log('Uygulanan filtreler:', filters);
    setFilterOpen(false);
    
    const additionalFilters = Object.entries(filters).flatMap(([filterId, filterData]) =>
      filterData.values.map(value => ({
        id: filterId,
        value: value,
        comparisonType: filterData.comparisonType
      }))
    );
    
    console.log('API için hazırlanan filtreler:', additionalFilters);
    
    if (collectionId && token) {
      dispatch(fetchProductsForConstants({ token, collectionId, additionalFilters }));
    }
  };



  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          {Object.keys(appliedFilters).length > 0 && (
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" color="text.secondary">
                {Object.keys(appliedFilters).length} filtre kategorisi uygulandı
              </Typography>
              <Button 
                size="small" 
                variant="text" 
                color="error"
                onClick={() => {
                  setAppliedFilters({});
                  if (collectionId && token) {
                    dispatch(fetchProductsForConstants({ token, collectionId, additionalFilters: [] }));
                  }
                }}
              >
                Temizle
              </Button>
            </Box>
          )}
        </Box>
        <Button variant="outlined" onClick={() => setFilterOpen(true)}>
          Filtrele
        </Button>
      </Box>
      <Dialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        TransitionComponent={Transition}
        fullWidth
        maxWidth="lg"
        sx={{
          '& .MuiDialog-container': {
            alignItems: 'flex-end',
          },
        }}
        PaperProps={{
          sx: { borderRadius: '24px 24px 0 0', m: 0, pb: 2, maxHeight: '80vh' },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {collectionId && token && (
            <FilterPanel
              collectionId={collectionId}
              token={token}
              onFiltersChange={handleFiltersChange}
              filterData={filterData}
              loadingFilters={loadingFilters}
            />
          )}
        </DialogContent>
      </Dialog>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <Box sx={{ display: 'flex', gap: 4 }}>

          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 2, maxHeight: '75vh', overflowY: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Koleksiyon Ürünleri
              </Typography>
              {allProducts.length === 0 ? (
                <Box 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center" 
                  minHeight={200}
                  sx={{ 
                    border: '2px dashed #ccc', 
                    borderRadius: 2, 
                    backgroundColor: '#f5f5f5' 
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Ürün bulunmamaktadır
                  </Typography>
                </Box>
              ) : (
                <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(150px, 1fr))" gap={2}>
                  {allProducts.map((product) => (
                    <DraggableProduct key={product.productCode} product={product} />
                  ))}
                </Box>
              )}
            </Paper>
          </Box>
          {allProducts.length > 0 && (
          
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
                    <SortableProduct key={product.productCode} product={product} onRemove={handleRemoveConstant} />
                  ))}

                  {/* Boş slotlar */}
                  {Array.from({ length: allProducts.length - constants.length }, (_, i) => (
                    <Box
                      key={`empty-slot-${i}`}
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
                  ))}
                </DroppableContainer>
              </SortableContext>
            </Paper>
          </Box>
        )}
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