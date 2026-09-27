import React from 'react';
import { AlertTriangle, ShieldAlert, Info, Bell, CheckCircle } from 'lucide-react';
import { AlertSeverity, ProfileId, WeatherAlert } from '../types/weather';

interface AlertBannerProps {
  alerts: WeatherAlert[];
  activeProfileId: ProfileId;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, activeProfileId }) => {
  if (!alerts || alerts.length === 0) return null;

  const getSeverityStyles = (severity: AlertSeverity) => {
    switch (severity) {
      case 'red':
        return {
          bg: 'bg-rose-50 border-rose-300 text-rose-950',
          badgeBg: 'bg-rose-600 text-white',
          icon: <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />,
          label: 'RED WARNING · TAKE ACTION',
          hindiLabel: 'चेतावनी - कार्रवाई करें',
        };
      case 'orange':
        return {
          bg: 'bg-amber-50 border-amber-300 text-amber-950',
          badgeBg: 'bg-amber-500 text-white',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          label: 'ORANGE ALERT · BE PREPARED',
          hindiLabel: 'अलर्ट - तैयार रहें',
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-50/70 border-yellow-300 text-yellow-950',
          badgeBg: 'bg-yellow-500 text-slate-900 font-bold',
          icon: <Bell className="w-5 h-5 text-yellow-700 shrink-0" />,
          label: 'YELLOW WATCH · BE UPDATED',
          hindiLabel: 'वॉच - अपडेट रहें',
        };
      case 'green':
      default:
        return {
          bg: 'bg-emerald-50/60 border-emerald-200 text-emerald-950',
          badgeBg: 'bg-emerald-600 text-white',
          icon: <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />,
          label: 'GREEN · NO SEVERE WARNING',
          hindiLabel: 'सामान्य - कोई चेतावनी नहीं',
        };
    }
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const styles = getSeverityStyles(alert.severity);
        const isTailored = alert.relevantProfiles.includes(activeProfileId);

        return (
          <div
            key={alert.id}
            className={`border rounded-xl p-4 transition-all shadow-xs ${styles.bg}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
              <div className="flex items-start gap-3">
                {styles.icon}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm ${styles.badgeBg}`}
                    >
                      {styles.label}
                    </span>
                    <span className="text-xs text-slate-600 font-medium">
                      {styles.hindiLabel}
                    </span>
                    {isTailored && (
                      <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-sm">
                        Tailored for your profile
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {alert.headline}
                  </h3>
                </div>
              </div>

              <div className="text-right shrink-0 text-xs text-slate-500 font-mono">
                <div>{alert.effectiveDate}</div>
                <div className="text-[11px] text-slate-400">{alert.expiresDate}</div>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed mb-3 pl-8">
              {alert.description}
            </p>

            <div className="ml-8 p-2.5 rounded-lg bg-white/70 border border-slate-200/80 text-xs flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Recommended Action: </span>
                <span className="text-slate-800">{alert.actionGuidance}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
