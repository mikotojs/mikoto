import { isArray, isObject } from '@mikotojs/is'
import { Buffer } from 'node:buffer'
import * as crypto from 'node:crypto'

export * from './cookie'
export * from './time'

/**
 * 生成一个 UUID
 */
export function createUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (t) => {
    const e = crypto.randomBytes(1)[0] % 16
    return (t === 'x' ? e : (3 & e) | 8).toString(16)
  })
}

/**
 * 将 JSONP 返回的数据转换为对象e
 */
export function jsonp2Object(jsonp: string) {
  const jsonpData = jsonp.replace(/^\w+\(/, '').replace(/\)$/, '')
  return JSON.parse(jsonpData)
}

/**
 * 一页有 n 条数据，第 m 个数据在第几页
 * @param n 每页数据条数
 * @param m 第几条数据
 */
export function getPageNum(n: number, m: number) {
  return Math.ceil(m / n)
}

/**
 * 安全的随机数
 * @description 我不需要安全，但是它总是给 Math.random 一个警告
 */
export function safeRandom() {
  return crypto.randomBytes(4).readUInt32LE() / 0xFFFFFFFF
}

export function random(floating?: boolean): number
export function random(lower: number, floating?: boolean): number
export function random(
  lower: number,
  upper: number,
  floating?: boolean,
): number
/**
 * 生成随机数
 * @description 生成一个随机数，范围在 min 和 max 之间（包括 min 和 max）
 * @param lower
 * @param upper
 * @param floating
 */
export function random(
  lower?: number | boolean,
  upper?: number | boolean,
  floating?: boolean,
) {
  if (floating === undefined) {
    if (typeof upper === 'boolean') {
      floating = upper
      upper = undefined
    } else if (typeof lower === 'boolean') {
      floating = lower
      lower = undefined
    }
  }
  if (lower === undefined && upper === undefined) {
    lower = 0
    upper = 1
  } else if (upper === undefined) {
    upper = lower
    lower = 0
  }
  lower = Number(lower)
  upper = Number(upper)
  if (lower > upper) {
    const temp = lower
    lower = upper
    upper = temp
  }
  if (floating || lower % 1 || upper % 1) {
    const rand = safeRandom()
    return Math.min(
      lower
        + rand * (upper - lower + Number.parseFloat(`1e-${(`${rand}`).length - 1}`)),
      upper,
    )
  }
  return lower + Math.floor(safeRandom() * (upper - lower + 1))
}

/**
 * 随机字符串
 * @param length
 * @param lower
 */
export function randomString(length: number, lower?: boolean) {
  const chars = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += getRandomItem(chars)
  }
  if (lower) {
    return result.toLowerCase()
  }
  return result
}

/**
 * 不存在于数组就添加它
 * @param array
 * @param item
 */
export function pushIfNotExist<T = unknown>(array: T[], ...item: T[]) {
  item.forEach((i) => {
    if (!array.includes(i)) {
      array.push(i)
    }
  })
}

/**
 * 生成新对象，即使原对象是 undefined，获取属性也不会报错
 * @param object 值
 */
export function getNewObject<T = unknown>(object: T): T {
  return object || ({} as T)
}

/**
 * 克隆对象
 * @param object
 * @param deep
 */
export function cloneObject<T = unknown>(object: T, deep = false): T {
  if (!isObject(object)) {
    return object
  }
  if (Array.isArray(object)) {
    return object.map(item => cloneObject(item, deep)) as unknown as T
  }
  if (deep) {
    return Object.keys(object).reduce((result, key) => {
      result[key] = cloneObject(object[key], deep)
      return result
    }, {} as T)
  }
  return Object.assign({}, object)
}

/**
 * 深度合并对象
 * @param target
 * @param source
 */
export function deepMergeObject<T = unknown>(target: T, source: any): T {
  // 忽略 undefined
  if (target === undefined || source === undefined) {
    return (target || source) as T
  }
  if (!isObject(target) || !isObject(source)) {
    return source as T
  }
  if (Array.isArray(target) && Array.isArray(source)) {
    return target.concat(source) as unknown as T
  }
  return Object.keys(source).reduce((result, key) => {
    result[key] = deepMergeObject(target[key], source[key])
    return result
  }, target)
}

/**
 * 为对象设置属性，将 source 中的属性设置到 target 中，如果 target 中已经存在，则不设置（且深度合并）
 * @param target
 * @param source
 */
export function deepSetObject<T = unknown>(target: T, source: any): T {
  // 忽略 undefined
  if (target === undefined || source === undefined) {
    return (target || source) as T
  }
  if (!isObject(target) || !isObject(source)) {
    return source as T
  }
  if (Array.isArray(target) && Array.isArray(source)) {
    return target.concat(source) as unknown as T
  }
  return Object.keys(source).reduce((result, key) => {
    if (result[key] === undefined) {
      result[key] = source[key]
    } else if (isObject(result[key]) && isObject(source[key])) {
      result[key] = deepSetObject(result[key], source[key])
    }
    return result
  }, target)
}

