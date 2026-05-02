// 简单的内存存储，用于MVP演示
// 后续可以轻松替换为真实的数据库

interface User {
  id: string
  nickname?: string
  avatar?: string
  phone?: string
  wechatOpenid?: string
  wechatUnionid?: string
  isVerified: boolean
  createdAt: Date
}

interface Community {
  id: string
  name: string
  description: string
  type: string
  ownerId: string
  memberCount: number
  createdAt: Date
}

interface Resource {
  id: string
  userId: string
  communityId: string
  type: string
  category: string
  title: string
  description: string
  tags: string[]
  isPublic: boolean
  isPinned: boolean
  viewCount: number
  createdAt: Date
}

interface Need {
  id: string
  userId: string
  communityId: string
  type: string
  urgency: string
  deadline?: string
  category: string
  title: string
  description: string
  tags: string[]
  isPublic: boolean
  isPinned: boolean
  viewCount: number
  createdAt: Date
}

// 初始数据
const communities: Community[] = [
  { id: 'test-community-1', name: '北京大学半导体校友群', description: '北京大学半导体行业校友交流群', type: '校友', ownerId: 'test-user', memberCount: 128, createdAt: new Date() },
  { id: 'test-community-2', name: '香港高才群', description: '香港高才计划人群交流群', type: '其他', ownerId: 'test-user', memberCount: 56, createdAt: new Date() }
]

const users: User[] = [
  { id: 'test-user-1', nickname: '李四', isVerified: true, createdAt: new Date() },
  { id: 'test-user-2', nickname: '王五', isVerified: true, createdAt: new Date() }
]

const resources: Resource[] = [
  { id: 'test-resource-1', userId: 'test-user-1', communityId: 'test-community-1', type: '长期', category: '资金', title: '半导体行业投资资源', description: '专注半导体领域早期投资，投资额100万-3000万，主要关注芯片设计、传感器、AI芯片等方向。同时可对接产业资源和渠道。', tags: ['投资', '半导体', '渠道'], isPublic: true, isPinned: false, viewCount: 12, createdAt: new Date() },
  { id: 'test-resource-2', userId: 'test-user-1', communityId: 'test-community-1', type: '长期', category: '技能', title: '企业法律顾问资源', description: '15年企业法律顾问经验，擅长公司法、合同法、劳动法。可提供法律咨询和文书服务。', tags: ['法律', '咨询'], isPublic: true, isPinned: false, viewCount: 8, createdAt: new Date() }
]

const needs: Need[] = [
  { id: 'test-need-1', userId: 'test-user-2', communityId: 'test-community-2', type: '急需', urgency: '高', category: '员工', title: '急招嵌入式工程师', description: '创业公司急招嵌入式工程师，要求：3年以上经验，熟悉ARM/MIPS架构，精通C语言。工作地点：深圳。', tags: ['技术', '招聘'], isPublic: true, isPinned: false, viewCount: 23, createdAt: new Date() },
  { id: 'test-need-2', userId: 'test-user-2', communityId: 'test-community-2', type: '长期', urgency: '中', category: '合伙人', title: '寻找香港本地合伙人', description: '跨境电商初创，寻找香港本地合伙人，要求有电商运营经验，熟悉本地市场。可提供股权激励。', tags: ['电商', '合伙人', '香港'], isPublic: true, isPinned: false, viewCount: 18, createdAt: new Date() },
  { id: 'test-need-3', userId: 'test-user-1', communityId: 'test-community-1', type: '长期', urgency: '中', category: '资金', title: '寻求半导体投资', description: 'AI芯片创业项目，寻求天使轮投资500万人民币，已有demo，团队来自知名芯片公司。', tags: ['融资', 'AI芯片'], isPublic: true, isPinned: false, viewCount: 15, createdAt: new Date() }
]

// ID生成
let idCounter = 100
function genId(): string {
  return `id-${++idCounter}-${Date.now()}`
}

export const data = {
  // 用户
  users: {
    findById: (id: string) => users.find(u => u.id === id),
    findByWechat: (openid: string) => users.find(u => u.wechatOpenid === openid),
    findByPhone: (phone: string) => users.find(u => u.phone === phone),
    create: (user: Omit<User, 'id' | 'createdAt'>) => {
      const newUser = { ...user, id: genId(), createdAt: new Date() }
      users.push(newUser)
      return newUser
    },
    update: (id: string, data: Partial<User>) => {
      const idx = users.findIndex(u => u.id === id)
      if (idx >= 0) { users[idx] = { ...users[idx], ...data } }
      return users[idx]
    }
  },

  // 社群
  communities: {
    findAll: () => communities,
    findById: (id: string) => communities.find(c => c.id === id),
    create: (data: Omit<Community, 'id' | 'createdAt'>) => {
      const c = { ...data, id: genId(), createdAt: new Date() }
      communities.push(c)
      return c
    }
  },

  // 资源
  resources: {
    find: (params: { communityId: string; type?: string; category?: string; keyword?: string }) => {
      return resources.filter(r => {
        if (r.communityId !== params.communityId) return false
        if (!r.isPublic) return false
        if (params.type && r.type !== params.type) return false
        if (params.category && r.category !== params.category) return false
        if (params.keyword && !r.title.includes(params.keyword) && !r.description.includes(params.keyword)) return false
        return true
      }).map(r => ({
        ...r,
        user: users.find(u => u.id === r.userId)
      }))
    },
    create: (data: Omit<Resource, 'id' | 'createdAt' | 'viewCount' | 'isPinned'>) => {
      const r = { ...data, id: genId(), createdAt: new Date(), viewCount: 0, isPinned: false }
      resources.push(r)
      return r
    }
  },

  // 需求
  needs: {
    find: (params: { communityId: string; type?: string; category?: string; keyword?: string }) => {
      return needs.filter(n => {
        if (n.communityId !== params.communityId) return false
        if (!n.isPublic) return false
        if (params.type && n.type !== params.type) return false
        if (params.category && n.category !== params.category) return false
        if (params.keyword && !n.title.includes(params.keyword) && !n.description.includes(params.keyword)) return false
        return true
      }).map(n => ({
        ...n,
        user: users.find(u => u.id === n.userId)
      }))
    },
    create: (data: Omit<Need, 'id' | 'createdAt' | 'viewCount' | 'isPinned'>) => {
      const n = { ...data, id: genId(), createdAt: new Date(), viewCount: 0, isPinned: false }
      needs.push(n)
      return n
    }
  }
}