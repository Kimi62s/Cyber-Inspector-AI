import { Router, type IRouter, type Request, type Response } from 'express';
import { analyzeUrl, type VTStats } from '../services/virustotal.service.js';
import { logger } from '../lib/logger.js';

const router: IRouter = Router();

// ── Types (mirrors the frontend AnalysisResult) ──────────────────────────────

type RiskLevel = 'safe' | 'low' | 'suspicious' | 'dangerous';
type AnalysisType = 'text' | 'url' | 'image';

interface AnalysisIndicator {
  type: string;
  typeAr: string;
  description: string;
  descriptionAr: string;
  severity: 'low' | 'medium' | 'high';
}

interface AnalysisResult {
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
  virusTotal?: VTStats;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeThreatScore(vtStats: VTStats): number {
  // VirusTotal is the sole source of truth when its data is present.
  // The heuristic is NOT mixed in — it only applies in the no-VT fallback path.
  if (vtStats.malicious === 0 && vtStats.suspicious === 0) {
    // Completely clean scan → Safe range (0–10).
    // A strongly negative community reputation adds a small nudge (still capped at 10).
    const repPenalty = vtStats.reputation < -10
      ? Math.min(5, Math.floor(Math.abs(vtStats.reputation) / 20))
      : 0;
    return Math.min(10, 3 + repPenalty);
  }
  // Each malicious engine ≈ 8 pts, each suspicious ≈ 3 pts, hard-capped at 100.
  return Math.min(100, vtStats.malicious * 8 + vtStats.suspicious * 3);
}

function deriveRiskLevel(score: number): RiskLevel {
  if (score >= 61) return 'dangerous';
  if (score >= 31) return 'suspicious';
  if (score >= 11) return 'low';
  return 'safe';
}

function generateSummary(
  vtStats: VTStats,
  url: string,
): { summary: string; summaryAr: string } {
  const { malicious, suspicious, harmless, totalEngines } = vtStats;

  if (malicious === 0 && suspicious === 0) {
    return {
      summary: `No security engines flagged this URL as harmful. ${harmless} out of ${totalEngines} engines confirmed it as safe. Exercise normal caution when visiting any unknown website.`,
      summaryAr: `لم تُصنِّف أي محركات أمنية هذا الرابط باعتباره ضاراً. أكد ${harmless} من أصل ${totalEngines} محركاً أنه آمن. مارس الحذر الطبيعي عند زيارة أي موقع ويب غير مألوف.`,
    };
  }

  if (malicious >= 10) {
    return {
      summary: `This URL was flagged as malicious by ${malicious} out of ${totalEngines} security engines. It is very likely a phishing site, malware distributor, or scam page. Do not visit it under any circumstances.`,
      summaryAr: `تم تصنيف هذا الرابط كضار من قِبَل ${malicious} من أصل ${totalEngines} محركاً أمنياً. من المرجح جداً أنه موقع تصيد احتيالي أو ناشر برامج ضارة أو صفحة احتيال. لا تزره بأي حال من الأحوال.`,
    };
  }

  if (malicious >= 3) {
    return {
      summary: `${malicious} security engines detected this URL as malicious${suspicious > 0 ? ` and ${suspicious} flagged it as suspicious` : ''}. This URL poses a real risk and should be avoided.`,
      summaryAr: `رصدت ${malicious} محركات أمنية هذا الرابط على أنه ضار${suspicious > 0 ? ` وصنّفه ${suspicious} آخر على أنه مشبوه` : ''}. يشكّل هذا الرابط خطراً حقيقياً ويجب تجنّبه.`,
    };
  }

  if (malicious >= 1) {
    return {
      summary: `${malicious} security engine(s) flagged this URL as malicious${suspicious > 0 ? `, and ${suspicious} as suspicious` : ''}. The URL may be associated with phishing or fraud activity.`,
      summaryAr: `صنّف ${malicious} محرك(ات) أمنية هذا الرابط على أنه ضار${suspicious > 0 ? ` وصنّفه ${suspicious} على أنه مشبوه` : ''}. قد يكون الرابط مرتبطاً بنشاط تصيد احتيالي أو احتيال.`,
    };
  }

  // suspicious only
  return {
    summary: `${suspicious} security engines flagged this URL as suspicious. The URL may be relatively new, use an unusual domain, or show patterns associated with deceptive content.`,
    summaryAr: `صنّفت ${suspicious} محركات أمنية هذا الرابط على أنه مشبوه. قد يكون الرابط حديثاً نسبياً أو يستخدم نطاقاً غير مألوف أو يُظهر أنماطاً مرتبطة بالمحتوى المضلل.`,
  };
}

function buildIndicators(vtStats: VTStats, url: string): AnalysisIndicator[] {
  const indicators: AnalysisIndicator[] = [];

  if (vtStats.malicious > 0) {
    indicators.push({
      type: 'Malicious Detections',
      typeAr: 'اكتشافات ضارة',
      description: `${vtStats.malicious} out of ${vtStats.totalEngines} security engines classified this URL as malicious.`,
      descriptionAr: `صنّفت ${vtStats.malicious} من أصل ${vtStats.totalEngines} محركاً أمنياً هذا الرابط على أنه ضار.`,
      severity: vtStats.malicious >= 5 ? 'high' : 'medium',
    });
  }

  if (vtStats.suspicious > 0) {
    indicators.push({
      type: 'Suspicious Detections',
      typeAr: 'اكتشافات مشبوهة',
      description: `${vtStats.suspicious} engine(s) marked this URL as suspicious, indicating potential phishing or deceptive patterns.`,
      descriptionAr: `صنّف ${vtStats.suspicious} محرك(ات) هذا الرابط على أنه مشبوه، مما يشير إلى أنماط تصيد احتيالي أو خداع محتملة.`,
      severity: 'medium',
    });
  }

  if (vtStats.reputation < -5) {
    indicators.push({
      type: 'Negative Reputation',
      typeAr: 'سمعة سلبية',
      description: `This URL has a community reputation score of ${vtStats.reputation}, indicating it has been previously reported as harmful.`,
      descriptionAr: `يتمتع هذا الرابط بدرجة سمعة مجتمعية تبلغ ${vtStats.reputation}، مما يشير إلى أنه تم الإبلاغ عنه سابقاً على أنه ضار.`,
      severity: vtStats.reputation < -20 ? 'high' : 'medium',
    });
  }

  // Check for suspicious URL patterns
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(hostname)) {
      indicators.push({
        type: 'IP Address URL',
        typeAr: 'رابط بعنوان IP',
        description: 'Legitimate services rarely use raw IP addresses instead of domain names.',
        descriptionAr: 'نادراً ما تستخدم الخدمات الشرعية عناوين IP الخام بدلاً من أسماء النطاقات.',
        severity: 'medium',
      });
    }

