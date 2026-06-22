/**
 * Утилиты для корректировки стоимости боевой единицы (ОС / PV)
 * в зависимости от значения навыка пилота/экипажа.
 *
 * Правила взяты из раздела «Корректировка ОС за счёт значения навыка».
 * НАВЫК по умолчанию = 4 (военнослужащий / регулярные войска).
 * Чем ниже значение навыка, тем лучше пилот/экипаж.
 */

export const DEFAULT_PILOT_SKILL = 4

export const PILOT_SKILL_OPTIONS = [
  { value: 7, label: '7 — Никакой подготовки' },
  { value: 6, label: '6 — Новичок' },
  { value: 5, label: '5 — Кадет' },
  { value: 4, label: '4 — Военнослужащий' },
  { value: 3, label: '3 — Опытный воин' },
  { value: 2, label: '2 — Элита армии' },
  { value: 1, label: '1 — Герой космоса' },
  { value: 0, label: '0 — Живая легенда' },
]

/**
 * Коэффициент скидки за неопытного пилота (НАВЫК ≥ 5).
 * 1 за первые 14 ОС, затем +1 за каждые следующие 10 ОС (округление вверх).
 */
export function pilotSkillDiscountCoefficient(basePv) {
  const pv = Number(basePv) || 0
  if (pv <= 14) return 1
  return 1 + Math.ceil((pv - 14) / 10)
}

/**
 * Коэффициент надбавки за опытного пилота (НАВЫК < 4).
 * 1 за первые 7 ОС, затем +1 за каждые следующие 5 ОС (округление вверх).
 */
export function pilotSkillSurchargeCoefficient(basePv) {
  const pv = Number(basePv) || 0
  if (pv <= 7) return 1
  return 1 + Math.ceil((pv - 7) / 5)
}

/**
 * Возвращает скорректированную стоимость БЕ с учётом навыка пилота.
 * Результат не может быть меньше 1 ОС.
 */
export function adjustedUnitPv(basePv, skill = DEFAULT_PILOT_SKILL) {
  const pv = Number(basePv) || 0
  const s = Number(skill)

  if (s > DEFAULT_PILOT_SKILL) {
    const coeff = pilotSkillDiscountCoefficient(pv)
    return Math.max(1, pv - coeff * (s - DEFAULT_PILOT_SKILL))
  }

  if (s < DEFAULT_PILOT_SKILL) {
    const coeff = pilotSkillSurchargeCoefficient(pv)
    return Math.max(1, pv + coeff * (DEFAULT_PILOT_SKILL - s))
  }

  return Math.max(1, pv)
}
