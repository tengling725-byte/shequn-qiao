'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api'

const CATEGORIES = {
  资金: '💰',
  渠道: '📦',
  人脉: '👥',
  技能: '💡',
  合伙人: '🤝',
  员工: '👷',
  客户: '🤵',
  合作: '🤝',
  供应商: '🏭',
  其他: '📌'
}

const RESOURCE_TYPES = ['长期', '短期']
const NEED_TYPES = ['长期', '急需', '未来3月', '自定义']

export default function Home() {
  const [tab, setTab] = useState<'resource' | 'need'>('resource')
  const [typeFilter, setTypeFilter] = useState('')
  const [keyword, setKeyword] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { currentCommunity, user } = useAppStore()

  const loadData = async () => {
    if (!currentCommunity) return
    setLoading(true)
    try {
      if (tab === 'resource') {
        const data = await api.getResources({
          communityId: currentCommunity.id,
          type: typeFilter || undefined,
          keyword: keyword || undefined
        })
        setItems(data.resources)
      } else {
        const data = await api.getNeeds({
          communityId: currentCommunity.id,
          type: typeFilter || undefined,
          keyword: keyword || undefined
        })
        setItems(data.needs)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [tab, typeFilter, currentCommunity])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadData()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
        <h1 className="text-lg font-semibold">社群桥</h1>
        <div className="flex gap-2">
          <button className="text-sm">🔔</button>
          <button className="text-sm">👤</button>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="bg-white px-4 py-3">
        <input
          type="text"
          placeholder="搜索资源/需求..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm"
        />
      </form>

      {/* Tab */}
      <div className="bg-white flex border-b">
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            tab === 'resource' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
          }`}
          onClick={() => { setTab('resource'); setTypeFilter('') }}
        >
          资源
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            tab === 'need' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
          }`}
          onClick={() => { setTab('need'); setTypeFilter('') }}
        >
          需求
        </button>
      </div>

      {/* Type Filter */}
      <div className="bg-white px-4 py-2 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setTypeFilter('')}
          className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${
            !typeFilter ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
          }`}
        >
          全部
        </button>
        {(tab === 'resource' ? RESOURCE_TYPES : NEED_TYPES).map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${
              typeFilter === t ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="p-4 space-y-3">
        {!currentCommunity ? (
          <div className="text-center py-10 text-gray-500">
            <p>请先选择社群</p>
          </div>
        ) : loading ? (
          <div className="text-center py-10 text-gray-500">加载中...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>暂无内容</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      item.type === '急需' ? 'bg-red-100 text-red-600' :
                      item.type === '短期' ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {item.type}
                    </span>
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>{CATEGORIES[item.category as keyof typeof CATEGORIES] || '📌'} {item.category}</span>
                    <span>👁️ {item.viewCount || 0}</span>
                    <span>by {item.user?.nickname || '匿名'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 text-xs">
        <button className="text-blue-600 flex flex-col items-center">
          <span className="text-lg">🏠</span>
          首页
        </button>
        <button className="text-gray-500 flex flex-col items-center">
          <span className="text-lg">📝</span>
          发布
        </button>
        <button className="text-gray-500 flex flex-col items-center">
          <span className="text-lg">👥</span>
          社群
        </button>
        <button className="text-gray-500 flex flex-col items-center">
          <span className="text-lg">👤</span>
          我的
        </button>
      </div>
    </div>
  )
}