/**
 * wbi 签名
 * https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/misc/sign/wbi.md#JavaScript
 */
import { getUnixTime, md5 } from '@mikotojs/utils'

function getMixinKey(orig: string) {
  return [46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12,
    38, 41, 13].reduce((acc, cur) => acc + orig[cur], '')
}

export function encWbi(
  params: Record<string, any>,
  imgKey: string,
  subKey: string,
) {
  const searchParams = new URLSearchParams({ ...params, wts: getUnixTime().toString() })
  searchParams.sort()
  const queryString = searchParams.toString()

  return `${queryString}&w_rid=${
    md5(
      queryString + getMixinKey(imgKey + subKey),
    )
  }`
}