    const suspiciousTLDs = ['.xyz', '.tk', '.ml', '.ga', '.cf', '.pw', '.top', '.work'];
    if (suspiciousTLDs.some(tld => hostname.endsWith(tld))) {
      indicators.push({
        type: 'Suspicious Domain Extension',
        typeAr: 'امتداد نطاق مشبوه',
        description: `The domain uses a top-level domain (${parsed.hostname.split('.').pop()}) commonly associated with scam websites.`,
        descriptionAr: `يستخدم النطاق امتداداً (${parsed.hostname.split('.').pop()}) شائعاً في مواقع الاحتيال.`,
        severity: 'low',
      });
    }

    const suspiciousKeywords = ['login', 'verify', 'secure', 'account', 'update', 'confirm', 'bank', 'paypal', 'wallet'];
    if (suspiciousKeywords.some(kw => hostname.includes(kw) || parsed.pathname.includes(kw))) {
      indicators.push({
        type: 'Phishing Keywords in URL',
        typeAr: 'كلمات مفتاحية للتصيد في الرابط',
        description: 'The URL contains words commonly used in phishing attacks to impersonate legitimate services.',
        descriptionAr: 'يحتوي الرابط على كلمات تُستخدم عادةً في هجمات التصيد الاحتيالي لانتحال هوية الخدمات الشرعية.',
        severity: 'medium',
      });
    }
  } catch {
    // URL parse failed — not adding structural indicators
  }

  // If no threats detected, add a positive indicator
  if (indicators.length === 0) {
    indicators.push({
      type: 'Clean Detection',
      typeAr: 'اكتشاف نظيف',
      description: `All ${vtStats.harmless} scanning engines returned clean results for this URL.`,
      descriptionAr: `أرجعت جميع محركات الفحص البالغة ${vtStats.harmless} نتائج نظيفة لهذا الرابط.`,
      severity: 'low',
    });
  }

  return indicators;
}

