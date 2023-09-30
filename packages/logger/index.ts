import { isError, isObject } from '@mikotojs/is'
import winston from 'winston'
import { formatPrintf, formatTimestamp } from './format'
import type { LevelType } from './types'

export interface LoggerOptions {
  pushLevel?: LevelType | boolean
  consoleLevel?: LevelType | boolean
  fileLevel?: LevelType | boolean
  useEmoji?: boolean
  useDate?: boolean
  fileSplit?: 'day' | 'month'
}

export function createLogger(options: LoggerOptions) {
  const logger = winston.createLogger({
    level: 'silly',
    transports: [
      new winston.transports.Console({
        format: formatPrintf(options.useEmoji),
      }),
    ],
    format: formatTimestamp(options.useDate),
  })

  const handleOptionalParams = (message?: any, ...optionalParams: any[]) => {
    return optionalParams
      ? optionalParams.reduce(
        (msg, param) => `${msg} ${isObject(param) ? JSON.stringify(param) : param}`,
        message || '',
      )
      : message
  }

  const log = (level: LevelType, ...optionalParams: any[]) => {
    logger.log({
      level,
      message: handleOptionalParams(...optionalParams),
    })
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
      log('silly', error.stack)
    }
    if (Reflect.has(error, 'cause')) {
      log('debug', error.cause)
    }
    if (Reflect.has(error, 'response')) {
      // @ts-expect-error
      log('http', error.response)
    }
  }

  return {
    logger,
    info: logWrap('info'),
    warn: logWrap('warn'),
    verbose: logWrap('verbose'),
    debug: logWrap('debug'),
    error,
    silly: logWrap('silly'),
    http: logWrap('http'),
  }
}
