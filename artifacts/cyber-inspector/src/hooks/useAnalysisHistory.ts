import { useState, useEffect, useCallback } from 'react';
import { AnalysisResult } from '../services/analysis.service';
import { getHistory as fetchHistory, saveAnalysis as storageSave, clearHistory as storageClear } from '../lib/storage';

export function useAnalysisHistory() {
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  const refreshHistory = useCallback(() => {
    setHistory(fetchHistory());
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const saveToHistory = useCallback((result: AnalysisResult) => {
    storageSave(result);
    refreshHistory();
  }, [refreshHistory]);

  const clear = useCallback(() => {
    storageClear();
    refreshHistory();
  }, [refreshHistory]);

  return { history, saveToHistory, clearHistory: clear, refreshHistory };
}
