import { format } from 'date-fns';
import { History, Trash2, FileText, Link as LinkIcon, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAnalysisHistory } from '../hooks/useAnalysisHistory';
import { useLanguage } from '../hooks/useLanguage';
import { Button } from './ui/button';

export function HistoryPanel() {
  const { history, clearHistory } = useAnalysisHistory();
  const { t, language } = useLanguage();

  const getIcon = (type: string) => {
    switch (type) {
      case 'url': return <LinkIcon className="h-4 w-4" />;
      case 'image': return <ImageIcon className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'dangerous': return 'text-chart-4 bg-chart-4/10 border-chart-4/20';
      case 'suspicious': return 'text-chart-3 bg-chart-3/10 border-chart-3/20';
      case 'low': return 'text-chart-5 bg-chart-5/10 border-chart-5/20';
      default: return 'text-chart-2 bg-chart-2/10 border-chart-2/20';
    }
  };

  if (history.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center border-dashed border-primary/20">
        <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">{t('noHistory')}</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl overflow-hidden border-primary/20">
      <div className="px-6 py-4 border-b border-primary/10 flex items-center justify-between bg-primary/5">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">{t('recentAnalyses')}</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={clearHistory} className="text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
          {t('clearHistory')}
        </Button>
      </div>
      <div className="divide-y divide-border/50">
        {history.map((item) => (
          <Link
            key={item.id}
            to={`/result/${item.id}`}
            className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="p-2 bg-secondary rounded-md text-muted-foreground flex-shrink-0">
                {getIcon(item.type)}
              </div>
              <div className="overflow-hidden">
                <div className="truncate text-sm font-medium text-foreground pr-4">
                  {item.input}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(new Date(item.timestamp), 'PPp')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className={`px-2 py-1 rounded text-xs font-semibold uppercase border ${getRiskColor(item.riskLevel)}`}>
                {t(item.riskLevel as any)}
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors rtl:rotate-180" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
