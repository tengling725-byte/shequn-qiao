import { NextRequest, NextResponse } from 'next/server'
import { data } from '@/lib/data'

// 创建需求
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { communityId, type, urgency, deadline, category, title, description, tags, isPublic } = body

    if (!communityId || !type || !category || !title || !description) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const need = data.needs.create({
      userId,
      communityId,
      type,
      urgency: urgency || '中',
      deadline,
      category,
      title,
      description,
      tags: tags || [],
      isPublic: isPublic ?? true
    })

    return NextResponse.json(need)
  } catch (error) {
    console.error('创建需求失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 获取需求列表
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

    const needs = data.needs.find({
      communityId,
      type: type || undefined,
      category: category || undefined,
      keyword: keyword || undefined
    })

    return NextResponse.json({ needs, total: needs.length })
  } catch (error) {
    console.error('获取需求列表失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}