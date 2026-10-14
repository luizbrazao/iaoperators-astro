// Pruebas del Hotel Revenue Operator (sin red, sin Supabase, sin Resend).
// Uso: npm run hotel-revenue:test
//
// Cubre: motor de la calculadora (mínimos, máximos, ceros, redondeo,
// invariantes, escenarios crecientes, nunca negativo/NaN), lectura de números
// en formato español, validación del payload (lista blanca, honeypot, UTM,
// referrer, web, teléfono, consentimiento), recálculo en el servidor (los
// resultados del navegador se ignoran), idempotencia por submission_id,
// notificación sin duplicados, fallo de email que no pierde el lead, rate
// limit, configuración ausente → 503, analítica sin PII, email interno
// escapado y logs sin PII.
// La migración se prueba aparte con PGlite (npm run hotel-revenue:test-sql).

import {
  CALCULATOR_FIELDS,
  CALCULATOR_VERSION,
  DEFAULT_INPUTS,
  INPUT_LIMITS,
  SCENARIOS,
  calculate,
  clampInputs,
  formatEuros,
  parseLocaleNumber,
  validateCalculatorInputs,
} from "../src/lib/hotel-revenue/calculator";
import {
  isHoneypotFilled,
  normalizePhone,
  normalizeWebsite,
  sanitizeLandingPath,
  sanitizeReferrerHost,
  sanitizeUtm,
  validateLeadPayload,
} from "../src/lib/hotel-revenue/validation";
import {
  buildHotelRevenuePayload,
  cleanHotelRevenueParams,
  opportunityBucket,
  otaShareBucket,
  resultDimensions,
  roomsBucket,
} from "../src/lib/hotel-revenue/analytics";
import { buildInternalLeadEmail, sendInternalLeadEmail } from "../src/lib/hotel-revenue/server/email";
import { formatLogLine, type HotelRevenueLogFields } from "../src/lib/hotel-revenue/server/log";
import { HotelRevenueConfigError, isAllowedOrigin, supabaseTableEditorUrl } from "../src/lib/hotel-revenue/server/env";
import { RATE_LIMITS, submitLead, type LeadRow, type LeadServiceDeps, type LeadStore } from "../src/lib/hotel-revenue/server/service";
import { HOTEL_REVENUE_CONSENT, HOTEL_REVENUE_PRODUCT } from "../src/data/hotel-revenue";
import type { CalculatorInputs, CalculatorResult } from "../src/lib/hotel-revenue/types";

let fails = 0;
let passes = 0;
function ok(name: string, cond: boolean, detail = "") {
  if (cond) passes++;
  else {
    fails++;
    console.log(`FALLO · ${name}${detail ? `\n       ${detail}` : ""}`);
  }
}

const finiteNonNeg = (n: number) => Number.isFinite(n) && n >= 0;
function allNumbers(result: CalculatorResult): number[] {
  return [
    ...Object.values(result.base),
    ...Object.values(result.scenarios).flatMap((s) => [s.commissionSavingsMonthly, s.upsellRevenueMonthly, s.totalMonthly, s.totalAnnual]),
  ];
}
const cents = (n: number) => Math.round(n * 100);

