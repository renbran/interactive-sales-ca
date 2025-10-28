# Audio Recording Troubleshooting Guide

## Issues Fixed

### 1. ❌ Bug: Blob Creation Error
**Problem:** `new Blob([recording.url])` was creating a blob from a URL string instead of actual audio data.

**Fix:** Modified `useAudioRecorder` to return the actual `Blob` object:
```typescript
interface RecordingResult {
  blob: Blob;    // ✅ Added: actual audio data
  url: string;   // Blob URL for playback
  duration: number;
}
```

### 2. ✅ Enhanced Browser Compatibility
Added checks for:
- `navigator.mediaDevices` support
- `MediaRecorder` API availability
- MIME type support detection (webm, mp4, ogg)
- Automatic fallback to supported formats

### 3. ✅ Improved Error Handling
Now catches and reports specific errors:
- `NotAllowedError` - Microphone permission denied
- `NotFoundError` - No microphone detected
- `NotReadableError` - Microphone already in use
- `NotSupportedError` - Browser doesn't support recording

### 4. ✅ Better Audio Quality Settings
Added audio constraints:
```typescript
audio: {
  echoCancellation: true,
  noiseSuppression: true,
  sampleRate: 44100
}
```

## Common Recording Issues & Solutions

### Issue 1: "Recording Failed" Message

**Possible Causes:**
1. **Microphone permissions not granted**
2. **No microphone connected**
3. **Microphone in use by another application**
4. **Browser doesn't support audio recording**

**Solutions:**

#### Check Browser Permissions
**Chrome/Edge:**
1. Click the lock icon in address bar
2. Go to "Site settings"
3. Find "Microphone"
4. Select "Allow"
5. Refresh the page

**Firefox:**
1. Click the shield/lock icon
2. Click "Connection secure"
3. Click "More information"
4. Go to "Permissions" tab
5. Uncheck "Use default" for Microphone
6. Check "Allow"

**Safari:**
1. Safari menu → Settings
2. Websites tab
3. Microphone section
4. Find your site and set to "Allow"

#### Check Microphone Hardware
```bash
# Windows: Check in Settings
Settings → System → Sound → Input → Test microphone

# Mac: Check in System Preferences
System Preferences → Sound → Input → Check levels
```

#### Close Competing Applications
Applications that might block microphone:
- Zoom, Teams, Skype (running in background)
- Discord, Slack (voice channels)
- OBS Studio, Streamlabs
- Other browser tabs using microphone
- Windows/Mac voice assistants

### Issue 2: Recording Starts But Fails to Save

**Check Console Errors:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Share errors with support team

**Common Console Errors:**

```javascript
// Error: No data chunks collected
// Solution: Check microphone is actually producing audio
// Test: Record in another app (Windows Voice Recorder, QuickTime)

// Error: MIME type not supported
// Solution: Browser doesn't support format
// Check supported formats in console logs

// Error: Blob creation failed
// Solution: Memory issue or storage quota
// Clear browser cache and try again
```

### Issue 3: Recording Works But No Sound on Playback

**Causes:**
1. Microphone was muted
2. Recording volume too low
3. Audio codec issue
4. File corruption

**Solutions:**
1. Test microphone volume before call
2. Use browser's built-in audio test:
   ```javascript
   // Open DevTools Console and run:
   navigator.mediaDevices.getUserMedia({ audio: true })
     .then(stream => {
       const audio = new Audio();
       audio.srcObject = stream;
       audio.play();
       // You should hear yourself
       setTimeout(() => stream.getTracks().forEach(t => t.stop()), 5000);
     });
   ```
3. Increase system microphone volume
4. Try a different browser

### Issue 4: Browser Not Supported

**Supported Browsers:**
- ✅ Chrome 47+
- ✅ Edge 79+
- ✅ Firefox 25+
- ✅ Safari 14+
- ✅ Opera 36+
- ❌ Internet Explorer (not supported)

**Check Support:**
Open browser console and run:
```javascript
console.log('getUserMedia:', !!navigator.mediaDevices?.getUserMedia);
console.log('MediaRecorder:', !!window.MediaRecorder);
console.log('Supported formats:', 
  ['audio/webm', 'audio/mp4', 'audio/ogg']
    .filter(f => MediaRecorder.isTypeSupported(f))
);
```

### Issue 5: Recording on Mobile Devices

**Mobile Safari (iOS):**
- Requires iOS 14.3 or later
- Must be in a secure context (HTTPS)
- May require user gesture to start
- Background recording limited

**Chrome/Firefox Mobile (Android):**
- Works on Android 5.0+
- Requires microphone permission in Android settings
- Check app permissions: Settings → Apps → Chrome → Permissions

**Mobile Troubleshooting:**
1. Update browser to latest version
2. Restart browser app
3. Clear browser cache
4. Check Android/iOS permissions
5. Try Chrome if Safari fails (or vice versa)

## Testing Recording Functionality

### Manual Test Steps:

1. **Pre-flight Check:**
   ```
   ✓ Microphone connected and recognized by OS
   ✓ Browser has microphone permission
   ✓ No other apps using microphone
   ✓ Using supported browser
   ```

