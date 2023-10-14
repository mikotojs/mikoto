import { isArray, isError, isObject } from '@mikotojs/is'
import pino from 'pino'
import type { LevelType } from './types'

export interface LoggerOptions {
  pushLevel?: LevelType | boolean
  consoleLevel?: LevelType | boolean
  fileLevel?: LevelType | boolean
  useEmoji?: boolean
  useDate?: boolean
  fileSplit?: 'day' | 'month'
}

export function createLogger(_options: LoggerOptions) {
  const logger = pino({
    transport: {
      targets: [
        {
          target: './ws-transport.ts',
          level: 'trace',
          options: {},
        },
        {
          target: 'pino-pretty',
          options: {},
          level: 'trace',
        },
      ],
    },
  })

  const handleOptionalParams = (message?: any, ...optionalParams: any[]) => {
    const toString = (msg: any) => isObject(msg) || isArray(msg) ? JSON.stringify(msg) : msg
    message = toString(message)
    return optionalParams
      ? optionalParams.reduce(
        (msg, param) => `${msg} ${toString(param)}`,
        message || '',
      )
      : message
  }

  const log = (level: LevelType, ...optionalParams: any[]) => {
    logger[level](handleOptionalParams(...optionalParams))
  }

  const logWrap = (level: LevelType) => (message?: any, ...optionalParams: any[]) =>
    log(level, message, ...optionalParams)

  /**
   * @description 最后一项的为错误时会被特殊处理
   */
  const error = (...optionalParams: any[]) => {
    const error = optionalParams?.at(-1)
    if (!error || !isError(error)) {
      log('error', ...optionalParams)
      return
    }
    if (Reflect.has(error, 'message')) {
      log('error', `[${error.message}]`, ...optionalParams)
    }
    if (Reflect.has(error, 'stack')) {
      log('trace', error.stack)
    }
    if (Reflect.has(error, 'cause')) {
      log('debug', error.cause)
    }
    if (Reflect.has(error, 'response')) {
      // @ts-expect-error
      log('trace', error.response)
    }
  }

  return {
    logger,
    info: logWrap('info'),
    warn: logWrap('warn'),
    verbose: logWrap('info'),
    debug: logWrap('debug'),
    error,
    trace: logWrap('trace'),
  }
}
