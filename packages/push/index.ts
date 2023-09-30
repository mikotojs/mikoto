import type { Method } from '@mikotojs/http'
import { useRequest } from '@mikotojs/http'
import { createLogger } from '@mikotojs/logger'

const defHttp = useRequest()
const logger = createLogger({})

export async function sendMail(email: any, title: string, text: string) {
  // 发件邮箱,密码,收件邮箱,stmp地址[,端口]
  if (!email || !email.pass || !email.from || !email.host) {
    return
  }

  const { createTransport } = await import('nodemailer')
  const port: number = Number(email.port) || 465
  const transporter = createTransport({
    host: email.host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user: email.from,
      pass: email.pass,
    },
  })

  const info = await transporter.sendMail({
    from: `${title} <${email.from}>`, // sender address
    to: email.to, // list of receivers
    subject: title, // Subject line
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
    text: text.replace(/\n/g, '\r\n'), // plain text body
    // html: text, // html body
  })

  logger.info(`邮件消息已发送: ${info.messageId}`)
}

export async function customApi(api: any, title: string, text: string) {
  try {
    if (!api || !api.url) {
      return
    }
    const { data, proxy, timeout, headers } = api
    const method: Method = (api.method.toUpperCase()
      || 'POST') as Method
    const options = {
      method,
      timeout,
      headers,
      url: '',
      data: null,
    }
    options.url = api.url
      .replace('{title}', encodeURIComponent(title))
      .replace('{text}', encodeURIComponent(text))
    if (proxy.host) {
      const tunnel = await import('tunnel')
      const httpsAgent = tunnel.httpsOverHttp({
        proxy: {
          host: proxy.host,
          port: +proxy.port,
          proxyAuth: proxy.auth,
        },
        maxSockets: 1, // 单个代理最大连接数
      })
      Object.assign(options, { httpsAgent })
    }
    // 处理data
    if (Object.keys(data).length) {
      const str = JSON.stringify(data)
        .replace(/{title}/g, title)
        .replace(/{text}/g, text)
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
      options.data = JSON.parse(str)
    }
    await defHttp.request(options)
    logger.info('自定义接口消息已发送！')
  } catch (error) {
    logger.info(`自定义接口消息发送失败: ${error}`)
    logger.error(error)
  }
}