2. **Start Recording Test:**
   - Open Scholarix CRM
   - Create a test lead
   - Click "Start Call"
   - Watch for success/error message
   - Check browser console for errors

3. **Verify Recording Works:**
   - Speak into microphone for 10 seconds
   - Check recording timer is counting
   - Look for audio waveform (if displayed)
   - Complete the call

4. **Verify Save Works:**
   - Complete call summary
   - Check for success message: "Audio recording saved!"
   - Look for filename in message
   - Check browser downloads folder

5. **Verify Playback:**
   - Find downloaded file
   - Open in media player
   - Verify audio quality
   - Check duration matches call time

### Automated Test Script:

```javascript
// Run in browser console
async function testRecording() {
  console.log('🎙️ Testing Recording Support...\n');
  
  // 1. Check API support
  console.log('1. API Support:');
  console.log('  - getUserMedia:', !!navigator.mediaDevices?.getUserMedia);
  console.log('  - MediaRecorder:', !!window.MediaRecorder);
  
  // 2. Check MIME types
  console.log('\n2. Supported Formats:');
  const formats = ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav'];
  formats.forEach(format => {
    console.log(`  - ${format}:`, MediaRecorder.isTypeSupported(format));
  });
  
  // 3. Test microphone access
  console.log('\n3. Microphone Access:');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('  ✅ Microphone access granted');
    
    // 4. Test recording
    console.log('\n4. Test Recording:');
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      console.log('  ✅ Recording successful');
      console.log('  - Blob size:', blob.size, 'bytes');
      console.log('  - Blob type:', blob.type);
      
      // Cleanup
      stream.getTracks().forEach(track => track.stop());
    };
    
    recorder.start();
    console.log('  - Recording for 3 seconds...');
    
    setTimeout(() => {
      recorder.stop();
    }, 3000);
    
  } catch (error) {
    console.error('  ❌ Test failed:', error.message);
    console.error('  Error name:', error.name);
  }
}

// Run test
testRecording();
```

## Developer Debugging

### Enable Verbose Logging:

Add to CallApp component:
```typescript
// Add after audioRecorder initialization
useEffect(() => {
  console.log('Audio Recorder State:', {
    isRecording: audioRecorder.isRecording,
    isPaused: audioRecorder.isPaused,
    recordingTime: audioRecorder.recordingTime,
    browserSupport: {
      getUserMedia: !!navigator.mediaDevices?.getUserMedia,
      MediaRecorder: !!window.MediaRecorder,
    }
  });
}, [audioRecorder.isRecording, audioRecorder.isPaused, audioRecorder.recordingTime]);
```

### Check Browser Console Logs:

Look for these log messages:
```
✅ "Recording started successfully with MIME type: audio/webm"
✅ "Audio recording saved! File: call-john-doe-2025-10-28-10-30-00.webm"
❌ "Failed to start recording: NotAllowedError"
❌ "MediaRecorder error: ..."
```

### Network Tab (DevTools):

While recording should be local only, check for:
- No failed API calls during recording
- No CORS errors
- No 403/401 errors

## Production Checklist

Before deploying recording feature:

- [ ] Tested on Chrome (latest)
- [ ] Tested on Firefox (latest)
- [ ] Tested on Safari (latest)
- [ ] Tested on Edge (latest)
- [ ] Tested on mobile Chrome (Android)
- [ ] Tested on mobile Safari (iOS)
- [ ] Verified permissions prompt appears
- [ ] Verified error messages are clear
- [ ] Verified auto-download works (if enabled)
- [ ] Verified manual download works
- [ ] Verified file naming is correct
- [ ] Verified audio quality is acceptable
- [ ] Tested with external microphone
- [ ] Tested with headset microphone
- [ ] Tested with Bluetooth headset
- [ ] Verified console has no errors
- [ ] Documented known issues
- [ ] Created user guide for team

## User Guide (For Team Testing)

### How to Enable Recording:

1. **First Time Setup:**
   - Browser will ask for microphone permission
   - Click "Allow" when prompted
   - Refresh page if prompted

2. **Start a Call with Recording:**
   - Click "New Call" or "Start Call"
   - If recording starts, you'll see: ✅ "Call started - Recording audio locally!"
   - If it fails, you'll see troubleshooting tips

3. **During Call:**
   - Red dot indicates recording is active
   - Timer shows recording duration
   - You can pause/resume recording (if needed)

4. **End Call:**
   - Click "End Call"
   - Recording stops automatically
   - File downloads automatically (if enabled)
   - Check Downloads folder for file

5. **Troubleshooting:**
   - If recording fails, check microphone permissions
   - Try refreshing the page
   - Try a different browser
   - Check if microphone works in other apps

### Auto-Download Setting:

Enable in Recording Settings:
- Open Settings → Recording
- Toggle "Auto-download recordings"
- Files download automatically after each call

## Support Contacts

**Recording Issues:**
- Check this guide first
- Open browser console (F12)
- Take screenshots of errors
- Note: Browser, OS, microphone type
- Contact: [Your Support Email/Slack]

**Feature Requests:**
- Recording formats (MP3, WAV)
- Cloud storage integration
- Transcription features
- Contact: [Your Email]

---

**Last Updated:** October 28, 2025
**Version:** 2.0
**Status:** ✅ Fixed - Ready for Testing
