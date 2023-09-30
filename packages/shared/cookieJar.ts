import { getCookie, getCookieItem, getCookieJSON } from '@mikotojs/utils'

export class CookieJar {
  public cookie: string
  private refMap: Map<string, string> = new Map()
  constructor(cookie: string) {
    if (cookie) {
      this.cookie = cookie
    }
  }

  async getCookieString() {
    return this.cookie
  }

  async setCookie(rawCookie: string) {
    this.cookie = getCookie(this.cookie, rawCookie)
    this.refMap.forEach((key, _, map) => {
      const value = this.getCookieItem(key)
      if (value) {
        return map.delete(key)
      }
      map.set(key, this.getCookieItem(value))
    })
  }

  toJSON() {
    return getCookieJSON(this.cookie)
  }

  getCookieItem(key: string) {
    return getCookieItem(this.cookie, key)
  }

  getCookieItemRef(key: string): Ref<string> | null {
    if (!this.refMap.has(key)) {
      const value = this.getCookieItem(key)
      if (value) {
        return null
      }
      this.refMap.set(key, value)
    }
    return {
      value: this.refMap.get(key)!,
    }
  }
}
