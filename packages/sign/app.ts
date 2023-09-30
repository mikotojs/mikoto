import { getUnixTime, md5 } from '@mikotojs/utils'

type Params = Record<string, any>

/**
 * API 接口签名
 * @param params
 * @param appkey
 * @param appsec
 */
export function appSignString(
  params: Params = {},
  appkey?: string,
  appsec?: string,
) {
  return getAppSign(params, appkey, appsec).query
}

export function getSign(params: Params, appsec: string, noSign = false) {
  const searchParams = new URLSearchParams(params)
  searchParams.sort()
  const query = searchParams.toString()

  if (noSign) {
    return { query, sign: '' }
  }

  const sign = md5(query + appsec)
  return {
    query: `${query}&sign=${sign}`,
    sign,
  }
}

function getAppSign(
  params: Params,
  appkey = '1d8b6e7d45233436',
  appsec = '560c52ccd288fed045859ed18bffd973',
) {
  params = {
    platform: 'android',
    mobi_app: 'android',
    device: 'android',
    disable_rcmd: 0,
    channel: 'xiaomi',
    c_locale: 'zh_CN',
    s_locale: 'zh_CN',
    ts: getUnixTime(),
    ...params,
  }
  if (!params.access_key) {
    return getSign(params, appsec, true)
  }
  delete params.csrf
  delete params.csrf_token
  params = {
    ...params,
    actionKey: 'appkey',
    appkey,
  }
  return getSign(params, appsec)
}
