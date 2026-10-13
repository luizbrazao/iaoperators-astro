// Fechas de RGPD Ops. Funciones puras, en fechas de calendario (YYYY-MM-DD)
// para no depender de la zona horaria del servidor.

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isValidDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const m = DATE_RE.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (y < 2000 || y > 2100 || mo < 1 || mo > 12 || d < 1) return false;
  return d <= daysInMonth(y, mo);
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Suma meses de calendario. Si el día no existe en el mes de destino (31 de
 * enero + 1 mes), se usa el último día de ese mes. Es la lectura prudente de
 * «un mes a partir de la recepción»: nunca alarga el plazo.
 */
export function addMonths(date: string, months: number): string {
  const m = DATE_RE.exec(date);
  if (!m) throw new Error("fecha inválida");
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1 + months;
  const targetYear = y + Math.floor(mo / 12);
  const targetMonth = ((mo % 12) + 12) % 12 + 1;
  const day = Math.min(Number(m[3]), daysInMonth(targetYear, targetMonth));
  return `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Fecha de hoy en Madrid (YYYY-MM-DD). */
export function todayMadrid(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** Días de calendario de a hasta b (negativo si b es anterior). */
export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

/** Trimestre natural: "2026-T4". */
export function quarterOf(date: string): string {
  const [y, m] = date.split("-").map(Number);
  return `${y}-T${Math.floor((m - 1) / 3) + 1}`;
}

/** Horas transcurridas desde un instante ISO. */
export function hoursSince(iso: string, now: Date = new Date()): number {
  return (now.getTime() - new Date(iso).getTime()) / 3_600_000;
}

export function formatDateEs(value: string | null | undefined): string {
  if (!value) return "—";
  const d = value.length === 10 ? new Date(`${value}T12:00:00Z`) : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Madrid" }).format(d);
}

export function formatDateTimeEs(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" }).format(d);
}
