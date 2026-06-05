// All requests are same-origin and routed to /api/* server routes.
export const API_BASE_URL = "/api";

export async function api<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* noop */
  }
  if (!res.ok && !data) {
    throw new Error(`HTTP ${res.status}`);
  }
  return data as T;
}

export const TEAMS = [
  "MEX","RSA","KOR","CZE","CAN","BIH","QAT","SUI","BRA","MAR","HAI","SCO","USA","PAR","AUS","TUR",
  "GER","CUW","CIV","ECU","NED","JPN","SWE","TUN","BEL","EGY","IRN","NZL","ESP","CPV","KSA","URU",
  "FRA","SEN","IRQ","NOR","ARG","ALG","AUT","JOR","POR","COD","UZB","COL","ENG","CRO","GHA","PAN",
] as const;

export const FLAG_MAP: Record<string, string> = {
  MEX: "mx", RSA: "za", KOR: "kr", CZE: "cz", CAN: "ca", BIH: "ba",
  QAT: "qa", SUI: "ch", BRA: "br", MAR: "ma", HAI: "ht", SCO: "gb-sct",
  USA: "us", PAR: "py", AUS: "au", TUR: "tr", GER: "de", CUW: "cw",
  CIV: "ci", ECU: "ec", NED: "nl", JPN: "jp", SWE: "se", TUN: "tn",
  BEL: "be", EGY: "eg", IRN: "ir", NZL: "nz", ESP: "es", CPV: "cv",
  KSA: "sa", URU: "uy", FRA: "fr", SEN: "sn", IRQ: "iq", NOR: "no",
  ARG: "ar", ALG: "dz", AUT: "at", JOR: "jo", POR: "pt", COD: "cd",
  UZB: "uz", COL: "co", ENG: "gb-eng", CRO: "hr", GHA: "gh", PAN: "pa",
};

export const TEAM_NAMES: Record<string, string> = {
  MEX: "México", RSA: "África do Sul", KOR: "Coreia do Sul", CZE: "República Tcheca",
  CAN: "Canadá", BIH: "Bósnia", QAT: "Catar", SUI: "Suíça", BRA: "Brasil",
  MAR: "Marrocos", HAI: "Haiti", SCO: "Escócia", USA: "Estados Unidos",
  PAR: "Paraguai", AUS: "Austrália", TUR: "Turquia", GER: "Alemanha",
  CUW: "Curaçao", CIV: "Costa do Marfim", ECU: "Equador", NED: "Holanda",
  JPN: "Japão", SWE: "Suécia", TUN: "Tunísia", BEL: "Bélgica", EGY: "Egito",
  IRN: "Irã", NZL: "Nova Zelândia", ESP: "Espanha", CPV: "Cabo Verde",
  KSA: "Arábia Saudita", URU: "Uruguai", FRA: "França", SEN: "Senegal",
  IRQ: "Iraque", NOR: "Noruega", ARG: "Argentina", ALG: "Argélia",
  AUT: "Áustria", JOR: "Jordânia", POR: "Portugal", COD: "RD Congo",
  UZB: "Uzbequistão", COL: "Colômbia", ENG: "Inglaterra", CRO: "Croácia",
  GHA: "Gana", PAN: "Panamá",
};
