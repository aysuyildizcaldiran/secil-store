'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAppSelector } from '../../store/hooks'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'

interface Product {
  productCode: string
  name: string
  imgUrl: string
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
  }, [collectionId, token, router])

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result
    if (!destination) return

    if (source.droppableId === 'allProducts' && destination.droppableId === 'constants') {
      const product = allProducts[source.index]
      if (!constants.find((p) => p.productCode === product.productCode)) {
        setConstants([...constants, product])
        setAllProducts(allProducts.filter((p) => p.productCode !== product.productCode))
      }
    }

    if (source.droppableId === 'constants' && destination.droppableId === 'allProducts') {
      const product = constants[source.index]
      if (!allProducts.find((p) => p.productCode === product.productCode)) {
        setAllProducts([...allProducts, product])
        setConstants(constants.filter((p) => p.productCode !== product.productCode))
      }
    }

    if (source.droppableId === 'constants' && destination.droppableId === 'constants') {
      const newConstants = Array.from(constants)
      const [moved] = newConstants.splice(source.index, 1)
      newConstants.splice(destination.index, 0, moved)
      setConstants(newConstants)
    }

    if (source.droppableId === 'allProducts' && destination.droppableId === 'allProducts') {
      const newAll = Array.from(allProducts)
      const [moved] = newAll.splice(source.index, 1)
      newAll.splice(destination.index, 0, moved)
      setAllProducts(newAll)
    }
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

  if (!token) return null

  return (
    <main className="p-6">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-2 gap-6">
          {/* Koleksiyon Ürünleri */}
          <section className="bg-white border rounded-xl p-4 flex flex-col max-h-[70vh] overflow-y-auto">
            <h2 className="font-semibold text-lg mb-2">Koleksiyon Ürünleri</h2>
            <Droppable droppableId="allProducts">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid grid-cols-3 gap-4 min-h-[120px]"
                >
                  {allProducts.length === 0 && (
                    <div className="col-span-3 text-center text-gray-400 italic">Ürün kalmadı</div>
                  )}
                  {allProducts.map((product, idx) => (
                    <Draggable key={product.productCode} draggableId={product.productCode} index={idx}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="border rounded-lg p-2 flex flex-col items-center bg-white shadow-sm user-select-none cursor-move"
                          style={{ width: '96px', height: '180px' }}
                        >
                          <img
                            src={product.imgUrl}
                            alt={product.name}
                            className="object-cover rounded mb-2 border bg-white"
                            style={{ width: '96px', height: '128px' }}
                          />
                          <div className="font-medium text-sm text-center">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.productCode}</div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </section>
          {/* Sabitler */}
          <section className="bg-white border rounded-xl p-4 flex flex-col max-h-[70vh] overflow-y-auto">
            <h2 className="font-semibold text-lg mb-2">Sabitler</h2>
            <Droppable droppableId="constants">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`grid grid-cols-3 gap-4 min-h-[120px] transition-all duration-200 ${
                    snapshot.isDraggingOver ? 'bg-indigo-50 border-2 border-indigo-400' : ''
                  }`}
                  style={{ minHeight: 120, background: snapshot.isDraggingOver ? '#eef2ff' : undefined }}
                >
                  {constants.length === 0 && (
                    <div className="col-span-3 text-center text-gray-400 italic">Sabit ürün yok</div>
                  )}
                  {constants.map((product, idx) => (
                    <Draggable key={product.productCode} draggableId={product.productCode} index={idx}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="border rounded-lg p-2 flex flex-col items-center bg-white shadow-sm user-select-none cursor-move"
                          style={{ width: '96px', height: '180px' }}
                        >
                          <img
                            src={product.imgUrl}
                            alt={product.name}
                            className="object-cover rounded mb-2 border bg-white"
                            style={{ width: '96px', height: '128px' }}
                          />
                          <div className="font-medium text-sm text-center">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.productCode}</div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </section>
        </div>
      </DragDropContext>
      <div className="flex justify-end gap-4 mt-8">
        <button
          onClick={() => router.push('/collections')}
          className="bg-gray-400 text-white px-6 py-2 rounded font-semibold"
        >
          Vazgeç
        </button>
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-6 py-2 rounded font-semibold"
        >
          Kaydet
        </button>
      </div>
    </main>
  )
} 