// =============================================================== calculadora
{
  const r = calculate(DEFAULT_INPUTS);
  // 30 hab × 30 × 0,70 = 630 noches; 630 / 2,5 = 252 reservas
  // OTA: 630 × 110 × 0,60 = 41.580 €; comisión 18 % = 7.484,40 €
  ok("base: noches ocupadas", r.base.occupiedRoomNights === 630, String(r.base.occupiedRoomNights));
  ok("base: reservas estimadas", r.base.estimatedBookings === 252, String(r.base.estimatedBookings));
  ok("base: ingresos OTA", r.base.estimatedOtaRevenue === 41580, String(r.base.estimatedOtaRevenue));
  ok("base: comisión OTA", r.base.estimatedOtaCommission === 7484.4, String(r.base.estimatedOtaCommission));
  // Realista 7 %: comisión 523,908 → 523,91; extras 252 × 0,07 × 25 = 441
  const re = r.scenarios.realistic;
  ok("realista: ahorro de comisión redondeado al céntimo", re.commissionSavingsMonthly === 523.91, String(re.commissionSavingsMonthly));
  ok("realista: extras", re.upsellRevenueMonthly === 441, String(re.upsellRevenueMonthly));
  ok("realista: total mensual = suma", re.totalMonthly === 964.91, String(re.totalMonthly));
  ok("realista: anual = mensual × 12 (exacto en céntimos)", cents(re.totalAnnual) === cents(re.totalMonthly) * 12, String(re.totalAnnual));
  // Conservador 3 %: 7484,4 × 0,03 = 224,532 → 224,53; extras 252 × 0,03 × 25 = 189
  ok("conservador: valores", r.scenarios.conservative.commissionSavingsMonthly === 224.53 && r.scenarios.conservative.upsellRevenueMonthly === 189);
  // Potencial 12 %: 898,128 → 898,13; extras 756
  ok("potencial: valores", r.scenarios.potential.commissionSavingsMonthly === 898.13 && r.scenarios.potential.upsellRevenueMonthly === 756);
  ok("versión del modelo en el resultado", r.version === CALCULATOR_VERSION);
  ok("reproducible: mismo input → mismo JSON", JSON.stringify(calculate(DEFAULT_INPUTS)) === JSON.stringify(calculate({ ...DEFAULT_INPUTS })));
}

{
  const min = Object.fromEntries(CALCULATOR_FIELDS.map((f) => [f, INPUT_LIMITS[f].min])) as unknown as CalculatorInputs;
  const max = Object.fromEntries(CALCULATOR_FIELDS.map((f) => [f, INPUT_LIMITS[f].max])) as unknown as CalculatorInputs;
  ok("mínimos: válidos", validateCalculatorInputs(min).ok);
  ok("máximos: válidos", validateCalculatorInputs(max).ok);
  const rMin = calculate(min);
  const rMax = calculate(max);
  ok("mínimos: todo finito y ≥ 0", allNumbers(rMin).every(finiteNonNeg));
  ok("mínimos: OTA 0 % y extra 0 € → oportunidad 0", rMin.scenarios.potential.totalAnnual === 0);
  ok("máximos: todo finito y ≥ 0", allNumbers(rMax).every(finiteNonNeg));
  // 1000 × 30 × 1 = 30.000 noches; × 5000 € × 100 % = 150 M€; × 40 % = 60 M€; realista 7 % = 4,2 M€
  ok("máximos: comisión realista", rMax.scenarios.realistic.commissionSavingsMonthly === 4_200_000, String(rMax.scenarios.realistic.commissionSavingsMonthly));
  // 30.000 noches / 30 noches de estancia = 1.000 reservas × 0,07 × 1000 € = 70.000 €
  ok("máximos: extras realistas", rMax.scenarios.realistic.upsellRevenueMonthly === 70_000, String(rMax.scenarios.realistic.upsellRevenueMonthly));

  const zeroOta = calculate({ ...DEFAULT_INPUTS, otaSharePct: 0 });
  ok("cero permitido: OTA 0 % → sin ahorro, extras intactos", zeroOta.scenarios.realistic.commissionSavingsMonthly === 0 && zeroOta.scenarios.realistic.upsellRevenueMonthly === 441);
  const zeroCom = calculate({ ...DEFAULT_INPUTS, otaCommissionPct: 0 });
  ok("cero permitido: comisión 0 % → sin ahorro", zeroCom.scenarios.realistic.commissionSavingsMonthly === 0);
  const zeroUp = calculate({ ...DEFAULT_INPUTS, upsellAvg: 0 });
  ok("cero permitido: extra 0 € → sin extras", zeroUp.scenarios.potential.upsellRevenueMonthly === 0);
}

