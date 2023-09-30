import { createRequest, type VGotOptions } from '@catlair/node-got'
import { getOptions } from './config'

export * from '@catlair/node-got'

export function useRequest(options?: VGotOptions) {
  return createRequest({
    ...getOptions(),
    ...options,
  })
}