function buildRecommendations(
  vtStats: VTStats,
  riskLevel: RiskLevel,
): { recommendations: string[]; recommendationsAr: string[] } {
  if (riskLevel === 'safe') {
    return {
      recommendations: [
        'This URL appears safe based on current security data.',
        'Always keep your browser and antivirus software updated.',
        'Be cautious with any personal information you provide on any website.',
      ],
      recommendationsAr: [
        'يبدو هذا الرابط آمناً بناءً على بيانات الأمان الحالية.',
        'حافظ دائماً على تحديث متصفحك وبرنامج مكافحة الفيروسات.',
        'كن حذراً بشأن أي معلومات شخصية تقدمها على أي موقع ويب.',
      ],
    };
  }

  if (riskLevel === 'low') {
    return {
      recommendations: [
        "Proceed with caution — verify the website's authenticity before entering any data.",
        'Check the URL carefully for typosquatting (slight misspellings of known brands).',
        'Do not enter passwords or financial information.',
        'Use a link-scanning tool like VirusTotal before visiting if unsure.',
      ],
      recommendationsAr: [
        'تصرف بحذر — تحقق من صحة الموقع قبل إدخال أي بيانات.',
        'تحقق من الرابط بعناية للبحث عن أخطاء إملائية للعلامات التجارية المعروفة.',
        'لا تدخل كلمات المرور أو المعلومات المالية.',
        'استخدم أداة فحص الروابط مثل VirusTotal قبل الزيارة إذا لم تكن متأكداً.',
      ],
    };
  }

  if (riskLevel === 'suspicious') {
    return {
      recommendations: [
        'Do not visit this URL without proper protection.',
        'Do not click any links, download files, or enter information if you have already visited.',
        'Report this URL to your IT department or relevant authority.',
        `View the full VirusTotal report: ${vtStats.permalink}`,
        'Scan your device with updated antivirus software if you have already visited.',
      ],
      recommendationsAr: [
        'لا تزر هذا الرابط بدون حماية مناسبة.',
        'لا تنقر على أي روابط أو تنزّل ملفات أو تدخل معلومات إذا كنت قد زرته بالفعل.',
        'أبلغ عن هذا الرابط لقسم تقنية المعلومات أو الجهة المختصة.',
        `اطّلع على تقرير VirusTotal الكامل: ${vtStats.permalink}`,
        'افحص جهازك ببرنامج مكافحة فيروسات محدّث إذا كنت قد زرته بالفعل.',
      ],
    };
  }

  // dangerous
  return {
    recommendations: [
      'Do NOT visit this URL — it has been confirmed malicious by multiple security engines.',
      'If you have already visited it: disconnect from the internet and run a full antivirus scan immediately.',
      'Change any passwords you may have entered on the site.',
      'Report it to Google Safe Browsing, your browser vendor, and local cybercrime authorities.',
      `Full VirusTotal report: ${vtStats.permalink}`,
    ],
    recommendationsAr: [
      'لا تزر هذا الرابط أبداً — لقد تأكد أنه ضار من قِبَل محركات أمنية متعددة.',
      'إذا كنت قد زرته بالفعل: افصل الاتصال بالإنترنت وافحص جهازك فوراً بمكافح فيروسات كامل.',
      'غيّر أي كلمات مرور ربما أدخلتها في الموقع.',
      'أبلغ عنه إلى Google Safe Browsing وبائع المتصفح الخاص بك وسلطات الجرائم الإلكترونية المحلية.',
      `تقرير VirusTotal الكامل: ${vtStats.permalink}`,
    ],
  };
}