{
  // Invariantes sobre un barrido determinista (sin aleatoriedad: reproducible).
  let broken = "";
  const grid = {
    rooms: [1, 7, 30, 99, 1000],
    occupancyPct: [1, 33.3, 70, 100],
    adr: [10, 87.45, 110, 5000],
    avgStayNights: [1, 1.7, 2.5, 30],
    otaSharePct: [0, 12.5, 60, 100],
    otaCommissionPct: [0, 15, 18.5, 40],
    upsellAvg: [0, 9.99, 25, 1000],
  };
  let n = 0;
  for (const rooms of grid.rooms)
    for (const occupancyPct of grid.occupancyPct)
      for (const adr of grid.adr)
        for (const avgStayNights of grid.avgStayNights)
          for (const otaSharePct of grid.otaSharePct)
            for (const otaCommissionPct of [grid.otaCommissionPct[n % 4]])
              for (const upsellAvg of [grid.upsellAvg[(n + 1) % 4]]) {
                n++;
                const r = calculate({ rooms, occupancyPct, adr, avgStayNights, otaSharePct, otaCommissionPct, upsellAvg });
                const [c, re, p] = [r.scenarios.conservative, r.scenarios.realistic, r.scenarios.potential];
                if (!allNumbers(r).every(finiteNonNeg)) broken ||= `no finito/negativo en ${JSON.stringify(r.inputs)}`;
                if (!(c.totalMonthly <= re.totalMonthly && re.totalMonthly <= p.totalMonthly)) broken ||= `no creciente en ${JSON.stringify(r.inputs)}`;
                for (const s of [c, re, p]) {
                  if (cents(s.totalMonthly) !== cents(s.commissionSavingsMonthly) + cents(s.upsellRevenueMonthly)) broken ||= `total ≠ suma en ${s.id}`;
                  if (cents(s.totalAnnual) !== cents(s.totalMonthly) * 12) broken ||= `anual ≠ 12× en ${s.id}`;
                  if (s.commissionSavingsMonthly > r.base.estimatedOtaCommission + 0.01) broken ||= `ahorro > comisión en ${s.id}`;
                  if (cents(s.totalMonthly) !== Math.round(s.totalMonthly * 100)) broken ||= "más de 2 decimales";
                }
              }
  ok(`invariantes en ${n} combinaciones (finito, ≥0, creciente, suma, ×12, ahorro ≤ comisión, céntimos)`, broken === "", broken);
}

{
  ok("escenarios: tres, en orden creciente", SCENARIOS.length === 3 && SCENARIOS[0].otaRecoveryRate < SCENARIOS[1].otaRecoveryRate && SCENARIOS[1].otaRecoveryRate < SCENARIOS[2].otaRecoveryRate);
  ok("escenarios: tasas configuradas (3/7/12 %)", SCENARIOS.map((s) => `${s.otaRecoveryRate}/${s.upsellAdoptionRate}`).join(",") === "0.03/0.03,0.07/0.07,0.12/0.12");
  // Escenarios inyectables: el motor no los lleva cableados.
  const custom = calculate(DEFAULT_INPUTS, [{ id: "realistic", label: "x", otaRecoveryRate: 1, upsellAdoptionRate: 0 }]);
  ok("escenarios inyectables", custom.scenarios.realistic.commissionSavingsMonthly === 7484.4 && custom.scenarios.realistic.upsellRevenueMonthly === 0);

  // Red de seguridad: entradas basura nunca producen NaN/Infinity/negativos.
  const garbage = calculate({ rooms: "abc", occupancyPct: -50, adr: Infinity, avgStayNights: 0, otaSharePct: 1e9, otaCommissionPct: NaN, upsellAvg: -3 } as never);
  ok("clamp: basura → números finitos y ≥ 0", allNumbers(garbage).every(finiteNonNeg), JSON.stringify(garbage.inputs));
  ok("clamp: estancia 0 → mínimo 1 (sin división por cero)", clampInputs({ avgStayNights: 0 }).avgStayNights === 1);
  ok("formato es-ES EUR", formatEuros(1234.5).replace(/\s/g, " ") === "1.235 €" && formatEuros(12345).replace(/\s/g, " ") === "12.345 €", formatEuros(12345));
  ok("formato: NaN → 0 €", formatEuros(Number.NaN).replace(/\s/g, " ") === "0 €");
}

