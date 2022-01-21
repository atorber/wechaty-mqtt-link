import { v4 } from 'uuid'
import moment from 'moment'
import {
    Contact, log, Message, ScanStatus, Wechaty, UrlLink, MiniProgram
} from "wechaty"

function getCurTime() {
    //timestamp是整数，否则要parseInt转换
    let timestamp = new Date().getTime()
    var timezone = 8; //目标时区时间，东八区
    var offset_GMT = new Date().getTimezoneOffset(); // 本地时间和格林威治的时间差，单位为分钟
    var time = timestamp + offset_GMT * 60 * 1000 + timezone * 60 * 60 * 1000
    return time
}

async function wechaty2chatdev(message) {
    let curTime = getCurTime()
    let timeHms = moment(curTime).format("YYYY-MM-DD HH:mm:ss")

    let msg = {
        "reqId": v4(),
        "method": "thing.event.post",
        "version": "1.0",
        "timestamp": curTime,
        "events": {
        }
    }

    const talker = message.talker()

    let text = ''
    let messageType = ''
    let textBox = {}
    let file = ''
    let msgId = message.id

    switch (message.type()) {
        // 文本消息
        case Message.Type.Text:
            messageType = 'Text'
            text = message.text()
            break;

        // 图片消息
        case Message.Type.Image:
            messageType = 'Image'
            file = await message.toImage().artwork()
            break;

        // 链接卡片消息
        case Message.Type.Url:
            messageType = 'Url'
            textBox = await message.toUrlLink()
            text = '链接卡片消息'
            break;

        // 小程序卡片消息
        case Message.Type.MiniProgram:
            messageType = 'MiniProgram'
            textBox = await message.toMiniProgram();
            text = '小程序卡片消息'
            /*
            miniProgram: 小程序卡片数据
            {
              appid: "wx363a...",
              description: "贝壳找房 - 真房源",
              title: "美国白宫，10室8厅9卫，99999刀/月",
              iconUrl: "http://mmbiz.qpic.cn/mmbiz_png/.../640?wx_fmt=png&wxfrom=200",
              pagePath: "pages/home/home.html...",
              shareId: "0_wx363afd5a1384b770_..._1615104758_0",
              thumbKey: "84db921169862291...",
              thumbUrl: "3051020100044a304802010002046296f57502033d14...",
              username: "gh_8a51...@app"
            }
           */
            break;

        // 语音消息
        case Message.Type.Audio:
            messageType = 'Audio'
            file = await message.toFileBox()
            break;

        // 视频消息
        case Message.Type.Video:
            messageType = 'Video'
            file = await message.toFileBox();
            break;

        // 动图表情消息
        case Message.Type.Emoticon:
            messageType = 'Emoticon'
            file = await message.toFileBox();
            break;

        // 文件消息
        case Message.Type.Attachment:
            messageType = 'Attachment'
            file = await message.toFileBox()
            break;

        case Message.Type.Contact:
            messageType = 'Contact'
            textBox = await message.toContact()
            text = '联系人卡片消息'
            break;

        // 其他消息
        default:
            messageType = 'Unknown'
            text = '未知的消息类型'
            break;
    }

    if (file) {
        text = file.name
    }

    console.debug('textBox:', textBox)

    let room = message.room()
    let roomInfo = {}
    if (room && room.id) {
        roomInfo.id = room.id
        roomInfo.avatar = room.avatar()
        roomInfo.ownerId = room.owner()
        try {
            roomInfo.topic = await room.topic()
        } catch (err) {
            roomInfo.topic = await room.topic()
        }
    }

    let memberAlias = ''
    try {
        memberAlias = await room.alias(talker)
    } catch (err) {

    }

    let avatar = ''
    try {
        avatar = await contact.avatar()
    } catch (err) {

    }

    let content = {}
    content.messageType = messageType
    content.text = text
    content.raw = textBox

    let _payload = {
        "id": msgId,
        "talker": {
            "id": talker.id,
            "gender": talker.gender() || '',
            "name": talker.name() || '',
            "alias": talker.alias() || '',
            "memberAlias": memberAlias,
            "avatar": avatar
        },
        "room": roomInfo,
        "content": content,
        "timestamp": curTime,
        "timeHms": timeHms
    }

    msg.events.message = _payload
    msg = JSON.stringify(msg)

    return msg

}


function propertyMessage(name, info) {
    let message = {
        "reqId": v4(),
        "method": "thing.property.post",
        "version": "1.0",
        "timestamp": new Date().getTime(),
        "properties": {
        }
    }
    message.properties[name] = info
    message = JSON.stringify(message)
    return message
}

function eventMessage(name, info) {
    let message = {
        "reqId": v4(),
        "method": "thing.event.post",
        "version": "1.0",
        "timestamp": new Date().getTime(),
        "events": {
        }
    }
    message.events[name] = info
    message = JSON.stringify(message)
    return message
}

export { wechaty2chatdev }
export default wechaty2chatdev