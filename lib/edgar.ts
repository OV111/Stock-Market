import { singleflight, TTL } from "@/lib/singleflight";

/**
 * SEC EDGAR — free, no API key, no daily cap (fair-use ~10 req/s). The one
 * hard requirement is a descriptive User-Agent; requests without one are
 * blocked. https://www.sec.gov/os/webmaster-faq#developers
 */
const USER_AGENT = `Stoxly ${process.env.EDGAR_CONTACT_EMAIL ?? "contact@stoxly.app"}`;

async function edgarFetch(url: string, revalidate: number): Promise<Response> {
  return fetch(url, { headers: { "User-Agent": USER_AGENT }, next: { revalidate } });
}

type TickerEntry = { cik_str: number; ticker: string; title: string };

/**
 * EDGAR doesn't know tickers — everything is keyed by CIK. This map is ~10k
 * entries and changes rarely, so it's fetched once and cached for a day
 * rather than re-pulled per symbol lookup.
 */
async function loadTickerToCikMap(): Promise<Map<string, string>> {
  return singleflight("edgar:ticker-map", async () => {
    const res = await edgarFetch(
      "https://www.sec.gov/files/company_tickers.json",
      TTL.EDGAR_TICKER_MAP,
    );
    if (!res.ok) return new Map();

    const data: Record<string, TickerEntry> = await res.json();
    const map = new Map<string, string>();
    for (const entry of Object.values(data)) {
      map.set(entry.ticker.toUpperCase(), String(entry.cik_str).padStart(10, "0"));
    }
    return map;
  });
}

export async function getCikForSymbol(symbol: string): Promise<string | null> {
  const map = await loadTickerToCikMap();
  return map.get(symbol.toUpperCase()) ?? null;
}

export type InsiderFiling = {
  accessionNumber: string;
  filingDate: string;
  formType: string;
  filerName: string | null;
  documentUrl: string;
};

type SubmissionsResponse = {
  filings: {
    recent: {
      form: string[];
      filingDate: string[];
      accessionNumber: string[];
      primaryDocument: string[];
    };
  };
};

const MAX_INSIDER_FILINGS = 10;

/**
 * Recent Form 4 (insider transaction) filings for one symbol. Metadata only —
 * shares/price require parsing the individual filing's XML, not fetched here.
 */
export async function fetchInsiderFilings(symbol: string): Promise<InsiderFiling[]> {
  const cik = await getCikForSymbol(symbol);
  if (!cik) return [];

  return singleflight(`edgar:insider:${cik}`, async () => {
    try {
      const res = await edgarFetch(
        `https://data.sec.gov/submissions/CIK${cik}.json`,
        TTL.EDGAR_FILINGS,
      );
      if (!res.ok) return [];

      const data: SubmissionsResponse = await res.json();
      const { form, filingDate, accessionNumber, primaryDocument } = data.filings.recent;

      const filings: InsiderFiling[] = [];
      // Parallel arrays, most-recent-first — this is EDGAR's own response shape.
      for (let i = 0; i < form.length && filings.length < MAX_INSIDER_FILINGS; i++) {
        if (form[i] !== "4") continue;

        const accessionNoDashes = accessionNumber[i].replace(/-/g, "");
        const cikNoLeadingZeros = String(Number(cik));

        filings.push({
          accessionNumber: accessionNumber[i],
          filingDate: filingDate[i],
          formType: form[i],
          filerName: null, // not present in submissions.json; would need the filing itself
          documentUrl: `https://www.sec.gov/Archives/edgar/data/${cikNoLeadingZeros}/${accessionNoDashes}/${primaryDocument[i]}`,
        });
      }

      return filings;
    } catch (err) {
      console.error(`Failed to fetch insider filings for ${symbol}:`, err);
      return [];
    }
  });
}