{
  const cases: [unknown, number | null][] = [
    ["2,5", 2.5], ["2.5", 2.5], ["1.200", 1200], ["1.200,50", 1200.5], ["1,200.50", 1200.5], ["110 €", 110], ["18%", 18],
    ["12.500", 12500], ["", null], ["abc", null], ["1,2,3", null], [" 30 ", 30], [Infinity, null], [Number.NaN, null], [null, null], ["1e3", null],
  ];
  const bad = cases.filter(([i, o]) => parseLocaleNumber(i) !== o).map(([i, o]) => `${String(i)} → ${parseLocaleNumber(i)} (esperado ${o})`);
  ok("parseLocaleNumber: formato español", bad.length === 0, bad.join("; "));

  const v = validateCalculatorInputs({ ...DEFAULT_INPUTS, rooms: "0", occupancyPct: "101", adr: "9,99", avgStayNights: "31", otaSharePct: "-1", otaCommissionPct: "40,1", upsellAvg: "1000,01" });
  ok("validación: los 7 fuera de rango se rechazan (no se recortan)", !v.ok && Object.keys(v.errors).length === 7, JSON.stringify(!v.ok && v.errors));
  const vInt = validateCalculatorInputs({ ...DEFAULT_INPUTS, rooms: "30,5" });
  ok("validación: habitaciones enteras", !vInt.ok && Boolean(vInt.errors.rooms));
  const vNorm = validateCalculatorInputs({ ...DEFAULT_INPUTS, adr: "110,456", avgStayNights: "2,55", extra: "ignorado" });
  ok("validación: normaliza decimales y descarta campos extra", vNorm.ok && vNorm.value.adr === 110.46 && vNorm.value.avgStayNights === 2.6 && !("extra" in vNorm.value), JSON.stringify(vNorm));
}

// =============================================================== payload
const SUB = "4f0c2d8e-9b1a-4c3d-8e2f-1a2b3c4d5e6f";
function payload(over: Record<string, unknown> = {}) {
  return {
    submissionId: SUB,
    name: "  Ana   García ",
    email: " Ana.Garcia@HotelEjemplo.ES ",
    hotelName: "Hotel Ejemplo‮ Centro",
    website: "hotelejemplo.es/reservas/?utm=x#frag",
    phone: "+34 600 00 00 00",
    propertyCount: 2,
    roomCount: "48",
    privacyAccepted: true,
    consentVersion: HOTEL_REVENUE_CONSENT.version,
    inputs: { ...DEFAULT_INPUTS, adr: "110" },
    // Resultados "trucados" del navegador: el servidor no debe mirarlos.
    results: { scenarios: { realistic: { totalMonthly: 999999999 } } },
    context: {
      landingPath: "/es/hoteles/reservas-directas-ia/?gclid=abc",
      referrer: "https://www.google.com/search?q=chatbot+hotel&email=ana@x.es",
      utm: { utm_source: "google", utm_medium: "cpc", utm_campaign: "hoteles_es", utm_term: "ana@hotel.es", utm_content: "x".repeat(101), utm_id: "nope" },
      ctaOrigin: "hero",
    },
    hp_confirm: "",
    ...over,
  };
}

