// Call Quality Indicator Component
// Shows real-time call quality metrics (jitter, packet loss, latency)

import { WifiHigh, WifiMedium, WifiLow, WifiSlash } from '@phosphor-icons/react';
import type { CallQualityMetrics } from '@/lib/webrtcService';

interface CallQualityIndicatorProps {
  metrics: CallQualityMetrics | null;
  compact?: boolean;
}

export default function CallQualityIndicator({ metrics, compact = false }: CallQualityIndicatorProps) {
  if (!metrics) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <WifiSlash weight="regular" className="h-5 w-5" />
        {!compact && <span className="text-sm">No connection</span>}
      </div>
    );
  }

  const { quality, jitter, packetLoss, latency } = metrics;

  // Select icon and color based on quality
  const qualityConfig = {
    excellent: {
      icon: WifiHigh,
      color: 'text-green-500',
      label: 'Excellent',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    good: {
      icon: WifiHigh,
      color: 'text-blue-500',
      label: 'Good',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    fair: {
      icon: WifiMedium,
      color: 'text-yellow-500',
      label: 'Fair',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    poor: {
      icon: WifiLow,
      color: 'text-red-500',
      label: 'Poor',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
  };

  const config = qualityConfig[quality];
  const Icon = config.icon;

  if (compact) {
    return (
      <div className={`flex items-center gap-1 ${config.color}`} title={`Call Quality: ${config.label}`}>
        <Icon weight="fill" className="h-5 w-5" />
        <span className="text-xs font-medium">{config.label}</span>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-4`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Icon weight="fill" className={`h-5 w-5 ${config.color}`} />
        <span className={`font-semibold ${config.color}`}>{config.label} Quality</span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 text-sm">
        {/* Latency */}
        <div>
          <div className="text-muted-foreground text-xs mb-1">Latency</div>
          <div className="font-mono font-semibold">{latency}ms</div>
        </div>

        {/* Jitter */}
        <div>
          <div className="text-muted-foreground text-xs mb-1">Jitter</div>
          <div className="font-mono font-semibold">{jitter}ms</div>
        </div>

        {/* Packet Loss */}
        <div>
          <div className="text-muted-foreground text-xs mb-1">Loss</div>
          <div className="font-mono font-semibold">{packetLoss}%</div>
        </div>
      </div>

      {/* Quality Bar */}
      <div className="mt-3">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              quality === 'excellent'
                ? 'bg-green-500'
                : quality === 'good'
                ? 'bg-blue-500'
                : quality === 'fair'
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{
              width:
                quality === 'excellent'
                  ? '100%'
                  : quality === 'good'
                  ? '75%'
                  : quality === 'fair'
                  ? '50%'
                  : '25%',
            }}
          />
        </div>
      </div>

      {/* Warnings */}
      {quality === 'poor' && (
        <div className="mt-2 text-xs text-red-600">
          Poor connection detected. Consider switching to a better network.
        </div>
      )}
    </div>
  );
}

/**
 * Audio Level Meter Component
 * Shows real-time microphone audio level
 */
interface AudioLevelMeterProps {
  level: number; // 0-100
  label?: string;
}

export function AudioLevelMeter({ level, label = 'Audio Level' }: AudioLevelMeterProps) {
  // Determine color based on level
  const getColor = () => {
    if (level < 10) return 'bg-red-500';
    if (level < 30) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColor = () => {
    if (level < 10) return 'text-red-500';
    if (level < 30) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-mono font-semibold ${getTextColor()}`}>{level}%</span>
      </div>

      {/* Level Bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-100 ${getColor()}`}
          style={{ width: `${level}%` }}
        />
      </div>

      {/* Warning for low level */}
      {level < 10 && (
        <div className="text-xs text-red-500">
          Microphone level too low. Speak louder or adjust microphone.
        </div>
      )}
    </div>
  );
}
