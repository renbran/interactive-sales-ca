import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, DownloadSimple, ShareNetwork, SpeakerHigh, SpeakerLow, SpeakerSlash } from '@phosphor-icons/react';
import { audioRecordingManager } from '@/lib/audioRecordingManager';
import { toast } from 'sonner';
export default function RecordingPlayer({ callId, compact = false }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [hasRecording, setHasRecording] = useState(false);
    const audioRef = useRef(null);
    const audioUrlRef = useRef(null);
    useEffect(() => {
        loadRecording();
        return () => {
            // Cleanup blob URL on unmount
            if (audioUrlRef.current) {
                URL.revokeObjectURL(audioUrlRef.current);
            }
        };
    }, [callId]);
    const loadRecording = async () => {
        try {
            setIsLoading(true);
            const recording = await audioRecordingManager.getRecording(callId);
            if (recording) {
                // Create audio element
                const audioUrl = URL.createObjectURL(recording.blob);
                audioUrlRef.current = audioUrl;
                const audio = new Audio(audioUrl);
                audioRef.current = audio;
                // Set up event listeners
                audio.addEventListener('loadedmetadata', () => {
                    setDuration(audio.duration);
                    setIsLoading(false);
                    setHasRecording(true);
                });
                audio.addEventListener('timeupdate', () => {
                    setCurrentTime(audio.currentTime);
                });
                audio.addEventListener('ended', () => {
                    setIsPlaying(false);
                    setCurrentTime(0);
                });
                audio.volume = volume;
            }
            else {
                setIsLoading(false);
                setHasRecording(false);
            }
        }
        catch (error) {
            console.error('Failed to load recording:', error);
            setIsLoading(false);
            setHasRecording(false);
        }
    };
    const togglePlayPause = () => {
        if (!audioRef.current)
            return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
        else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };
    const handleSeek = (value) => {
        if (!audioRef.current)
            return;
        const newTime = value[0];
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };
    const handleVolumeChange = (value) => {
        const newVolume = value[0];
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };
    const handleDownload = async () => {
        try {
            await audioRecordingManager.downloadRecordingByCallId(callId);
            toast.success('Recording downloaded!');
        }
        catch (error) {
            console.error('Failed to download recording:', error);
            toast.error('Failed to download recording');
        }
    };
    const handleShare = async () => {
        try {
            await audioRecordingManager.shareRecordingByCallId(callId);
        }
        catch (error) {
            if (error.message.includes('not supported')) {
                toast.error('Sharing not supported on this device. Use download instead.');
            }
            else {
                console.error('Failed to share recording:', error);
                toast.error('Failed to share recording');
            }
        }
    };
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    const getVolumeIcon = () => {
        if (volume === 0)
            return _jsx(SpeakerSlash, { className: "h-4 w-4" });
        if (volume < 0.5)
            return _jsx(SpeakerLow, { className: "h-4 w-4" });
        return _jsx(SpeakerHigh, { className: "h-4 w-4" });
    };
    if (isLoading) {
        return (_jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx("div", { className: "h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" }), _jsx("span", { children: "Loading recording..." })] }));
    }
    if (!hasRecording) {
        return (_jsx("div", { className: "text-sm text-muted-foreground italic", children: "No recording available" }));
    }
    if (compact) {
        return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: togglePlayPause, className: "h-8 w-8 p-0", children: isPlaying ? (_jsx(Pause, { className: "h-4 w-4", weight: "fill" })) : (_jsx(Play, { className: "h-4 w-4", weight: "fill" })) }), _jsx("div", { className: "flex-1 min-w-0", children: _jsx(Slider, { value: [currentTime], max: duration, step: 0.1, onValueChange: handleSeek, className: "w-full" }) }), _jsxs("span", { className: "text-xs text-muted-foreground whitespace-nowrap", children: [formatTime(currentTime), " / ", formatTime(duration)] }), _jsx(Button, { size: "sm", variant: "ghost", onClick: handleDownload, className: "h-8 w-8 p-0", children: _jsx(DownloadSimple, { className: "h-4 w-4" }) })] }));
    }
    return (_jsxs("div", { className: "space-y-3 p-4 border rounded-lg bg-card", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Button, { size: "lg", variant: "outline", onClick: togglePlayPause, className: "h-12 w-12 rounded-full p-0", children: isPlaying ? (_jsx(Pause, { className: "h-6 w-6", weight: "fill" })) : (_jsx(Play, { className: "h-6 w-6", weight: "fill" })) }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx(Slider, { value: [currentTime], max: duration, step: 0.1, onValueChange: handleSeek, className: "w-full" }), _jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [_jsx("span", { children: formatTime(currentTime) }), _jsx("span", { children: formatTime(duration) })] })] })] }), _jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-2 flex-1 max-w-xs", children: [_jsx("button", { onClick: () => handleVolumeChange([volume === 0 ? 1 : 0]), className: "text-muted-foreground hover:text-foreground transition-colors", children: getVolumeIcon() }), _jsx(Slider, { value: [volume], max: 1, step: 0.1, onValueChange: handleVolumeChange, className: "w-20" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { size: "sm", variant: "outline", onClick: handleDownload, className: "gap-2", children: [_jsx(DownloadSimple, { className: "h-4 w-4" }), "Download"] }), _jsxs(Button, { size: "sm", variant: "outline", onClick: handleShare, className: "gap-2", children: [_jsx(ShareNetwork, { className: "h-4 w-4" }), "Share"] })] })] })] }));
}
