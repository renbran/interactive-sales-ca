import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Microphone, Download, HardDrives, Info } from '@phosphor-icons/react';
import { audioRecordingManager } from '@/lib/audioRecordingManager';

export default function RecordingSettings() {
  const [autoDownload, setAutoDownload] = useState(false);
  const [recordingSupported, setRecordingSupported] = useState(true);
  const [supportedFormats, setSupportedFormats] = useState<string[]>([]);
  const [recordingMetadata, setRecordingMetadata] = useState<Record<string, any>>({});

  useEffect(() => {
    // Check recording support and preferences
    setRecordingSupported(audioRecordingManager.isRecordingSupported());
    setSupportedFormats(audioRecordingManager.getSupportedFormats());
    setAutoDownload(audioRecordingManager.getAutoDownload());
    setRecordingMetadata(audioRecordingManager.getRecordingMetadata());
  }, []);

  const handleAutoDownloadChange = (enabled: boolean) => {
    setAutoDownload(enabled);
    audioRecordingManager.setAutoDownload(enabled);

    if (enabled) {
      // Show notification about auto-download
      console.log('Auto-download enabled: Recordings will be automatically saved to your Downloads folder');
    }
  };

  const clearRecordingHistory = () => {
    localStorage.removeItem('scholarix-recordings-metadata');
    setRecordingMetadata({});
  };

  const totalRecordings = Object.keys(recordingMetadata).length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Microphone className="h-5 w-5 text-blue-500" />
          Recording Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recording Support Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Recording Support</Label>
            <Badge variant={recordingSupported ? 'default' : 'destructive'}>
              {recordingSupported ? 'Supported' : 'Not Supported'}
            </Badge>
          </div>
          
          {!recordingSupported && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Recording Not Available</p>
                <p>Your browser doesn't support audio recording. Please use Chrome, Firefox, or Safari for recording functionality.</p>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Auto-Download Setting */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-download" className="text-sm font-medium">
                Auto-Download Recordings
              </Label>
              <p className="text-xs text-muted-foreground">
                Automatically save call recordings to your Downloads folder when calls end
              </p>
            </div>
            <Switch
              id="auto-download"
              checked={autoDownload}
              onCheckedChange={handleAutoDownloadChange}
              disabled={!recordingSupported}
            />
          </div>

          {autoDownload && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Download className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <p className="font-medium">Auto-Download Enabled</p>
                <p>Recordings will be automatically saved to your Downloads folder as WebM files.</p>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Recording History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Recording History</Label>
            <Badge variant="outline">
              {totalRecordings} Recording{totalRecordings !== 1 ? 's' : ''}
            </Badge>
          </div>

          {totalRecordings > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Recording metadata is stored locally. Audio files are saved to your device when downloaded.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={clearRecordingHistory}
                className="w-full"
              >
                <HardDrives className="h-4 w-4 mr-2" />
                Clear Recording History
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* Technical Information */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Technical Information</Label>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">Optimal Format:</span>{' '}
              {audioRecordingManager.getOptimalFormat()}
            </div>
            <div>
              <span className="font-medium text-foreground">Supported Formats:</span>{' '}
              {supportedFormats.length > 0 ? supportedFormats.join(', ') : 'None'}
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs">
                💡 <strong>Pro Tip:</strong> Recordings are saved locally on your device. 
                Enable auto-download to automatically save them to your Downloads folder after each call.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}