{
  const v = validateLeadPayload(payload());
  ok("payload válido", v.ok, JSON.stringify(!v.ok && v.errors));
  if (v.ok) {
    const l = v.value;
    ok("email normalizado (trim + minúsculas)", l.email === "ana.garcia@hotelejemplo.es");
    ok("nombre: espacios colapsados", l.name === "Ana García");
    ok("hotel: sin caracteres de control/bidi", l.hotelName === "Hotel Ejemplo Centro", JSON.stringify(l.hotelName));
    ok("web: https, sin query ni fragmento", l.website === "https://hotelejemplo.es/reservas", String(l.website));
    ok("habitaciones como string numérico", l.roomCount === 48);
    ok("landing: solo la ruta", l.landingPath === "/es/hoteles/reservas-directas-ia/");
    ok("referrer: solo el host", l.referrerHost === "www.google.com");
    ok("UTM: permitidas; email y >100 caracteres descartados; claves extra ignoradas", l.utm.utm_source === "google" && l.utm.utm_term === null && l.utm.utm_content === null && !("utm_id" in l.utm), JSON.stringify(l.utm));
    ok("CTA origin de la lista", l.ctaOrigin === "hero");
    ok("no hay resultados del cliente en el lead normalizado", !("results" in (l as object)));
  }
  const bad = validateLeadPayload(payload({ name: "A", email: "no-es-email", hotelName: "", website: "javascript:alert(1)", phone: "llámame", propertyCount: 0, roomCount: -1, privacyAccepted: "true", consentVersion: "v0", submissionId: "123", inputs: { ...DEFAULT_INPUTS, rooms: 5000 } }));
  ok("payload inválido: todos los campos marcados", !bad.ok && ["name", "email", "hotelName", "website", "phone", "propertyCount", "roomCount", "privacyAccepted", "consentVersion", "submissionId", "inputs.rooms"].every((k) => k in bad.errors), JSON.stringify(!bad.ok && bad.errors));
  ok("consentimiento: solo true booleano", !validateLeadPayload(payload({ privacyAccepted: 1 })).ok);
  ok("payload no-objeto → errores, sin excepción", !validateLeadPayload(null).ok && !validateLeadPayload([1, 2]).ok && !validateLeadPayload("x").ok);
  const opt = validateLeadPayload(payload({ website: "", phone: "   " }));
  ok("web y teléfono opcionales vacíos → null", opt.ok && opt.value.website === null && opt.value.phone === null);

  ok("web: rechaza credenciales", normalizeWebsite("https://user:pass@hotel.es") === null);
  ok("web: rechaza host sin punto", normalizeWebsite("localhost") === null);
  ok("web: acepta http y subdominio", normalizeWebsite("http://www.Hotel-Ejemplo.com/") === "http://www.hotel-ejemplo.com");
  ok("teléfono: formatos razonables", normalizePhone("(+34) 952-123.456") === "(+34) 952-123.456" && normalizePhone("+44 20 7946 0958") === "+44 20 7946 0958");
  ok("teléfono: muy corto o con letras → inválido", normalizePhone("12345") === null && normalizePhone("600 abc 000") === null);
  ok("landing fuera de /es/hoteles/ → landing por defecto", sanitizeLandingPath("https://evil.example/es/hoteles/x") === "/es/hoteles/x/" && sanitizeLandingPath("/es/contact/") === HOTEL_REVENUE_PRODUCT.paths.landing && sanitizeLandingPath("//evil.example/") === HOTEL_REVENUE_PRODUCT.paths.landing);
  ok("referrer no http(s) → null", sanitizeReferrerHost("javascript:alert(1)") === null && sanitizeReferrerHost("") === null);
  ok("UTM no objeto → todo null", Object.values(sanitizeUtm("x")).every((v) => v === null));
  ok("honeypot", isHoneypotFilled({ hp_confirm: "https://spam" }) && !isHoneypotFilled({ hp_confirm: "  " }) && !isHoneypotFilled(null));
}

// =============================================================== servicio (recálculo, idempotencia, email)
interface FakeRow extends LeadRow { id: string; notification_status: string; notification_attempts: number; notification_error_code: string | null }

function fakeStore(opts: { rateLimitFails?: boolean; insertFails?: boolean; limitOverride?: number } = {}) {
  const rows = new Map<string, FakeRow>();
  const buckets = new Map<string, number>();
  const keys: string[] = [];
  const store: LeadStore = {
    async rateLimitHit(key, limit) {
      if (opts.rateLimitFails) throw Object.assign(new Error("db down"), { code: "rate_limit_failed:08006" });
      keys.push(key);
      const hits = (buckets.get(key) ?? 0) + 1;
      buckets.set(key, hits);
      return hits <= (opts.limitOverride ?? limit);
    },
    async insertLead(row) {
      if (opts.insertFails) throw Object.assign(new Error("insert"), { code: "lead_insert_failed:23514" });
      const existing = [...rows.values()].find((r) => r.submission_id === row.submission_id);
      if (existing) return { id: existing.id, created: false };
      const id = `lead-${rows.size + 1}`;
      rows.set(id, { ...structuredClone(row), id, notification_status: "pending", notification_attempts: 0, notification_error_code: null });
      return { id, created: true };
    },
    async claimNotification(id) {
      const r = rows.get(id)!;
      if (r.notification_attempts >= 5 || !["pending", "failed"].includes(r.notification_status)) return false;
      r.notification_status = "sending";
      r.notification_attempts++;
      return true;
    },
    async markNotification(id, status, code) {
      const r = rows.get(id)!;
      if (r.notification_status !== "sending") return;
      r.notification_status = status;
      r.notification_error_code = code;
    },
  };
  return { store, rows, keys };
}

