// Decodifica entidades HTML residuales en datos ya guardados
export function decodeEntities(str: string): string {
  if (!str) return str
  return str
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&ndash;/g, '–').replace(/&mdash;/g, '—')
    .replace(/&lsquo;/g, '‘').replace(/&rsquo;/g, '’')
    .replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”')
    .trim()
}

// Palabras que no son nombres propios de persona (indicadores de organización)
const ORG_INDICATORS = [
  'blog', 'review', 'news', 'magazine', 'journal', 'press', 'media',
  'institute', 'instituto', 'universidad', 'university', 'foundation',
  'fundación', 'center', 'centro', 'channel', 'canal', 'studio', 'group',
  'org', 'inc', 'ltd', 'llc', 'sa', 'srl',
]

// Detecta si parece nombre de persona vs. organización
function isPersonName(str: string): boolean {
  if (!str) return false
  const lower = str.toLowerCase()
  if (ORG_INDICATORS.some(w => lower.includes(w))) return false

  const words = str.trim().split(/\s+/)
  if (words.length < 2 || words.length > 5) return false

  // Filtrar iniciales ya abreviadas (ej. "J." está ok)
  const filtered = words.filter(w => !/^[A-ZÁÉÍÓÚÜÑ]\.$/.test(w))
  if (filtered.length === 0) return false

  // Cada palabra sustantiva debe iniciar con mayúscula y tener más de 1 letra
  return filtered.every(w =>
    /^[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñA-ZÁÉÍÓÚÜÑ'-]{1,}$/.test(w)
  )
}

/**
 * Formatea nombre para APA7: "Apellido, I. M."
 * Maneja: "Juan García", "Édgar J. González Gaudiano", "María José López"
 */
export function formatAuthorApa(raw: string): string {
  const str = decodeEntities(raw || '').trim()
  if (!str) return 'Autor desconocido'

  // Ya tiene formato "Apellido, I."
  if (/^[^\s,]+,\s+[A-ZÁÉÍÓÚÜÑ]\./.test(str)) return str

  if (!isPersonName(str)) return str

  const words = str.split(/\s+/)

  // Separar iniciales ya abreviadas de nombres completos
  const initials: string[] = []
  const fullNames: string[] = []
  for (const w of words) {
    if (/^[A-ZÁÉÍÓÚÜÑ]\.$/.test(w)) initials.push(w)
    else fullNames.push(w)
  }

  if (fullNames.length === 0) return str

  // El/los últimos nombre(s) completo(s) son el apellido
  // Si hay 2+ nombres completos, el último es apellido (salvo apellido compuesto)
  // Heurística: si hay exactamente 2 nombres completos + iniciales → apellido = último
  const lastName = fullNames[fullNames.length - 1]
  const firstNames = fullNames.slice(0, -1)

  const firstInitials = firstNames.map(n => `${n[0].toUpperCase()}.`).join(' ')
  const allInitials = [firstInitials, ...initials].filter(Boolean).join(' ')

  return allInitials
    ? `${lastName}, ${allInitials}`
    : `${lastName}`
}

/**
 * Formatea nombre para Vancouver: "Apellido Iniciales"
 * Maneja: "Juan García" → "García J", "Édgar J. González Gaudiano" → "González Gaudiano EJ"
 */
export function formatAuthorVancouver(raw: string): string {
  const str = decodeEntities(raw || '').trim()
  if (!str) return 'Autor desconocido'

  if (!isPersonName(str)) return str

  const words = str.split(/\s+/)

  const initials: string[] = []
  const fullNames: string[] = []
  for (const w of words) {
    if (/^[A-ZÁÉÍÓÚÜÑ]\.$/.test(w)) initials.push(w[0])
    else fullNames.push(w)
  }

  if (fullNames.length === 0) return str

  const lastName = fullNames[fullNames.length - 1]
  const firstNames = fullNames.slice(0, -1)
  const firstInitials = firstNames.map(n => n[0].toUpperCase()).join('')
  const allInitials = firstInitials + initials.join('')

  return allInitials ? `${lastName} ${allInitials}` : lastName
}
