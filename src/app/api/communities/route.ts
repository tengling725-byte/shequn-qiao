import { NextRequest, NextResponse } from 'next/server'
import { data } from '@/lib/data'

// 创建社群
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, type } = body

    if (!name) {
      return NextResponse.json({ error: '社群名称不能为空' }, { status: 400 })
    }

    const community = data.communities.create({
      name,
      description,
      type: type || 'other',
      ownerId: userId,
      memberCount: 1
    })

    return NextResponse.json(community)
  } catch (error) {
    console.error('创建社群失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 获取社群列表
export async function GET() {
  try {
    const communities = data.communities.findAll()
    return NextResponse.json({ communities })
  } catch (error) {
    console.error('获取社群列表失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}