/**
 *  stringify
 * @param entries
 */
export function stringify(
  entries: Record<string, any> | [string, any][],
): string {
  if (!isObject(entries) && !isArray(entries)) {
    return entries
  }
  const searchParams = new URLSearchParams()
  if (!Array.isArray(entries)) {
    entries = Object.entries(entries)
  }
  entries.forEach(([key, value]) => {
    if (isObject(value)) {
      searchParams.append(key, JSON.stringify(value))
      return
    }
    searchParams.append(key, String(value))
  })
  return searchParams.toString()
}

/**
 * 获取数组或者字符串中的随机一个
 * @param indexable
 */
export function getRandomItem<T extends Array<any> | string>(
  indexable: T,
): T extends Array<infer U> ? U : string {
  return indexable[random(indexable.length - 1)]
}

/**
 * md5 hash
 * @param str
 * @param uppercase
 */
export function md5(str: string, uppercase = false) {
  const hash = crypto.createHash('md5')
  hash.update(str)
  return uppercase ? hash.digest('hex').toUpperCase() : hash.digest('hex')
}

/**
 * 合并 Header
 * @description 合并 Header，如果有相同的 key，则后面的覆盖前面的，自动处理 key 大小写
 * @param headers
 * @param headersToMerge
 */
export function mergeHeaders(
  headers: Record<string, any> = {},
  headersToMerge: Record<string, any> = {},
) {
  function toLowerCase(object: Record<string, any>) {
    return Object.keys(object).reduce((result, key) => {
      result[key.toLowerCase()] = object[key]
      return result
    }, {})
  }
  return Object.assign({}, toLowerCase(headers), toLowerCase(headersToMerge))
}

/**
 * 字符串数组转数字数组
 * @param strArr 字符串数组
 */
export function arr2numArr(strArr: string[] | number[]) {
  return (
    strArr
    && strArr
      .map((str: any) => Number(str))
      .filter(num => num > 0 && num % 1 === 0)
  )
}

/**
 * base64 编码
 * @param str
 */
export function base64Encode(str: string) {
  return Buffer.from(str).toString('base64')
}

/**
 * base64 解码
 */
export function base64Decode(str: string) {
  return Buffer.from(str, 'base64').toString()
}

/**
 * 对象数组去重 （保留第一个）
 * @param arr 对象数组
 * @param key 去重的 key
 */
export function uniqueObjectArray<T>(arr: T[], key: string) {
  return arr.filter((item, index, self) => {
    return self.findIndex(i => i[key] === item[key]) === index
  })
}

export function sleep(delay: number, delay2?: number) {
  const time = delay2 ? random(delay, delay2) : delay
  return new Promise<number>((resolve) => {
    setTimeout(() => {
      resolve(time)
    }, time)
  })
}

export function sleepSync(delay: number, delay2?: number) {
  const time = delay2 ? random(delay, delay2) : delay
  const now = Date.now()
  while (Date.now() - now < time) {
    // empty
  }
}

/**
 * 数组合并同类项（会影响原数组）
 * @param arr 数组
 * @param key 合并的 key
 * @param deep 是否深拷贝
 * @param direction 合并的方向，默认为合并到前面
 */
export function mergeArray<T extends Record<string, any>>(
  arr: T[],
  key: string,
  deep = false,
  direction: 'right' | 'left' = 'left',
) {
  const reduceKey = direction === 'right' ? 'reduceRight' : 'reduce'
  const mergeFunc = deep ? deepMergeObject : Object.assign
  return arr[reduceKey]((result, item) => {
    const index = result.findIndex(i => i[key] === item[key])
    if (index > -1) {
      result[index] = mergeFunc(result[index], item)
    } else {
      result.push(item)
    }
    return result
  }, [] as T[])
}

/**
 * 只会运行一次的函数
 */
export async function getOnceFunc(cb: (...args: any[]) => any) {
  let flag = true
  return async (...args: any[]) => {
    if (flag) {
      await cb(...args)
      flag = false
    }
  }
}

/**
 * 补足位数
 */
export function pad(num: string, length = 8, char = '0') {
  return num.padStart(length, char)
}

/**
 * 进制转换
 * @param num 要转换的数字字符串
 * @param fromRadix 要转换的进制
 * @param toRadix 转换后的进制
 */
export function radixConvert(
  num: string | number,
  fromRadix: number,
  toRadix: number,
) {
  return Number.parseInt(`${num}`, fromRadix).toString(toRadix)
}

/**
 * 对象值转换为字符串
 */
export function objectValueToString<T extends Record<string, any>>(params: T): T {
  const searchParams = new URLSearchParams(params)
  const result = {}
  for (const [key, value] of searchParams.entries()) {
    result[key] = value
  }
  return result as T
}
