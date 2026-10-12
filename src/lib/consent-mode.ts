// Google Consent Mode v2, modo básico.
//
// El sitio solo carga GTM cuando la persona acepta las cookies; quien rechaza
// no carga ninguna etiqueta. Aun así Google necesita las señales de
// consentimiento explícitas (sobre todo ad_user_data y ad_personalization en
// el EEE) para usar las conversiones y las audiencias en Google Ads.
//
// Orden en el dataLayer al aceptar (al principio de la cola):
//   consent default (todo denegado) → consent update (todo concedido) → eventos ya encolados → gtm.js
// Al retirar el consentimiento con GTM ya cargado:
//   consent update (todo denegado)
//
// Los comandos gtag tienen que entrar en el dataLayer como objeto `arguments`:
// GTM ignora un array normal con la misma forma.

type ConsentState = "granted" | "denied";
type ConsentWindow = Window & { dataLayer?: unknown[]; __CONSENT_DEFAULT_SET__?: boolean };

const CONSENT_TYPES = ["ad_storage", "ad_user_data", "ad_personalization", "analytics_storage"] as const;

function stateFor(value: ConsentState): Record<(typeof CONSENT_TYPES)[number], ConsentState> {
  return Object.fromEntries(CONSENT_TYPES.map((key) => [key, value])) as Record<
    (typeof CONSENT_TYPES)[number],
    ConsentState
  >;
}

// Devuelve el objeto `arguments` que espera GTM para un comando gtag.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function gtagArgs(..._args: unknown[]): IArguments {
  // eslint-disable-next-line prefer-rest-params
  return arguments;
}

function queue(): unknown[] {
  const w = window as ConsentWindow;
  w.dataLayer = w.dataLayer || [];
  return w.dataLayer;
}

/**
 * Llamar justo antes de empujar gtm.js, solo cuando la persona ha aceptado.
 * GTM todavía no está cargado, así que los comandos se colocan al PRINCIPIO
 * de la cola: los eventos que la página ya había encolado (view_item,
 * landing_view...) se procesan después, con el consentimiento ya definido.
 */
export function grantConsentBeforeGtm() {
  if (typeof window === "undefined") return;
  const w = window as ConsentWindow;
  const dl = queue();
  if (w.__CONSENT_DEFAULT_SET__) {
    dl.push(gtagArgs("consent", "update", stateFor("granted")));
    return;
  }
  w.__CONSENT_DEFAULT_SET__ = true;
  dl.unshift(
    gtagArgs("consent", "default", stateFor("denied")),
    gtagArgs("set", "ads_data_redaction", true),
    gtagArgs("consent", "update", stateFor("granted")),
  );
}

/** Retirada del consentimiento en una página donde GTM ya está cargado. */
export function revokeConsent() {
  if (typeof window === "undefined") return;
  queue().push(gtagArgs("consent", "update", stateFor("denied")));
}
