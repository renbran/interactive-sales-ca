import { useEffect, useState } from 'react';
import { Clock } from '@phosphor-icons/react';
import { formatDuration } from '@/lib/callUtils';

interface CallTimerProps {
  startTime: number;
  isActive: boolean;
}

export default function CallTimer({ startTime, isActive }: CallTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isActive]);

  return (
    <div className="flex items-center gap-2 text-lg font-semibold">
      <Clock weight="fill" className="h-5 w-5 text-primary" />
      <span className="font-mono">{formatDuration(elapsed)}</span>
    </div>
  );
}
