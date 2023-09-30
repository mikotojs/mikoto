import { useRequest, type VGotOptions } from '@mikotojs/http'
import { type ApiBaseProp, OriginURLs, RefererURLs } from '@mikotojs/shared'
import type { JuryCaseInfoDto, JuryCaseNextDto, JuryCaseOpinionDto, JuryInfoDto, JuryVotedCaseDto } from './jury.dto'

function getCaseDetailHeader(case_id: string) {
  return {
    Origin: OriginURLs.www,
    Referer: `${RefererURLs.judge}case-detail/${case_id}`,
  }
}

interface Options {
  csrf: Ref<string>
}

export function useJuryApi(vGotoptions: VGotOptions, { csrf }: Options) {
  const request = useRequest({
    prefixUrl: 'https://api.bilibili.com',
    ...vGotoptions,
  })

  /**
   * 获取当前账户风纪委员状态
   */
  function getJury() {
    return request.get<JuryInfoDto>('x/credit/v2/jury/jury', {
      headers: {
        Origin: OriginURLs.www,
        Referer: RefererURLs.judge,
      },
    })
  }

  /**
   * 申请风纪委员资格
   */
  function applyJury() {
    return request.post<ApiBaseProp>(
      'x/credit/v2/jury/apply',
      {
        csrf: csrf.value,
      },
      {
        headers: {
          Origin: OriginURLs.www,
        },
      },
    )
  }

  /**
   * 获取风纪委员案件信息
   */
  function getJuryCase(case_id: string) {
    return request.get<JuryCaseInfoDto>(`x/credit/v2/jury/case/info?case_id=${case_id}`, {
      headers: getCaseDetailHeader(case_id),
    })
  }

  /**
   * 拉取一个案件用于风纪委员投票
   */
  function getJuryCaseVote() {
    return request.get<JuryCaseNextDto>(`x/credit/v2/jury/case/next?csrf=${csrf.value}`, {
      headers: {
        Origin: OriginURLs.www,
        Referer: `${RefererURLs.judge}index`,
      },
    })
  }

  /**
   * 获取风纪委员案件众议观点
   */
  function getJuryCaseViewpoint(case_id: string) {
    return request.get<JuryCaseOpinionDto>(
      `x/credit/v2/jury/case/opinion?case_id=${case_id}&pn=1&ps=20`,
      {
        headers: getCaseDetailHeader(case_id),
      },
    )
  }

  /**
   * 风纪委员案件投票
   */
  function juryCaseVote(case_id: string, vote: number, insiders = 0, anonymous = 0) {
    return request.post<ApiBaseProp<undefined>>(
      'x/credit/v2/jury/vote',
      {
        case_id,
        vote,
        csrf: csrf.value,
        insiders,
        anonymous,
      },
      {
        headers: getCaseDetailHeader(case_id),
      },
    )
  }

  /**
   * 获取最近20条已投票案件
   */
  function getJuryCaseList() {
    return request.get<JuryVotedCaseDto>('x/credit/v2/jury/case/list?pn=1&ps=20', {
      headers: {
        Origin: OriginURLs.www,
        Referer: `${RefererURLs.judge}index`,
      },
    })
  }

  return {
    getJury,
    getJuryCase,
    getJuryCaseList,
    getJuryCaseViewpoint,
    getJuryCaseVote,
    juryCaseVote,
    applyJury,
  }
}
