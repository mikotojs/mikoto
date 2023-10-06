export function getDefaultConfig() {
  return {
    /** 重复运行次数，小于0为无限制 */
    repeat: 999,
    /** 默认投票 0-3 好-无法判断，从中随机 */
    vote: [0, 0, 1],
    /** 是否采用参考投票 */
    opinion: true,
    /** 参考投票最少人数 */
    opinionMin: 3,
    /** 排除投票 0-3 好-无法判断，用于配合参考投票，不影响【默认投票】配置 */
    notOpinion: [3],
    /** 没有案件后的等待时间（分） */
    waitTime: 20,
    /** insiders 参考值 */
    insiderWeight: 0.8,
    /** 是否观看视频 0 不观看，1 观看 */
    insiders: [0, 1],
    /** 是否匿名 0 不匿名，1 匿名 */
    anonymous: [0, 1],
    /** 云函数下使用新的触发器进行休眠 */
    newTrigger: true,
    /** 异步，非云函数下使用。不支持推送结果 */
    async: false,
  }
}

export type Config = ReturnType<typeof getDefaultConfig>

export function getConfig(config: RecursivePartial<Config>): Config {
  return {
    ...getDefaultConfig(),
    ...config,
  } as Config
}
