import { getPRCDate, getUnixTime } from '@mikotojs/utils'

export * from './biliUri'
export * from './cookieJar'
export * from './httpEnum'
export type * from './types'

export class Time {
  static get now() {
    return getUnixTime()
  }

  static get PRC() {
    return getPRCDate()
  }
}
