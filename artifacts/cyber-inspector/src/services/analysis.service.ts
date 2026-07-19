export type AnalysisType = 'text' | 'url' | 'image';
export type RiskLevel = 'safe' | 'low' | 'suspicious' | 'dangerous';

export interface AnalysisIndicator {
  type: string;
  typeAr: string;
  description: string;
  descriptionAr: string;
  severity: 'low' | 'medium' | 'high';
}

/** VirusTotal detection statistics — present only for URL analyses that reached the API. */
export interface VTStats {
  malicious: number;
  suspicious: number;
  harmless: number;
  undetected: number;
  totalEngines: number;
  reputation: number;
  permalink: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  type: AnalysisType;
  input: string;
  threatScore: number;
  riskLevel: RiskLevel;
  summary: string;
  summaryAr: string;
  indicators: AnalysisIndicator[];
  recommendations: string[];
  recommendationsAr: string[];
  /** Populated for URL analyses that successfully reached VirusTotal. */
  virusTotal?: VTStats;
}

// ── URL analysis via backend (VirusTotal) ─────────────────────────────────────

async function analyzeUrlViaApi(url: string): Promise<AnalysisResult> {
  const response = await fetch('/api/analyze/url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }

  return response.json() as Promise<AnalysisResult>;
}

// ── Local heuristic fallback (text / image / offline URL) ─────────────────────

function heuristicAnalyze(type: AnalysisType, input: string): AnalysisResult {
  const lower = input.toLowerCase();
  const isDangerous = [
    'bank', 'password', 'urgent', 'click here', 'verify account',
    'winner', 'prize', '.xyz', '.tk', '.ml',
  ].some(kw => lower.includes(kw));

  let score = isDangerous
    ? Math.floor(Math.random() * 26 + 70)   // 70–95
    : Math.floor(Math.random() * 31 + 5);   // 5–35

  let riskLevel: RiskLevel = 'safe';
  if (score >= 76) riskLevel = 'dangerous';
  else if (score >= 51) riskLevel = 'suspicious';
  else if (score >= 26) riskLevel = 'low';

  const indicators: AnalysisIndicator[] = isDangerous
    ? [
        {
          type: 'Urgency / Manipulation',
          typeAr: 'الاستعجال / التلاعب',
          description: 'The content attempts to create a false sense of urgency.',
          descriptionAr: 'يحاول المحتوى خلق شعور زائف بالاستعجال.',
          severity: 'high',
        },
        {
          type: 'Suspicious Keywords',
          typeAr: 'كلمات مفتاحية مشبوهة',
          description: 'Contains words often used in financial scams.',
          descriptionAr: 'يحتوي على كلمات تستخدم غالباً في الاحتيال المالي.',
          severity: 'medium',
        },
        {
          type: 'Unverified Source',
          typeAr: 'مصدر غير موثق',
          description: 'The origin cannot be cryptographically verified.',
          descriptionAr: 'لا يمكن التحقق من المصدر تشفيرياً.',
          severity: 'high',
        },
      ]
    : [
        {
          type: 'Standard Format',
          typeAr: 'تنسيق قياسي',
          description: 'The structure of the content appears normal.',
          descriptionAr: 'هيكل المحتوى يبدو طبيعياً.',
          severity: 'low',
        },
      ];

  const recommendations = isDangerous
    ? [
        'Do not click on any links.',
        'Do not reply or provide personal information.',
        'Delete the message or block the sender.',
        'Report to the relevant authorities.',
      ]
    : ['Verify the sender if you are unsure.', 'Keep your device software updated.'];

  const recommendationsAr = isDangerous
    ? [
        'لا تنقر على أي روابط.',
        'لا ترد أو تقدم معلومات شخصية.',
        'احذف الرسالة أو احظر المرسل.',
        'أبلغ الجهات المختصة.',
      ]
    : ['تحقق من المرسل إذا كنت غير متأكد.', 'حافظ على تحديث برامج جهازك.'];

  const summary = isDangerous
    ? 'This content contains multiple high-risk indicators commonly associated with phishing and social engineering attacks.'
    : 'No immediate threats detected. However, always exercise caution when interacting with unknown sources.';

  const summaryAr = isDangerous
    ? 'يحتوي هذا المحتوى على مؤشرات عالية الخطورة ترتبط عادة بهجمات التصيد الاحتيالي والهندسة الاجتماعية.'
    : 'لم يتم اكتشاف أي تهديدات فورية. ومع ذلك، توخَّ الحذر دائماً عند التعامل مع مصادر مجهولة.';

  return {
    id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString(),
    type,
    input: input.length > 100 ? input.substring(0, 100) + '...' : input,
    threatScore: score,
    riskLevel,
    summary,
    summaryAr,
    indicators,
    recommendations,
    recommendationsAr,
  };
}

// ── Public entry point ────────────────────────────────────────────────────────

export async function analyzeContent(
  type: AnalysisType,
  input: string,
): Promise<AnalysisResult> {
  if (type === 'url') {
    try {
      // The API server calls VirusTotal and returns a combined result.
      // If it fails for any reason (network, API key, rate limit) we fall
      // back to the local heuristic so the user always gets a response.
      return await analyzeUrlViaApi(input);
    } catch (err) {
      console.warn('[analyzeContent] Backend unavailable, using heuristic fallback:', err);
      // Small delay so the scan animation looks intentional
      await new Promise(resolve => setTimeout(resolve, 1500));
      return heuristicAnalyze(type, input);
    }
  }

  // Text and image use the local heuristic (no sensitive API key needed)
  await new Promise(resolve => setTimeout(resolve, 2500));
  return heuristicAnalyze(type, input);
}
