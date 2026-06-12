export const roleMap = {
  Brawler: 'Боец',
  Juggernaut: 'Джаггернаут',
  Sniper: 'Снайпер',
  Striker: 'Застрельщик',
  Skirmisher: 'Ударная',
  Scout: 'Разведчик',
  'Missile Boat': 'Ракетоносец',
  'Fire Support': 'Огневая поддержка',
  'Fast Attack': 'Быстрая атака',
  Interceptor: 'Перехватчик',
  'Aerospace Fighter': 'Скоростной истребитель',
  Fighter: 'Истребитель',
  Transport: 'Транспорт',
  Attack: 'Штурмовик',
  None: 'Нет',
  '': 'Нет',
}

export function translateRole(role) {
  if (!role) return '—'
  const normalized = role.trim()
  return roleMap[normalized] || normalized
}
