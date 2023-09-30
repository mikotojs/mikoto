import winston from 'winston'
import { emojis } from './emojis'

function formatTime(date: Date, hasDate = true) {
  // 月-日 时:分:秒
  if (hasDate) {
    return date.toLocaleString('zh-CN', { hour12: false, timeZone: 'Asia/Shanghai' })
  }
  // 时:分:秒
  return date
    .toLocaleString('zh-CN', {
      hour12: false,
      timeZone: 'Asia/Shanghai',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    .replace(/^24/, '00')
}

export function formatTimestamp(hasDate = false) {
  return winston.format.timestamp({
    format: () => formatTime(new Date(), hasDate),
  })
}

export function formatPrintf(hasEmojis = true) {
  return winston.format.printf(({ message, timestamp, level }) => {
    return `\u005B${hasEmojis ? emojis[level] : level} ${timestamp}\u005D ${message}`
  })
}
