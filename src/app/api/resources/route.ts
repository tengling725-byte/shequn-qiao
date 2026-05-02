import { NextRequest, NextResponse } from 'next/server'
import { data } from '@/lib/data'

// 创建资源
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { communityId, type, category, title, description, tags, isPublic } = body

    if (!communityId || !type || !category || !title || !description) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const resource = data.resources.create({
      userId,
      communityId,
      type,
      category,
      title,
      description,
      tags: tags || [],
      isPublic: isPublic ?? true
    })

    return NextResponse.json(resource)
  } catch (error) {
    console.error('创建资源失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 获取资源列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const communityId = searchParams.get('communityId')
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const keyword = searchParams.get('keyword')

    if (!communityId) {
      return NextResponse.json({ error: '缺少社群ID' }, { status: 400 })
    }

    const resources = data.resources.find({
      communityId,
      type: type || undefined,
      category: category || undefined,
      keyword: keyword || undefined
    })

    return NextResponse.json({ resources, total: resources.length })
  } catch (error) {
    console.error('获取资源列表失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}