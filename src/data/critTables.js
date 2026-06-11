export const critTables = {
  mech: {
    2: { type: 'ammo', name: 'Попадание по боезапасу', desc: 'Уничтожен без CASE/CASEII/ENE. CASE: +1 урона.' },
    3: { type: 'engine', name: 'Попадание по реактору', desc: '+1 нагрев при стрельбе. Второй хит — уничтожен.' },
    4: { type: 'fireControl', name: 'Попадание по СУО', desc: '+2 к попаданию (кумулятивно).' },
    5: { type: 'none', name: 'Нет критического', desc: 'Нет эффекта.' },
    6: { type: 'weapon', name: 'Попадание по орудиям', desc: 'Урон −1 на все дистанции (мин. 0).' },
    7: { type: 'mp', name: 'Попадание по системам движения', desc: 'Половина текущей скорости (мин. потеря 2″).' },
    8: { type: 'weapon', name: 'Попадание по орудиям', desc: 'Урон −1 на все дистанции (мин. 0).' },
    9: { type: 'none', name: 'Нет критического', desc: 'Нет эффекта.' },
    10: { type: 'fireControl', name: 'Попадание по СУО', desc: '+2 к попаданию (кумулятивно).' },
    11: { type: 'engine', name: 'Попадание по реактору', desc: '+1 нагрев при стрельбе. Второй хит — уничтожен.' },
    12: { type: 'destroyed', name: 'Юнит уничтожен', desc: 'Фатальный урон.' }
  },
  vehicle: {
    2: { type: 'ammo', name: 'Попадание по боезапасу', desc: 'Уничтожен без CASE/CASEII/ENE. CASE: +1 урона.' },
    3: { type: 'crewStunned', name: 'Экипаж в смятении', desc: 'Не может двигаться/атаковать в следующий ход.' },
    4: { type: 'fireControl', name: 'Попадание по СУО', desc: '+2 к попаданию (кумулятивно).' },
    5: { type: 'fireControl', name: 'Попадание по СУО', desc: '+2 к попаданию (кумулятивно).' },
    6: { type: 'none', name: 'Нет критического', desc: 'Нет эффекта.' },
    7: { type: 'none', name: 'Нет критического', desc: 'Нет эффекта.' },
    8: { type: 'none', name: 'Нет критического', desc: 'Нет эффекта.' },
    9: { type: 'weapon', name: 'Попадание по орудиям', desc: 'Урон −1 на все дистанции (мин. 0).' },
    10: { type: 'weapon', name: 'Попадание по орудиям', desc: 'Урон −1 на все дистанции (мин. 0).' },
    11: { type: 'crewKilled', name: 'Экипаж убит', desc: 'Юнит выведен из игры.' },
    12: { type: 'engine', name: 'Попадание по реактору', desc: 'Скорость и урон −50%. Второй хит — уничтожен.' }
  },
  aerospace: {
    2: { type: 'fuel', name: 'Попадание в топливный бак', desc: 'Крушение. Юнит уничтожен.' },
    3: { type: 'fireControl', name: 'Попадание по СУО', desc: '+2 к попаданию (кумулятивно).' },
    4: { type: 'engine', name: 'Попадание по двигателю', desc: 'Thrust −50% (мин. −1). Второй — Thrust 0, крушение.' },
    5: { type: 'weapon', name: 'Попадание по орудиям', desc: 'Урон −1 на все дистанции (мин. 0).' },
    6: { type: 'none', name: 'Нет критического', desc: 'Нет эффекта.' },
    7: { type: 'none', name: 'Нет критического', desc: 'Нет эффекта.' },
    8: { type: 'none', name: 'Нет критического', desc: 'Нет эффекта.' },
    9: { type: 'weapon', name: 'Попадание по орудиям', desc: 'Урон −1 на все дистанции (мин. 0).' },
    10: { type: 'engine', name: 'Попадание по двигателю', desc: 'Thrust −50% (мин. −1). Второй — Thrust 0, крушение.' },
    11: { type: 'fireControl', name: 'Попадание по СУО', desc: '+2 к попаданию (кумулятивно).' },
    12: { type: 'crewKilled', name: 'Экипаж убит', desc: 'Юнит выведен из игры.' }
  },
  protomech: {
    2: { type: 'weapon', name: 'Попадание по орудиям', desc: 'Урон −1 на все дистанции (мин. 0).' },
    3: { type: 'weapon', name: 'Попадание по орудиям', desc: 'Урон −1 на все дистанции (мин. 0).' },
    4: { type: 'fireControl', name: 'Попадание по СУО', desc: '+2 к попаданию (кумулятивно).' },
    5: { type: 'mp', name: 'Попадание по системам движения', desc: 'Половина текущей скорости (мин. потеря 2″).' },
    6: { type: 'none', name: 'Нет критического', desc: 'Нет эффекта.' },
    7: { type: 'mp', name: 'Попадание по системам движения', desc: 'Половина текущей скорости (мин. потеря 2″).' },
    8: { type: 'none', name: 'Нет критического', desc: 'Нет эффекта.' },
    9: { type: 'mp', name: 'Попадание по системам движения', desc: 'Половина текущей скорости (мин. потеря 2″).' },
    10: { type: 'destroyed', name: 'Юнит уничтожен', desc: 'Фатальный урон.' },
    11: { type: 'weapon', name: 'Попадание по орудиям', desc: 'Урон −1 на все дистанции (мин. 0).' },
    12: { type: 'weapon', name: 'Попадание по орудиям', desc: 'Урон −1 на все дистанции (мин. 0).' }
  },
  dropship: {
    2: { type: 'kfBoom', name: 'KF Boom', desc: 'KF-шлюз уничтожен (не действует в стандартной игре).' },
    3: { type: 'dockingCollar', name: 'Стыковочный узел', desc: 'Невозможна стыковка с JumpShip.' },
    4: { type: 'none', name: 'Нет критического', desc: 'Нет эффекта.' },
    5: { type: 'fireControl', name: 'Попадание по СУО', desc: '+2 к попаданию (кумулятивно).' },
    6: { type: 'weapon', name: 'Попадание по орудиям', desc: 'Урон −1 на все дистанции (мин. 0).' },
    7: { type: 'thruster', name: 'Попадание по двигателю', desc: 'Повреждение маневровых двигателей.' },
    8: { type: 'weapon', name: 'Попадание по орудиям', desc: 'Урон −1 на все дистанции (мин. 0).' },
    9: { type: 'door', name: 'Повреждение шлюза', desc: 'Грузовой шлюз выведен.' },
    10: { type: 'none', name: 'Нет критического', desc: 'Нет эффекта.' },
    11: { type: 'engine', name: 'Повреждение двигателя', desc: 'Thrust −25%, затем −50%. Третий — 0, крушение.' },
    12: { type: 'crewHit', name: 'Повреждение экипажа', desc: 'Первый: +2 к попаданию. Второй: экипаж убит.' }
  },
  mobileStructure: {
    2: { type: 'none', name: 'Нет критического', desc: 'Нет эффекта.' },
    3: { type: 'none', name: 'Нет критического', desc: 'Нет эффекта.' },
    4: { type: 'none', name: 'Нет критического', desc: 'Нет эффекта.' },
    5: { type: 'none', name: 'Нет критического', desc: 'Нет эффекта.' },
    6: { type: 'weapon', name: 'Повреждение оружия', desc: 'Урон −1 на все дистанции (мин. 0).' },
    7: { type: 'gunnersStunned', name: 'Орудийная расчёт оглушён', desc: 'Орудия секции не стреляют 1 ход.' },
    8: { type: 'weapon', name: 'Повреждение оружия', desc: 'Урон −1 на все дистанции (мин. 0).' },
    9: { type: 'gunnersKilled', name: 'Орудийная расчёт убит', desc: 'Орудия секции выведены.' },
    10: { type: 'turretLocked', name: 'Башня заблокирована', desc: 'Башня не вращается.' },
    11: { type: 'ammo', name: 'Попадание в БК', desc: 'Если есть боеприпасы — пожар в секции.' },
    12: { type: 'weapon', name: 'Повреждение оружия', desc: 'Урон −1 на все дистанции (мин. 0).' }
  }
}

export function getCritCategory(unitType) {
  const t = (unitType || '').toUpperCase()
  if (t.includes('MOBILE STRUCTURE')) return 'mobileStructure'
  if (t.includes('PROTOMECH')) return 'protomech'
  if (t.includes('DROPSHIP') || t.includes('SMALL CRAFT')) return 'dropship'
  if (t.includes('AEROSPACE') || t.includes('FIGHTER') || t.includes('FIXED-WING') || t.includes('AIRSHIP')) return 'aerospace'
  if (t.includes('VEHICLE') || t.includes('VTOL') || t.includes('NAVAL') || t.includes('WIGE')) return 'vehicle'
  if (t.includes('MECH') || t.includes('OMNI')) return 'mech'
  return 'mech'
}

export function getCritTable(category) {
  return critTables[category] || critTables.mech
}

export function getCritByRoll(category, roll) {
  const table = getCritTable(category)
  return table[roll] || null
}
