import { isArray, isNumber, isObject } from '@mikotojs/is'
import * as crypto from 'node:crypto'

/**
 * 对象值转换为字符串
 */
function objectValueToString(params: Record<string, any>) {
  Object.keys(params).forEach((key) => {
    if (isNumber(params[key])) {
      params[key] = params[key].toString()
      return
    }
    if (isObject(params[key])) {
      objectValueToString(params[key])
      return
    }
    if (isArray(params[key])) {
      params[key] = params[key].map(item => isObject(item) ? objectValueToString(item) : item.toString())
    }
  })
  return params
}

export function clientSign(params: Record<string, any>) {
  let data = JSON.stringify(objectValueToString(params))
  for (const a of ['SHA512', 'SHA3-512', 'SHA384', 'SHA3-384', 'BLAKE2b512']) {
    data = crypto.createHash(a).update(data).digest('hex')
  }
  return data
}