function deps(store: LeadStore, send: (e: unknown) => Promise<{ ok: boolean; code: string }>, logs: HotelRevenueLogFields[]): LeadServiceDeps {
  return {
    store,
    hmacSecret: "test-secret-hotel-revenue-0123456789abcdef",
    buildEmail: (input) => buildInternalLeadEmail({ ...input, config: { from: "IA <a@b.es>", to: "info@iaoperators.com" }, tableEditorUrl: null }),
    sendEmail: send,
    now: () => new Date("2026-10-14T10:00:00Z"),
    log: (f) => logs.push(f),
  };
}

const ctx = { ip: "203.0.113.7", requestId: "req-1" };

{
  const logs: HotelRevenueLogFields[] = [];
  const { store, rows, keys } = fakeStore();
  const sent: unknown[] = [];
  const d = deps(store, async (e) => (sent.push(e), { ok: true, code: "sent" }), logs);
  const out = await submitLead(payload(), ctx, () => d, (f) => logs.push(f));
  ok("servicio: alta", out.kind === "created" && out.notification === "sent", JSON.stringify(out));
  const row = [...rows.values()][0];
  const expected = calculate(DEFAULT_INPUTS);
  ok("recálculo: resultados del servidor, no los del cliente", row.calculator_results.scenarios.realistic.totalMonthly === expected.scenarios.realistic.totalMonthly && row.calculator_results.scenarios.realistic.totalMonthly !== 999999999);
  ok("recálculo: versión del modelo guardada", row.calculator_version === CALCULATOR_VERSION && row.calculator_results.version === CALCULATOR_VERSION);
  ok("fila: consentimiento con fecha del servidor", row.consent_at === "2026-10-14T10:00:00.000Z" && row.consent_version === HOTEL_REVENUE_CONSENT.version);
  ok("fila: status new", row.status === "new");
  ok("rate limit: claves HMAC (64 hex), sin IP ni email en claro", keys.length === 2 && keys.every((k) => /^[0-9a-f]{64}$/.test(k)) && !keys.some((k) => k.includes("203.0.113.7") || k.includes("@")));

  const again = await submitLead(payload(), ctx, () => d, (f) => logs.push(f));
  ok("idempotencia: mismo submission_id → mismo lead, sin duplicar", again.kind === "duplicate" && rows.size === 1);
  ok("idempotencia: sin segunda notificación", sent.length === 1 && again.kind === "duplicate" && again.notification === "not_claimed");

  const other = await submitLead(payload({ submissionId: "9a0c2d8e-9b1a-4c3d-8e2f-1a2b3c4d5e6f" }), ctx, () => d, (f) => logs.push(f));
  ok("otro envío → otro lead", other.kind === "created" && rows.size === 2);

  const serialized = logs.map((l) => formatLogLine(l)).join("\n");
  ok("logs sin PII", !/ana|garcia|hotelejemplo|600 00|203\.0\.113|@/i.test(serialized), serialized.slice(0, 300));
}

{
  const logs: HotelRevenueLogFields[] = [];
  const { store, rows } = fakeStore();
  let calls = 0;
  const failing = deps(store, async () => (calls++, { ok: false, code: "resend_http_500" }), logs);
  const out = await submitLead(payload(), ctx, () => failing, (f) => logs.push(f));
  const row = [...rows.values()][0];
  ok("email falla: el lead queda guardado", out.kind === "created" && rows.size === 1 && out.notification === "failed");
  ok("email falla: código saneado en la fila", row.notification_status === "failed" && row.notification_error_code === "resend_http_500");
  const ok2 = deps(store, async () => (calls++, { ok: true, code: "sent" }), logs);
  const retry = await submitLead(payload(), ctx, () => ok2, (f) => logs.push(f));
  ok("reintento del mismo envío tras fallo: reintenta el email", retry.kind === "duplicate" && retry.notification === "sent" && row.notification_status === "sent" && calls === 2);

  const throwing = deps(store, async () => { throw new Error("boom"); }, logs);
  const out3 = await submitLead(payload({ submissionId: "7a0c2d8e-9b1a-4c3d-8e2f-1a2b3c4d5e6f" }), ctx, () => throwing, (f) => logs.push(f));
  ok("excepción en el email: el lead se guarda igual", out3.kind === "created" && out3.notification === "error" && rows.size === 2);

  const noResend = deps(store, (e) => sendInternalLeadEmail(e as never, undefined), logs);
  const out4 = await submitLead(payload({ submissionId: "6a0c2d8e-9b1a-4c3d-8e2f-1a2b3c4d5e6f" }), ctx, () => noResend, (f) => logs.push(f));
  ok("sin RESEND_API_KEY: lead guardado, notificación 'skipped'", out4.kind === "created" && out4.notification === "skipped");
}

