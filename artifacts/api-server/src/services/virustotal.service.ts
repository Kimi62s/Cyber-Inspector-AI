import { logger } from '../lib/logger.js';

const VT_BASE = 'https://www.virustotal.com/api/v3';
const MAX_POLL_ATTEMPTS = 15;
const POLL_INTERVAL_MS = 2000;

export interface VTStats {
  malicious: number;
  suspicious: number;
  harmless: number;
  undetected: number;
  totalEngines: number;
  reputation: number;
  permalink: string;
}

interface VTAnalysisResponse {
  data: {
    id: string;
    attributes: {
      status: 'completed' | 'queued' | 'in-progress';
      stats: {
        malicious: number;
        suspicious: number;
        harmless: number;
        undetected: number;
        timeout?: number;
      };
    };
  };
}

interface VTUrlResponse {
  data: {
    attributes: {
      reputation: number;
      last_analysis_stats: {
        malicious: number;
        suspicious: number;
        harmless: number;
        undetected: number;
      };
    };
  };
}

function vtHeaders(apiKey: string): Record<string, string> {
  return {
    'x-apikey': apiKey,
    'Accept': 'application/json',
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Base64url-encode a string (URL safe, no padding) — used to build VT URL IDs. */
function toBase64Url(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Submit a URL for analysis and poll until the report is ready.
 * Returns null if the API key is missing, the quota is exceeded, or any
 * unrecoverable error occurs — callers should fall back to heuristics.
 */
export async function analyzeUrl(url: string): Promise<VTStats | null> {
  const apiKey = process.env['VIRUSTOTAL_API_KEY'];
  if (!apiKey) {
    logger.warn('VIRUSTOTAL_API_KEY not set — skipping VT lookup');
    return null;
  }

  try {
    // ── Step 1: Submit URL ──────────────────────────────────────────────────
    const submitRes = await fetch(`${VT_BASE}/urls`, {
      method: 'POST',
      headers: {
        ...vtHeaders(apiKey),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ url }),
    });

    if (submitRes.status === 429) {
      logger.warn('VirusTotal rate limit hit — falling back to heuristics');
      return null;
    }
    if (!submitRes.ok) {
      logger.warn({ status: submitRes.status }, 'VT submit failed');
      return null;
    }

    const submitData = (await submitRes.json()) as { data: { id: string } };
    const analysisId = submitData.data.id;

    // ── Step 2: Poll analysis until completed ───────────────────────────────
    let stats: VTAnalysisResponse['data']['attributes']['stats'] | null = null;

    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      await sleep(POLL_INTERVAL_MS);

      const pollRes = await fetch(`${VT_BASE}/analyses/${analysisId}`, {
        headers: vtHeaders(apiKey),
      });

      if (!pollRes.ok) {
        logger.warn({ status: pollRes.status, attempt }, 'VT poll failed');
        break;
      }

      const pollData = (await pollRes.json()) as VTAnalysisResponse;
      const { status, stats: pollStats } = pollData.data.attributes;

      if (status === 'completed') {
        stats = pollStats;
        break;
      }

      logger.debug({ status, attempt }, 'VT analysis not yet complete');
    }

    if (!stats) {
      logger.warn('VT analysis timed out or failed — falling back to heuristics');
      return null;
    }

    // ── Step 3: Fetch URL reputation ────────────────────────────────────────
    let reputation = 0;
    try {
      const urlId = toBase64Url(url);
      const repRes = await fetch(`${VT_BASE}/urls/${urlId}`, {
        headers: vtHeaders(apiKey),
      });
      if (repRes.ok) {
        const repData = (await repRes.json()) as VTUrlResponse;
        reputation = repData.data.attributes.reputation ?? 0;
      }
    } catch (err) {
      logger.debug({ err }, 'VT reputation fetch failed (non-fatal)');
    }

    const totalEngines =
      stats.malicious +
      stats.suspicious +
      stats.harmless +
      stats.undetected +
      (stats.timeout ?? 0);

    return {
      malicious: stats.malicious,
      suspicious: stats.suspicious,
      harmless: stats.harmless,
      undetected: stats.undetected,
      totalEngines,
      reputation,
      permalink: `https://www.virustotal.com/gui/url/${toBase64Url(url)}`,
    };
  } catch (err) {
    logger.error({ err }, 'Unexpected error calling VirusTotal');
    return null;
  }
}