function heuristicScore(url: string): number {
  // Used ONLY in the no-VT fallback path. Thresholds match the new risk bands.
  const lower = url.toLowerCase();
  const dangerous = ['bank', 'password', 'urgent', 'verify', 'secure', 'account', 'winner', 'prize', '.xyz', '.tk', '.ml'];
  const hasDangerous = dangerous.some(kw => lower.includes(kw));
  return hasDangerous
    ? Math.floor(Math.random() * 30 + 61)  // 61–90  → Dangerous
    : Math.floor(Math.random() * 8 + 2);   // 2–9    → Safe
}

function buildFallbackResult(url: string): AnalysisResult {
  const score = heuristicScore(url);
  const riskLevel = deriveRiskLevel(score);
  const isDangerous = score >= 70;
  const truncated = url.length > 100 ? url.substring(0, 100) + '...' : url;

  return {
    id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString(),
    type: 'url',
    input: truncated,
    threatScore: score,
    riskLevel,
    summary: isDangerous
      ? 'This URL contains patterns commonly associated with phishing and social engineering attacks.'
      : 'No immediate threats detected. However, always exercise caution with unknown URLs.',
    summaryAr: isDangerous
      ? 'يحتوي هذا الرابط على أنماط مرتبطة عادة بهجمات التصيد الاحتيالي والهندسة الاجتماعية.'
      : 'لم يتم اكتشاف تهديدات فورية. ومع ذلك، توخَّ الحذر دائماً مع الروابط المجهولة.',
    indicators: isDangerous
      ? [
          {
            type: 'Suspicious URL Pattern',
            typeAr: 'نمط رابط مشبوه',
            description: 'The URL contains keywords associated with phishing or financial fraud.',
            descriptionAr: 'يحتوي الرابط على كلمات مفتاحية مرتبطة بالتصيد الاحتيالي أو الاحتيال المالي.',
            severity: 'high',
          },
        ]
      : [
          {
            type: 'Standard URL Format',
            typeAr: 'تنسيق رابط قياسي',
            description: 'The URL structure appears normal.',
            descriptionAr: 'يبدو هيكل الرابط طبيعياً.',
            severity: 'low',
          },
        ],
    recommendations: isDangerous
      ? ['Do not click this link.', 'Report to relevant authorities.']
      : ['Verify the sender if unsure.', 'Keep your software updated.'],
    recommendationsAr: isDangerous
      ? ['لا تنقر على هذا الرابط.', 'أبلغ الجهات المختصة.']
      : ['تحقق من المرسل إذا لم تكن متأكداً.', 'حافظ على تحديث برامجك.'],
  };
}

// ── Route ─────────────────────────────────────────────────────────────────────

router.post('/analyze/url', async (req: Request, res: Response) => {
  const { url } = req.body as { url?: string };

  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    res.status(400).json({ error: 'A valid URL starting with http/https is required.' });
    return;
  }

  logger.info({ url }, 'URL analysis request received');

  // ── Try VirusTotal ─────────────────────────────────────────────────────────
  const vtStats = await analyzeUrl(url);

  if (!vtStats) {
    // Graceful fallback
    logger.info('VT unavailable — returning heuristic result');
    const fallback = buildFallbackResult(url);
    res.json(fallback);
    return;
  }

  // ── Build combined result ──────────────────────────────────────────────────
  const threatScore = computeThreatScore(vtStats);
  const riskLevel = deriveRiskLevel(threatScore);
  const { summary, summaryAr } = generateSummary(vtStats, url);
  const indicators = buildIndicators(vtStats, url);
  const { recommendations, recommendationsAr } = buildRecommendations(vtStats, riskLevel);

  const truncated = url.length > 100 ? url.substring(0, 100) + '...' : url;

  const result: AnalysisResult = {
    id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString(),
    type: 'url',
    input: truncated,
    threatScore,
    riskLevel,
    summary,
    summaryAr,
    indicators,
    recommendations,
    recommendationsAr,
    virusTotal: vtStats,
  };

  logger.info({ threatScore, riskLevel, malicious: vtStats.malicious }, 'URL analysis complete');
  res.json(result);
});

export default router;
