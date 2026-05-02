import { NextRequest, NextResponse } from 'next/server'
import { data } from '@/lib/data'

// 创建或获取用户
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wechatOpenid, wechatUnionid, nickname, avatar, phone } = body

    if (!wechatOpenid && !phone) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    let user = null
    if (wechatOpenid) {
      user = data.users.findByWechat(wechatOpenid)
    } else if (phone) {
      user = data.users.findByPhone(phone)
    }

    if (user) {
      user = data.users.update(user.id, {
        ...(nickname && { nickname }),
        ...(avatar && { avatar }),
        ...(wechatUnionid && { wechatUnionid })
      })
    } else {
      user = data.users.create({
        wechatOpenid,
        wechatUnionid,
        nickname,
        avatar,
        phone,
        isVerified: true
      })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('创建用户失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 获取当前用户信息
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const user = data.users.findById(userId)

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      phone: user.phone,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}