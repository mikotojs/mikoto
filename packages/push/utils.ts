/**
 * 给昵称添加 ** （目的是变简短）
 */
export function conciseNickname(nickname = '') {
  const length = nickname.length
  if (length <= 3) {
    return nickname
  }
  const firstWord = nickname[0]
  const lastWord = nickname[length - 1]
  return `${firstWord}**${lastWord}`
}