{
  const logs: HotelRevenueLogFields[] = [];
  const hp = await submitLead(payload({ hp_confirm: "x" }), ctx, () => { throw new Error("no debe llamarse"); }, (f) => logs.push(f));
  ok("honeypot: no toca la BD", hp.kind === "honeypot");

  const inv = await submitLead(payload({ email: "x" }), ctx, () => { throw new Error("no debe llamarse"); }, (f) => logs.push(f));
  ok("inválido: no toca la BD", inv.kind === "invalid" && "email" in inv.errors);

  const cfg = await submitLead(payload(), ctx, () => { throw new HotelRevenueConfigError(["SUPABASE_URL", "HOTEL_REVENUE_HMAC_SECRET"]); }, (f) => logs.push(f));
  ok("sin configuración: not_configured (→ 503), nunca éxito", cfg.kind === "not_configured" && cfg.missing.includes("SUPABASE_URL"));
  ok("sin configuración: el log nombra variables, no valores", logs.some((l) => l.action === "config" && l.detail === "SUPABASE_URL,HOTEL_REVENUE_HMAC_SECRET"));

  const { store: down } = fakeStore({ rateLimitFails: true });
  const u1 = await submitLead(payload(), ctx, () => deps(down, async () => ({ ok: true, code: "sent" }), logs), (f) => logs.push(f));
  ok("BD caída en el rate limit → unavailable (503)", u1.kind === "unavailable");
  const { store: noInsert } = fakeStore({ insertFails: true });
  const u2 = await submitLead(payload(), ctx, () => deps(noInsert, async () => ({ ok: true, code: "sent" }), logs), (f) => logs.push(f));
  ok("fallo de inserción → unavailable (503)", u2.kind === "unavailable");

  const { store: limited } = fakeStore();
  const d = deps(limited, async () => ({ ok: true, code: "sent" }), logs);
  let last = "";
  for (let i = 0; i <= RATE_LIMITS.ip.limit; i++) {
    const id = `5a0c2d8e-9b1a-4c3d-8e2f-1a2b3c4d5e${String(i).padStart(2, "0")}`;
    last = (await submitLead(payload({ submissionId: id }), ctx, () => d, (f) => logs.push(f))).kind;
  }
  ok(`rate limit por IP: el envío ${RATE_LIMITS.ip.limit + 1} se bloquea`, last === "rate_limited");
}

// =============================================================== origin
{
  const url = new URL("https://iaoperators.com/api/hotel-revenue/lead");
  const req = (h: Record<string, string>) => new Request(url, { method: "POST", headers: h });
  ok("origin: propio", isAllowedOrigin(req({ origin: "https://iaoperators.com" }), url, []));
  ok("origin: www", isAllowedOrigin(req({ origin: "https://www.iaoperators.com" }), url, []));
  ok("origin: ajeno rechazado", !isAllowedOrigin(req({ origin: "https://evil.example" }), url, []));
  ok("origin: extra permitido por env", isAllowedOrigin(req({ origin: "https://preview.vercel.app" }), url, ["https://preview.vercel.app"]));
  ok("origin: sin cabecera y sec-fetch-site same-origin", isAllowedOrigin(req({ "sec-fetch-site": "same-origin" }), url, []));
  ok("origin: sin cabecera ni sec-fetch-site → rechazado", !isAllowedOrigin(req({}), url, []));
  ok("editor de Supabase desde SUPABASE_URL", supabaseTableEditorUrl("https://abcdefghijklmnop.supabase.co") === "https://supabase.com/dashboard/project/abcdefghijklmnop/editor" && supabaseTableEditorUrl("http://localhost:54321") === null);
}

