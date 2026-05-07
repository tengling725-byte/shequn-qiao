const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const { eventType, data, openId } = event
  
  try {
    await db.collection('userEvents'). add({
      data: {
        openId: openId,
        eventType: eventType,
        data: data,
        createTime: db.serverDate()
      }
    })
    return { success: true }
  } catch (e) {
    return { success: false, error: e }
  }
}