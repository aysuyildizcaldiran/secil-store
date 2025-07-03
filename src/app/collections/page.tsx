'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '../../store/hooks'

interface FilterItem {
  id: string
  title: string
  value: string
  valueName: string
}

interface Collection {
  id: string | number
  info?: {
    id: number
    name: string
    description: string
    url: string
    langCode: string
  }
  filters?: {
    useOrLogic: boolean
    filters: FilterItem[] | null
  }
  products?: any[]
  salesChannelId?: number
  type?: number
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

  const router = useRouter()
  const { token } = useAppSelector((state) => state.auth)
  const [openProducts, setOpenProducts] = useState<{ [key: string]: any[] }>({})
  const [loadingProducts, setLoadingProducts] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      router.replace('/')
      return
    }

    const fetchCollections = async () => {
      const res = await fetch(`https://maestro-api-dev.secil.biz/Collection/GetAll?page=${page}&pageSize=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await res.json()
      setCollections(data.data)
      setMeta(data.meta)
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
    setLoadingProducts(null)
  }

  if (!token) return null

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Koleksiyon Listesi</h1>

      <div className="border rounded overflow-hidden">
        {/* Başlık satırı */}
        <div className="grid grid-cols-12 bg-gray-100 text-sm font-semibold text-gray-700 border-b">
          <div className="col-span-3 p-3 border-r">Başlık</div>
          <div className="col-span-5 p-3 border-r">Ürün Koşulları</div>
          <div className="col-span-2 p-3 border-r">Satış Kanalı</div>
          <div className="col-span-2 p-3">İşlemler</div>
        </div>

        {/* Veri satırları */}
        {collections.map((collection) => (
          <div key={collection.id}>
            <div className="grid grid-cols-12 border-b text-sm text-gray-800">
              <div className="col-span-3 p-3 border-r">
                {collection.info?.name || '—'}
              </div>

              <div className="col-span-5 p-3 border-r space-y-1">
                {collection.filters?.filters?.length ? (
                  collection.filters.filters.map((f, i) => (
                    <div key={i}>
                      Ürün {f.title} bilgisi Şuna Eşit: <strong>{f.valueName}</strong>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400 italic">Koşul yok</span>
                )}
              </div>

              <div className="col-span-2 p-3 border-r">
                Satış Kanalı - {collection.salesChannelId}
              </div>

              <div className="col-span-2 p-3 flex gap-3 items-start">
                <button
                  onClick={() => handleEdit(collection.id.toString())}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 rounded shadow transition text-sm"
                >
                  Sabitleri Düzenle
                </button>
              </div>
            </div>

            {/* Ürünler */}
            {loadingProducts === collection.id.toString() && (
              <div className="p-4 text-blue-500 border-b">Ürünler yükleniyor...</div>
            )}

            {openProducts[collection.id] && (
              <div className="border-b bg-gray-50 p-4">
                {openProducts[collection.id].length === 0 ? (
                  <div>Ürün bulunamadı.</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {openProducts[collection.id].map((product) => (
                      <div
                        key={product.productCode}
                        className="border rounded p-2 flex flex-col items-center"
                      >
                        <img
                          src={product.imageUrl || '/window.svg'}
                          alt={product.name}
                          className="w-18 h-18 object-contain rounded shadow mb-2 bg-white border"
                          style={{ width: '72px', height: '72px' }}
                        />
                        <div className="text-sm text-center">{product.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sayfalama */}
      {meta && (
        <div className="flex justify-end mt-6">
          <ul className="flex space-x-1">
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
              <li key={p}>
                <button
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded ${
                    page === p
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700'
                  }`}
                >
                  {p}
                </button>
              </li>
            ))}
            {meta.hasNextPage && (
              <li>
                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  className="px-3 py-1 border border-gray-300 bg-white text-gray-700 rounded"
                >
                  &gt;
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </main>
  )
}
