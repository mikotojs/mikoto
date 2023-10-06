import { Bilicomic } from '@catlair/bilicomic-dataflow'
import type { SeasonInfoDto } from '@mikotojs/core'
import { CookieJar, createLogger, random, sleep, useMangaApi } from '@mikotojs/core'

export function manga(cookie: string) {
  const logger = createLogger({})
  const cookieJar = new CookieJar(cookie)
  const mangaApi = useMangaApi({
    cookieJar,
  })

  /**
   * 每日漫画阅读
   */
  async function readMangaService(userId: number | string) {
    logger.debug('开始每日阅读')
    try {
      const { code, data, msg } = await mangaApi.getSeasonInfo()
      if (code !== 0) {
        logger.error(`[${code}]`, msg)
        return
      }
      const needReadManga = await getNeedReadManga(data)
      for (const { user_read_min, read_min, id, title } of needReadManga) {
        logger.debug(`开始阅读漫画：${id}[${title}]`)
        await readManga(userId, id, read_min - user_read_min)
      }
      logger.info('每日阅读结束')
    } catch (error) {
      logger.error('每日漫画阅读任务', error)
    }
  }

  async function readManga(userId: number | string, comicId: number, needTime: number) {
    const { ep_list } = (await getMangaEpList(comicId)) || {}
    const bilicomic = new Bilicomic(
      userId,
      comicId,
      ep_list ? ep_list[0].id : random(1, 1000),
    )
    try {
      await bilicomic.read(needTime * 2 + 2)
      await sleep(1000)
    } catch {}
    await sleep(5000)
  }

  /**
   * 获取漫画章节
   */
  async function getMangaEpList(comic_id: number) {
    try {
      const { code, msg, data } = await mangaApi.getMangaDetail(comic_id)
      if (code !== 0) {
        logger.error('获取漫画详情', code, msg)
        return
      }
      if (!data || !data.ep_list) {
        return
      }

      const { disable_coupon_amount, ep_list, title } = data
      // 去掉没有漫读券的章节
      return {
        title,
        ep_list: disable_coupon_amount ? ep_list.slice(disable_coupon_amount) : ep_list,
      }
    } catch (error) {
      logger.error('获取漫画详情', error)
    }
  }

  return {
    readMangaService,
  }
}

/**
 * 获取需要阅读的漫画
 */
async function getNeedReadManga(seasonInfo: SeasonInfoDto['data']) {
  const bookTask = seasonInfo?.day_task?.book_task || []
  return bookTask.filter(task => task.user_read_min < 5)
}