// =============================================================== analítica
{
  ok("buckets de habitaciones", roomsBucket(1) === "1-9" && roomsBucket(10) === "10-29" && roomsBucket(100) === "60-100" && roomsBucket(101) === "101-250" && roomsBucket(1000) === "251+");
  ok("buckets de OTA", otaShareBucket(0) === "0-24" && otaShareBucket(25) === "25-49" && otaShareBucket(74.9) === "50-74" && otaShareBucket(100) === "75-100");
  ok("buckets de oportunidad", opportunityBucket(0) === "0-499" && opportunityBucket(964.91) === "500-1999" && opportunityBucket(10000) === "10000+");

  const pii = cleanHotelRevenueParams({
    rooms_bucket: "30-59",
    email: "ana@hotel.es",
    name: "Ana",
    phone: "+34600000000",
    hotel_name: "Hotel Ejemplo",
    website: "https://hotel.es",
    value: 964.91,
    opportunity_bucket: "964.91",
    cta_origin: "ana@hotel.es",
    scenario: "realistic",
  });
  ok("analítica: solo claves y valores de lista cerrada", JSON.stringify(pii) === JSON.stringify({ rooms_bucket: "30-59", scenario: "realistic" }), JSON.stringify(pii));

  const dims = resultDimensions(calculate(DEFAULT_INPUTS));
  const lead = buildHotelRevenuePayload("generate_lead", { ...dims, cta_origin: "hero" })!;
  ok("generate_lead: lead_source", lead.lead_source === "Hotel_Revenue_Operator" && lead.event === "generate_lead");
  ok("generate_lead: sin cifras exactas", !Object.values(lead).some((v) => /964|441|523|7484/.test(v)), JSON.stringify(lead));
  ok("generate_lead: claves permitidas", Object.keys(lead).every((k) => ["event", "product_id", "calculator_version", "rooms_bucket", "ota_share_bucket", "opportunity_bucket", "scenario", "cta_origin", "lead_source"].includes(k)), Object.keys(lead).join(","));
  ok("evento no permitido → null", buildHotelRevenuePayload("purchase" as never) === null);
  ok("lead_source solo en generate_lead", !("lead_source" in buildHotelRevenuePayload("hotel_revenue_cta_clicked", { cta_origin: "hero" })!));
}

// =============================================================== email interno
{
  const v = validateLeadPayload(payload({ hotelName: `<script>alert("x")</script> & Co`, name: "Ana <b>" }));
  if (!v.ok) ok("email: payload de prueba válido", false, JSON.stringify(v.errors));
  else {
    const e = buildInternalLeadEmail({ lead: v.value, result: calculate(v.value.inputs), leadId: "11111111-2222-4333-8444-555555555555", config: { from: "IA <a@b.es>", to: "info@iaoperators.com" }, tableEditorUrl: "https://supabase.com/dashboard/project/abc/editor" });
    ok("email: HTML escapado", !e.html.includes("<script>") && e.html.includes("&lt;script&gt;") && !e.html.includes("Ana <b>"));
    ok("email: contenido mínimo (nombre, hotel, email, teléfono, web, propiedades, escenario realista, UTM, localizar registro)", ["Ana", "ana.garcia@hotelejemplo.es", "+34 600 00 00 00", "https://hotelejemplo.es/reservas", "Propiedades", "Escenario realista", "source=google", "hotel_revenue_leads", "11111111-2222-4333-8444-555555555555"].every((t) => e.html.includes(t) || e.text.includes(t)));
    ok("email: reply_to = lead, to = interno", e.replyTo === "ana.garcia@hotelejemplo.es" && e.to === "info@iaoperators.com");
  }
}

console.log(fails ? `\n${fails} fallo(s), ${passes} OK` : `OK · ${passes} comprobaciones del Hotel Revenue Operator`);
process.exit(fails ? 1 : 0);
