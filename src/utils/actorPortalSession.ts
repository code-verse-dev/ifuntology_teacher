export const ACTOR_PORTAL_SESSION_KEY = "ifuntology_actor_portal_session";

export type ActorPortalSession = {
  fullName: string;
  email: string;
  image: string | null;
  portalUrl: string;
};

const COOKIE_NAME = ACTOR_PORTAL_SESSION_KEY;
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function getSharedCookieDomain(): string | undefined {
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return undefined;
  if (host.includes("ifuntology.com")) return ".ifuntology.com";
  if (host.includes("customdev.solutions")) return ".customdev.solutions";
  return undefined;
}

function setCookie(value: string) {
  const domain = getSharedCookieDomain();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const domainPart = domain ? `; domain=${domain}` : "";
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}${domainPart}`;
}

function clearCookie() {
  const domain = getSharedCookieDomain();
  const domainPart = domain ? `; domain=${domain}` : "";
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0${domainPart}`;
}

export function getActorPortalUrl(): string {
  const { origin, hostname } = window.location;
  if (hostname.includes("react.customdev.solutions")) {
    return `${origin}/ifuntology/teacher`;
  }
  if (hostname.includes("teacher-erp.ifuntology.com")) {
    return "https://teacher-erp.ifuntology.com";
  }
  return origin.replace(/\/$/, "");
}

export function buildActorPortalSession(
  user: Record<string, unknown> | null | undefined,
  portalUrl: string,
): ActorPortalSession | null {
  if (!user) return null;
  const email = String(user.email ?? "").trim();
  if (!email) return null;
  const firstName = String(user.firstName ?? "").trim();
  const lastName = String(user.lastName ?? "").trim();
  return {
    fullName: `${firstName} ${lastName}`.trim() || email,
    email,
    image: user.image ? String(user.image) : null,
    portalUrl: portalUrl.replace(/\/$/, ""),
  };
}

export function setActorPortalSession(
  user: Record<string, unknown> | null | undefined,
  portalUrl: string = getActorPortalUrl(),
) {
  const session = buildActorPortalSession(user, portalUrl);
  if (!session) return;
  const raw = JSON.stringify(session);
  try {
    localStorage.setItem(ACTOR_PORTAL_SESSION_KEY, raw);
  } catch {
    // ignore quota / private mode
  }
  setCookie(raw);
}

export function clearActorPortalSession() {
  try {
    localStorage.removeItem(ACTOR_PORTAL_SESSION_KEY);
  } catch {
    // ignore
  }
  clearCookie();
}

export function getActorPortalSession(): ActorPortalSession | null {
  try {
    const raw = getCookie() ?? localStorage.getItem(ACTOR_PORTAL_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActorPortalSession;
    if (!parsed?.portalUrl || !parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

function getCookie(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
