/**
 * form https://github.com/dd178/BILI_judgement/blob/master/judgement.py
 */
import type { JuryCaseOpinion, LoggerOptions } from '@mikotojs/core'
import { CookieJar, createLogger, getRandomItem, sleep, useJuryApi } from '@mikotojs/core'
import { JuryVote, JuryVoteResult, VoteResCode } from './jury.emum'

export interface Config {
  // 重复运行次数，小于0为无限制
  repeat: number
  // 默认投票 0-3 好-无法判断，从中随机
  vote: number[]
  // 是否采用参考投票
  opinion: boolean
  // 参考投票最少人数
  opinionMin: number
  // 排除投票 0-3 好-无法判断，用于配合参考投票，不影响【默认投票】配置
  notOpinion: number[]
  // 没有案件后的等待时间（分）
  waitTime: number
  // insiders 参考值
  insiderWeight: number
  // 是否观看视频 0 不观看，1 观看
  insiders: number[]
  // 是否匿名 0 不匿名，1 匿名
  anonymous: number[]
  // 云函数下使用新的触发器进行休眠
  newTrigger: boolean
  // 异步，非云函数下使用。不支持推送结果
  async: boolean
}

export function jury(cookie: string, config: Config, loggerOptions: LoggerOptions = {}) {
  const logger = createLogger(loggerOptions)
  const cookieJar = new CookieJar(cookie)
  const csrf = cookieJar.getCookieItemRef('bili_jct')
  if (!csrf) {
    logger.error('cookie 缺少 bili_jct 字段')
    return
  }
  const juryApi = useJuryApi({
    cookieJar,
  }, { csrf })

  /**
   * 给案件投票
   */
  function voteCase(
    caseId: string,
    vote: number,
  ) {
    return juryApi.juryCaseVote(
      caseId,
      vote,
      getRandomItem(config.insiders),
      getRandomItem(config.anonymous),
    )
  }

  /**
   * 获取最多观点
   */
  function getMoreOpinion(caseId: string, opinions: JuryCaseOpinion[]) {
    const opinionStatistics: Record<string, number> = {}
    const { insiderWeight = 1 } = config
    for (const opinion of opinions) {
      if (Reflect.has(opinionStatistics, opinion.vote)) {
        opinion.insiders
          ? opinionStatistics[opinion.vote]++
          : (opinionStatistics[opinion.vote] += insiderWeight)
        continue
      }
      opinionStatistics[opinion.vote] = 1
    }
    const maxValue = Math.max(...Object.values(opinionStatistics))
    const maxKey = +Object.keys(opinionStatistics).find(key => opinionStatistics[key] === maxValue)!
    if (maxValue < config.opinionMin) {
      return
    }
    logger.debug(
      `【${caseId}】的观点分布（观点id: 投票人数）${JSON.stringify(opinionStatistics)}`,
    )
    return opinions.find(opinion => opinion.vote === maxKey)
  }

  /**
   * 观点投票
   */
  async function voteJuryByOpinion(caseId: string) {
    try {
      const { data: { list } } = await juryApi.getJuryCaseViewpoint(caseId)
      if (!list || !list.length) {
        return JuryVoteResult.NO_OPINION
      }

      const opinion = getMoreOpinion(caseId, list)
      if (!opinion) {
        return JuryVoteResult.FEW_OPINION
      }
      if (config.notOpinion.includes(vote2Option(opinion.vote))) {
        logger.debug(`配置已经排除掉${JuryVote[opinion.vote]}，转为默认投票`)
        return JuryVoteResult.被排除
      }

      const vote = opinion.vote
      logger.verbose(`为【${caseId}】选择了【${JuryVote[vote]}】（${vote}）`)
      await caseConfirm(caseId)

      const { code, message } = await voteCase(caseId, vote)
      if (code !== 0) {
        logger.warn(`为案件【${caseId}】投票失败，【${code}】【${message}】`)
        return JuryVoteResult.ERROR
      }
      logger.info(
        `成功根据【${opinion.uname}】的观点为案件【${caseId}】投下【${JuryVote[vote]}】`,
      )
      return JuryVoteResult.SUCCESS
    } catch (error) {
      logger.error(`为案件【${caseId}】投票异常，错误信息：${error}`)
    }
    return JuryVoteResult.UNKNOWN
  }

  /**
   * 把实际投票转为配置的投票
   */
  function vote2Option(vote: number) {
    if (vote < 10) {
      return vote - 1
    }
    return vote - 11
  }

  /**
   * 默认投票
   */
  async function replenishVote(caseId: string, defaultVote: number) {
    try {
      const info = await juryApi.getJuryCase(caseId)
      if (info.code !== 0) {
        logger.error(
          `获取风纪委员案件信息失败，错误码：【${info.code}】，信息为：【${info.message}】`,
        )
        return false
      }
      const selectedVote = info.data.vote_items[defaultVote]
      await caseConfirm(caseId)
      const vote = await voteCase(caseId, selectedVote.vote)
      if (vote.code === 0) {
        logger.info(`成功根据【配置文件】为案件【${caseId}】投下【${selectedVote.vote_text}】`)
        return true
      }
      logger.warn(`为案件【${caseId}】默认投票失败，【${vote.code}】【${vote.message}】`)
      return false
    } catch (error) {
      logger.error(`风纪委员默认投票异常，错误信息：${error}`)
    }
    return false
  }

  /**
   * 确认案件
   */
  async function caseConfirm(caseId: string) {
    try {
      logger.debug(`开始案件【${caseId}】`)
      const { code, message } = await voteCase(caseId, 0)
      if (code !== 0) {
        logger.warn(`确认案件【${caseId}】失败，【${code}】【${message}】`)
        throw new Error(message)
      }
      await sleep(12222, 17777)
    } catch (error) {
      logger.error(`确认案件【${caseId}】异常，错误信息：${error.message}`)
      throw error
    }
  }

  async function runJury(err = 3) {
    const errRef = { value: err }
    while (errRef.value > 0) {
      if (await runOneJury(errRef)) {
        break
      }
      await sleep(2000, 5000)
    }
    if (errRef.value <= 0) {
      logger.error('风纪任务错误次数过多，结束任务！')
      return false
    }
  }

  /**
   * 运行一轮
   */
  async function runOneJury(errRef: Ref<number>) {
    try {
      const { code, data, message } = await juryApi.getJuryCaseVote()
      switch (code) {
        case VoteResCode.成功:
          return await handleSuccess(data, errRef)
        case VoteResCode.资格过期:
          return await handleJudgeExpired(message)
        case VoteResCode.没有新案件:
          return await handleNoNewCase(message, errRef)
        case VoteResCode.已完成:
          return await handleCaseFull(message)
        default:
          return await handleOtherError(code, message, errRef)
      }
    } catch (error) {
      logger.error(`风纪委员投票异常，错误信息：${error}`)
      errRef.value -= 1
      await sleep(5000, 10000)
    }
  }

  /**
   * 获取风纪委员案件资格已经过期
   */
  async function handleJudgeExpired(errMessage: string) {
    logger.warn(`${errMessage} 尝试申请`)
    const { code, message } = await juryApi.applyJury()
    if (code === 0) {
      logger.info('提交申请成功')
    } else {
      logger.warn(message)
    }
    // 不管是否成功，目前是无法继续投票的
    return true
  }

  /**
   * 休眠等待
   */
  async function waitFor() {
    // 减少一次重试次数
    config.repeat -= 1
    // 休眠时间
    const waitTime = config.waitTime || 20
    logger.info(`休眠 ${waitTime} 分钟后继续获取案件！`)
    await sleep(waitTime * 60000)
    return false
  }

  /**
   * 获取风纪委员案件没有新的案件
   */
  async function handleNoNewCase(message: string, errRef?: Ref<number>) {
    logger.info(`${message}`)
    if (config.repeat === 0 && errRef) {
      logger.info('不等待，直接结束任务！')
      return true
    }
    return await waitFor()
  }

  /**
   * 获取风纪委员案件案件已满
   */
  async function handleCaseFull(message: string) {
    logger.info(`${message}`)
    logger.info('风纪任务完成 √')
    return true
  }

  /**
   * 获取风纪委员案件未知错误
   */
  async function handleOtherError(code: number, message: string, errRef: Ref<number>) {
    logger.warn(`获取风纪委员案件失败，错误码：【${code}】，信息为：【${message}】`)
    if (code === VoteResCode.没有资格) {
      logger.warn('如果需要请手动申请风纪委员，对于从来没有当过的用户，我们默认你配置错误。')
      return true
    }
    errRef.value -= 1
    await sleep(20000, 40000)
    return false
  }

  async function isByOpinion(case_id: string) {
    if (config.opinion) {
      return await voteJuryByOpinion(case_id)
    }
    return JuryVoteResult.不参考
  }

  /**
   * 获取风纪委员案件成功处理
   */
  async function handleSuccess({ case_id = '' }: { case_id: string }, errRef: Ref<number>) {
    if (!case_id) {
      errRef.value -= 1
      return
    }
    const voteResult = await isByOpinion(case_id)
    if (voteResult === JuryVoteResult.SUCCESS) {
      return
    }
    if (voteResult < JuryVoteResult.SUCCESS) {
      errRef.value -= 1
      return
    }
    const suc = await replenishVote(case_id, getRandomItem(config.vote))
    if (!suc) {
      errRef.value -= 1
    }
  }

  /**
   * 开始投票
   */
  async function juryService() {
    try {
      if (!config.async) {
        return await runJury()
      }
      logger.info('进行异步投票，不支持推送结果')
      runJury().catch(err => logger.error('异步风纪任务出错：', err))
      return true
    } catch (error) {
      logger.error(`风纪任务运行异常：${error}`)
    }
  }

  return {
    juryService,
    runOneJury,
    runJury,
  }
}
