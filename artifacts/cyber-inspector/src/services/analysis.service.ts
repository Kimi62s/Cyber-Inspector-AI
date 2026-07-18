export type AnalysisType = 'text' | 'url' | 'image';
export type RiskLevel = 'safe' | 'low' | 'suspicious' | 'dangerous';

export interface AnalysisIndicator {
  type: string;
  typeAr: string;
  description: string;
  descriptionAr: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AnalysisResult {
  id: string;
  timestamp: string; // ISO string to easily serialize to localStorage
  type: AnalysisType;
  input: string;
  threatScore: number;
  riskLevel: RiskLevel;
  summary: string;
  summaryAr: string;
  indicators: AnalysisIndicator[];
  recommendations: string[];
  recommendationsAr: string[];
}

export async function analyzeContent(
  type: AnalysisType,
  input: string
): Promise<AnalysisResult> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2500));

  const lowerInput = input.toLowerCase();
  
  // Basic heuristic
  const isDangerous = ['bank', 'password', 'urgent', 'click here', 'verify account', 'winner', 'prize', '.xyz', '.tk', '.ml'].some(kw => lowerInput.includes(kw));
  
  let score = 0;
  let riskLevel: RiskLevel = 'safe';

  if (isDangerous) {
    score = Math.floor(Math.random() * (95 - 70 + 1) + 70); // 70 to 95
  } else {
    score = Math.floor(Math.random() * (35 - 5 + 1) + 5); // 5 to 35
  }

  if (score >= 76) riskLevel = 'dangerous';
  else if (score >= 51) riskLevel = 'suspicious';
  else if (score >= 26) riskLevel = 'low';
  else riskLevel = 'safe';

  let indicators: AnalysisIndicator[] = [];
  let recommendations: string[] = [];
  let recommendationsAr: string[] = [];
  let summary = '';
  let summaryAr = '';

  if (score >= 70) {
    summary = 'This content contains multiple high-risk indicators commonly associated with phishing and social engineering attacks.';
    summaryAr = 'يحتوي هذا المحتوى على مؤشرات عالية الخطورة ترتبط عادة بهجمات التصيد الاحتيالي والهندسة الاجتماعية.';
    indicators = [
      {
        type: 'Urgency / Manipulation',
        typeAr: 'الاستعجال / التلاعب',
        description: 'The text attempts to create a false sense of urgency.',
        descriptionAr: 'النص يحاول خلق شعور زائف بالاستعجال.',
        severity: 'high'
      },
      {
        type: 'Suspicious Keywords',
        typeAr: 'كلمات مفتاحية مشبوهة',
        description: 'Contains words often used in financial scams.',
        descriptionAr: 'يحتوي على كلمات تستخدم غالباً في الاحتيال المالي.',
        severity: 'medium'
      },
      {
        type: 'Unverified Source',
        typeAr: 'مصدر غير موثق',
        description: 'The origin cannot be cryptographically verified.',
        descriptionAr: 'لا يمكن التحقق من المصدر تشفيرياً.',
        severity: 'high'
      }
    ];
    recommendations = [
      'Do not click on any links.',
      'Do not reply or provide personal information.',
      'Delete the message or block the sender.',
      'Report to the relevant authorities.'
    ];
    recommendationsAr = [
      'لا تنقر على أي روابط.',
      'لا ترد أو تقدم معلومات شخصية.',
      'احذف الرسالة أو احظر المرسل.',
      'أبلغ الجهات المختصة.'
    ];
  } else {
    summary = 'No immediate threats detected. However, always exercise caution when interacting with unknown sources.';
    summaryAr = 'لم يتم اكتشاف أي تهديدات فورية. ومع ذلك، توخى الحذر دائماً عند التعامل مع مصادر مجهولة.';
    indicators = [
      {
        type: 'Standard Format',
        typeAr: 'تنسيق قياسي',
        description: 'The structure of the content appears normal.',
        descriptionAr: 'هيكل المحتوى يبدو طبيعياً.',
        severity: 'low'
      }
    ];
    recommendations = [
      'Verify the sender if you are unsure.',
      'Keep your device software updated.'
    ];
    recommendationsAr = [
      'تحقق من المرسل إذا كنت غير متأكد.',
      'حافظ على تحديث برامج جهازك.'
    ];
  }

  return {
    id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    type,
    input: input.length > 100 ? input.substring(0, 100) + '...' : input, // Keep preview short
    threatScore: score,
    riskLevel,
    summary,
    summaryAr,
    indicators,
    recommendations,
    recommendationsAr
  };
}
