const API_BASE = '/api'

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '请求失败' }))
    throw new Error(error.error || '请求失败')
  }

  return response.json()
}

export const api = {
  // 用户
  createUser: (data: any) =>
    fetchApi<any>('/user', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getUser: (userId: string) =>
    fetchApi<any>('/user', {
      headers: { 'x-user-id': userId }
    }),

  // 社群
  getCommunities: (userId?: string) =>
    fetchApi<{ communities: any[] }>('/communities', {
      headers: userId ? { 'x-user-id': userId } : {}
    }),
  createCommunity: (data: any, userId: string) =>
    fetchApi<any>('/communities', {
      method: 'POST',
      headers: { 'x-user-id': userId },
      body: JSON.stringify(data)
    }),

  // 资源
  getResources: (params: {
    communityId: string
    type?: string
    category?: string
    keyword?: string
    page?: number
    pageSize?: number
  }) => {
    const searchParams = new URLSearchParams()
    searchParams.set('communityId', params.communityId)
    if (params.type) searchParams.set('type', params.type)
    if (params.category) searchParams.set('category', params.category)
    if (params.keyword) searchParams.set('keyword', params.keyword)
    if (params.page) searchParams.set('page', params.page.toString())
    if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString())

    return fetchApi<{ resources: any[]; total: number }>(`/resources?${searchParams}`)
  },
  createResource: (data: any, userId: string) =>
    fetchApi<any>('/resources', {
      method: 'POST',
      headers: { 'x-user-id': userId },
      body: JSON.stringify(data)
    }),

  // 需求
  getNeeds: (params: {
    communityId: string
    type?: string
    category?: string
    keyword?: string
    page?: number
    pageSize?: number
  }) => {
    const searchParams = new URLSearchParams()
    searchParams.set('communityId', params.communityId)
    if (params.type) searchParams.set('type', params.type)
    if (params.category) searchParams.set('category', params.category)
    if (params.keyword) searchParams.set('keyword', params.keyword)
    if (params.page) searchParams.set('page', params.page.toString())
    if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString())

    return fetchApi<{ needs: any[]; total: number }>(`/needs?${searchParams}`)
  },
  createNeed: (data: any, userId: string) =>
    fetchApi<any>('/needs', {
      method: 'POST',
      headers: { 'x-user-id': userId },
      body: JSON.stringify(data)
    })
}