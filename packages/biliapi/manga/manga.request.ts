import { useRequest, type VGotOptions } from '@mikotojs/http'
import type { OnlyMsg } from '@mikotojs/shared'
import type {
  BuyInfoDto,
  ClockInDto,
  CouponDto,
  FavoriteManga,
  MangaDetailDto,
  MangaPointShopDto,
  SearchMangaDto,
  SeasonInfoDto,
  ShareComicDto,
  TakeSeasonGiftDto,
  WalletDto,
} from './manga.dto'

export function useMangaApi(vGotoptions: VGotOptions) {
  const MANGA_DATA = {
    is_teenager: 0,
    no_recommend: 0,
    mobi_app: 'android_comic',
    platform: 'android',
    channel: 'bilicomic',
  }

  const mangaApi = useRequest({
    prefixUrl: 'https://manga.bilibili.com',
    ...vGotoptions,
  })

  /**
   * 漫画签到
   * @param platform 平台
   */
  function clockIn(platform = 'android'): Promise<ClockInDto> {
    return mangaApi.post('twirp/activity.v1.Activity/ClockIn', {
      platform,
    })
  }

  /**
   * 获取背包
   */
  function getWallet() {
    return mangaApi.post<WalletDto>('twirp/user.v1.User/GetWallet?platform=web')
  }

  /**
   * 追漫列表
   */
  function getFavoriteList(page_num = 1, page_size = 50, order = 1) {
    return mangaApi.post<FavoriteManga>('twirp/bookshelf.v1.Bookshelf/ListFavorite?platform=web', {
      page_num,
      page_size,
      order,
      wait_free: 0,
    })
  }

  /**
   * 获取账户中的漫读券信息
   */
  function getCoupons(page_num = 1, page_size = 50) {
    return mangaApi.post<CouponDto>('twirp/user.v1.User/GetCoupons?platform=web', {
      not_expired: true,
      page_num,
      page_size,
      tab_type: 1,
    })
  }

  /**
   * 获取漫画详情
   */
  function getMangaDetail(comic_id: number) {
    return mangaApi.post<MangaDetailDto>('twirp/comic.v1.Comic/ComicDetail', {
      device: 'android',
      version: '4.16.0',
      comic_id,
    })
  }

  /**
   * 获取购买信息
   */
  function getBuyInfo(ep_id: number) {
    return mangaApi.post<BuyInfoDto>('twirp/comic.v1.Comic/GetEpisodeBuyInfo?platform=web', {
      ep_id,
    })
  }

  /**
   * 购买漫画
   */
  function buyManga(
    ep_id: number,
    coupon_id: number,
    buy_method = 2,
    auto_pay_gold_status = 0,
  ) {
    return mangaApi.post<OnlyMsg>('twirp/comic.v1.Comic/BuyEpisode?&platform=web', {
      buy_method,
      ep_id,
      coupon_id,
      auto_pay_gold_status,
    })
  }

  /**
   * 搜索漫画
   */
  function searchManga(keyword: string, page_num = 1, page_size = 9) {
    return mangaApi.post<SearchMangaDto>('twirp/comic.v1.Comic/Search?device=pc&platform=web', {
      keyword,
      page_num,
      page_size,
    })
  }

  /**
   * 领取大会员权益
   */
  function receiveMangaVipPrivilege() {
    return mangaApi.post<OnlyMsg>('twirp/user.v1.User/GetVipReward', { reason_id: 1 })
  }

  /**
   * 漫画积分商城列表
   */
  function getMangaPointShopList() {
    return mangaApi.post<MangaPointShopDto>('twirp/pointshop.v1.Pointshop/ListProduct')
  }

  /**
   * 领取任务奖励
   */
  function takeSeasonGift(season_id: number | string = '31') {
    return mangaApi.post<TakeSeasonGiftDto>('twirp/user.v1.Season/TakeSeasonGifts', {
      id: 0,
      is_teenager: 0,
      no_recommend: 0,
      season_id,
      take_type: 1,
      mobi_app: 'android_comic',
      ts: new Date().getTime(),
    })
  }

  /**
   * 获取赛季信息
   */
  function getSeasonInfo() {
    return mangaApi.post<SeasonInfoDto>(
      'twirp/user.v1.SeasonV2/GetSeasonInfo?platform=android&device=android&mobi_app=android_comic',
      {
        type: 1,
      },
    )
  }

  /**
   * 分享漫画
   */
  function shareComic() {
    return mangaApi.post<ShareComicDto>('twirp/activity.v1.Activity/ShareComic', {
      ...MANGA_DATA,
      ts: new Date().getTime(),
    })
  }

  return {
    shareComic,
    getSeasonInfo,
    getBuyInfo,
    getFavoriteList,
    getWallet,
    clockIn,
    getCoupons,
    getMangaDetail,
    buyManga,
    searchManga,
    receiveMangaVipPrivilege,
    getMangaPointShopList,
    takeSeasonGift,
  }
}
