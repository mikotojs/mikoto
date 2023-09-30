import { isString } from '@mikotojs/is'

export function getCookieJSON(cookie: string) {
  if (!cookie) {
    return {}
  }
  const matchArray = cookie.match(/([^;=]+)(?:=([^;]*))?/g)
  if (!matchArray) {
    return {}
  }
  return matchArray.reduce((pre, cur) => {
    const [key, value] = cur.trim().split('=')
    pre[key] = value
    return pre
  }, {})
}

export function getSetCookieValue(setCookieArray) {
  let cookieStr = ''
  setCookieArray.forEach(setCookie => cookieStr += `${setCookie.split('; ')[0]}; `)
  if (cookieStr.endsWith('; ')) {
    cookieStr = cookieStr.substring(0, cookieStr.length - 2 || 0)
  }
  return cookieStr
}

function getCookieString(obj: Record<string, any>) {
  const string = Object.keys(obj).reduce((pre, cur) => `${pre}${cur}=${obj[cur]}; `, '')
  return string.substring(0, string.length - 2 || 0)
}

export function getCookie(cookie = '', setCookie: string | string[]) {
  if (isString(setCookie)) {
    setCookie = [setCookie]
  }
  if (!setCookie || setCookie.length === 0) {
    return cookie
  }
  return getCookieString({
    ...getCookieJSON(cookie),
    ...getCookieJSON(getSetCookieValue(setCookie)),
  })
}

export function getCookieItem(cookie: string, key: string) {
  if (!cookie) {
    return ''
  }
  const reg = `(?:^| )${key}=([^;]*)(?:;|$)`
  const r = cookie.match(reg)
  return r ? r[1] : ''
}
