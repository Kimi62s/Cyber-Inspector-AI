import { AnalysisResult } from '../services/analysis.service';

const STORAGE_KEY = 'cyber-inspector-history';

export function saveAnalysis(result: AnalysisResult): void {
  try {
    const history = getHistory();
    history.unshift(result);
    // Keep max 20
    if (history.length > 20) {
      history.length = 20;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save history', e);
  }
}

export function getHistory(): AnalysisResult[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getAnalysisById(id: string): AnalysisResult | null {
  const history = getHistory();
  return history.find(h => h.id === id) || null;
}
