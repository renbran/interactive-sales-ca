import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const [supportedFormats, setSupportedFormats] = useState([]);
    const [recordingMetadata, setRecordingMetadata] = useState({});
    useEffect(() => {
        // Check recording support and preferences
        setRecordingSupported(audioRecordingManager.isRecordingSupported());
        setSupportedFormats(audioRecordingManager.getSupportedFormats());
        setAutoDownload(audioRecordingManager.getAutoDownload());
        setRecordingMetadata(audioRecordingManager.getRecordingMetadata());
    }, []);
    const handleAutoDownloadChange = (enabled) => {
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
    return (_jsxs(Card, { className: "w-full", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Microphone, { className: "h-5 w-5 text-blue-500" }), "Recording Settings"] }) }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { className: "text-sm font-medium", children: "Recording Support" }), _jsx(Badge, { variant: recordingSupported ? 'default' : 'destructive', children: recordingSupported ? 'Supported' : 'Not Supported' })] }), !recordingSupported && (_jsxs("div", { className: "flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg", children: [_jsx(Info, { className: "h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" }), _jsxs("div", { className: "text-sm text-yellow-800", children: [_jsx("p", { className: "font-medium", children: "Recording Not Available" }), _jsx("p", { children: "Your browser doesn't support audio recording. Please use Chrome, Firefox, or Safari for recording functionality." })] })] }))] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-1", children: [_jsx(Label, { htmlFor: "auto-download", className: "text-sm font-medium", children: "Auto-Download Recordings" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Automatically save call recordings to your Downloads folder when calls end" })] }), _jsx(Switch, { id: "auto-download", checked: autoDownload, onCheckedChange: handleAutoDownloadChange, disabled: !recordingSupported })] }), autoDownload && (_jsxs("div", { className: "flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg", children: [_jsx(Download, { className: "h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" }), _jsxs("div", { className: "text-sm text-green-800", children: [_jsx("p", { className: "font-medium", children: "Auto-Download Enabled" }), _jsx("p", { children: "Recordings will be automatically saved to your Downloads folder as WebM files." })] })] }))] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { className: "text-sm font-medium", children: "Recording History" }), _jsxs(Badge, { variant: "outline", children: [totalRecordings, " Recording", totalRecordings !== 1 ? 's' : ''] })] }), totalRecordings > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Recording metadata is stored locally. Audio files are saved to your device when downloaded." }), _jsxs(Button, { variant: "outline", size: "sm", onClick: clearRecordingHistory, className: "w-full", children: [_jsx(HardDrives, { className: "h-4 w-4 mr-2" }), "Clear Recording History"] })] }))] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-3", children: [_jsx(Label, { className: "text-sm font-medium", children: "Technical Information" }), _jsxs("div", { className: "space-y-2 text-xs text-muted-foreground", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium text-foreground", children: "Optimal Format:" }), ' ', audioRecordingManager.getOptimalFormat()] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-foreground", children: "Supported Formats:" }), ' ', supportedFormats.length > 0 ? supportedFormats.join(', ') : 'None'] }), _jsx("div", { className: "pt-2 border-t", children: _jsxs("p", { className: "text-xs", children: ["\uD83D\uDCA1 ", _jsx("strong", { children: "Pro Tip:" }), " Recordings are saved locally on your device. Enable auto-download to automatically save them to your Downloads folder after each call."] }) })] })] })] })] }));
}
