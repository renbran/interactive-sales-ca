# Recording Playback Guide

## Issue: "Can't open .mp4 file - Encoded in Opus format"

### What Happened

You downloaded a recording and tried to play it in Windows Media Player, but got this error:
```
We can't open call-renbran-anthony-madelo-2025-10-31-22-49-43.mp4.
It's encoded in Opus format which isn't supported.
0xC00D5212
```

### Why This Happens

**Browser Limitation:**
- Chrome/Firefox can only record audio in WebM format with Opus codec
- Safari can record MP4 with AAC (universally compatible)
- Windows Media Player doesn't support Opus codec
- The file extension says `.mp4` but it's actually `.webm` inside

**Format Compatibility:**
| Format | Chrome | Firefox | Safari | Windows Player | VLC | Browser Playback |
|--------|--------|---------|--------|----------------|-----|------------------|
| WebM Opus | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| WebM Vorbis | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| MP4 AAC | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| MP3 | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

---

## Solutions

### ✅ Solution 1: Play in the App (Recommended)

**The recording player in the app works perfectly!**

1. **Don't download** - Just play in the app
2. Go to **Call History**
3. Find your call
4. Click the **Play button** (▶️)
5. Controls: Play, Pause, Volume, Seek

**Benefits:**
- ✅ Works on any device
- ✅ No codec issues
- ✅ Streaming (no download needed)
- ✅ Built-in player with controls

### ✅ Solution 2: Use VLC Media Player

**VLC plays everything!**

1. **Download VLC** (free): https://www.videolan.org/vlc/
2. Install VLC
3. Download your recording from the app
4. Right-click file → **Open with → VLC**

**Benefits:**
- ✅ Plays all formats (Opus, Vorbis, AAC, MP3)
- ✅ Free and open source
- ✅ Works on Windows, Mac, Linux
- ✅ No codec packs needed

### ✅ Solution 3: Play in Browser

**Browsers natively support WebM/Opus:**

1. Download the recording
2. **Drag and drop** the file into Chrome/Firefox
3. Or: Right-click → **Open with → Chrome**

**Benefits:**
- ✅ No additional software
- ✅ Works immediately
- ✅ Playback controls

### ⚠️ Solution 4: Convert to MP3 (Advanced)

**Use an online converter or FFmpeg:**

**Option A: Online Converter (Easy)**
1. Go to https://cloudconvert.com/webm-to-mp3
2. Upload your recording
3. Convert to MP3
4. Download MP3 (plays in Windows Media Player)

**Option B: FFmpeg (Command Line)**
```bash
# Install FFmpeg first: https://ffmpeg.org/download.html
ffmpeg -i call-recording.webm -codec:a libmp3lame -qscale:a 2 call-recording.mp3
```

**Benefits:**
- ✅ MP3 plays everywhere
- ✅ Smaller file size
- ❌ Extra step required

---

## What We Fixed

### Before
- Priority: WebM Opus → OGG Opus → MP4 AAC
- Chrome selected Opus (not compatible with Windows)
- Downloaded as `.mp4` but actually WebM inside

### After
- Priority: MP4 AAC → WebM Vorbis → OGG Opus → WebM Opus
- Tries AAC first (universal)
- Falls back to Vorbis (more compatible than Opus)
- Still won't play in Windows Media Player (browser limitation)

### Why Chrome Can't Record MP3/AAC

**Technical Limitation:**
- Chrome's MediaRecorder API only supports WebM container
- WebM only supports VP8/VP9 video and Opus/Vorbis audio
- MP3/AAC require patent licenses (not in Chrome)
- Safari has licenses, so it can record MP4/AAC

**Summary:**
```
Chrome → WebM (Opus or Vorbis) → Not compatible with Windows Media Player
Safari → MP4 (AAC) → Universal compatibility
```

---

## Best Practice for Your Team

### For Recording
1. ✅ **Use the app's player** - Best experience
2. ✅ **Share via app** - Use Share button (Web Share API)
3. ❌ **Don't rely on Windows Media Player** - It's outdated

### For Playback
**Order of preference:**
1. **In-app player** (fastest, always works)
2. **VLC** (if you need to play offline)
3. **Browser** (drag and drop)
4. **Convert to MP3** (if you must use Windows Media Player)

### For Sharing
**Best methods:**
1. **Email:** Attach recording, recipient uses VLC or browser
2. **WhatsApp:** Upload directly (supports Opus)
3. **Cloud storage:** Google Drive, Dropbox (stream in browser)
4. **Share button in app:** Uses native sharing (best)

---

## Technical Details

### Current Recording Format (Chrome)

```
Container: WebM
Audio Codec: Opus (if supported) or Vorbis (fallback)
Bitrate: 64 kbps (optimized for voice)
Sample Rate: 48000 Hz (default)
Channels: 1 (mono, for voice)
File Extension: .webm (accurate now)
```

### Codec Support by Platform

**Desktop:**
- **Windows Media Player:** MP3, AAC, WMA ❌ No Opus/Vorbis
- **VLC:** Everything ✅
- **Chrome/Firefox:** WebM, Ogg ✅

**Mobile:**
- **iOS (Safari):** MP4 AAC ✅
- **Android (Chrome):** WebM Opus ✅
- **WhatsApp:** Opus, AAC, MP3 ✅

---

## Recommendations

### For Users
1. **Primary:** Use in-app player (no downloads needed)
2. **Backup:** Install VLC for downloaded files
3. **Sharing:** Use Share button or send via WhatsApp

### For Developers (Future Enhancement)
1. **Server-side conversion:**
   - Upload WebM to R2 storage
   - Cloudflare Worker converts to MP3 using FFmpeg WASM
   - Provide MP3 download option
   - Cost: ~$0.001 per conversion

2. **Client-side conversion:**
   - Use `@ffmpeg/ffmpeg` (FFmpeg in browser)
   - Convert before download
   - No server needed
   - Cost: Free (user's CPU)

3. **Format detection:**
   - Show codec info in download modal
   - Recommend player based on format
   - "This file works best with VLC or in-browser playback"

---

## Quick Reference

### Can I play my recording in...?

| Player/App | WebM Opus | MP4 AAC | MP3 |
|------------|-----------|---------|-----|
| **Scholarix CRM App** | ✅ | ✅ | ✅ |
| **VLC Player** | ✅ | ✅ | ✅ |
| **Chrome Browser** | ✅ | ✅ | ✅ |
| **Firefox Browser** | ✅ | ✅ | ✅ |
| **Safari Browser** | ❌ | ✅ | ✅ |
| **Windows Media Player** | ❌ | ✅ | ✅ |
| **macOS QuickTime** | ❌ | ✅ | ✅ |
| **WhatsApp** | ✅ | ✅ | ✅ |
| **Telegram** | ✅ | ✅ | ✅ |

### File Format by Browser

| Browser | Recording Format | Windows Compatible | Recommendation |
|---------|------------------|-------------------|----------------|
| Chrome | WebM Opus | ❌ | Use VLC or in-app player |
| Firefox | WebM Opus | ❌ | Use VLC or in-app player |
| Safari | MP4 AAC | ✅ | Works everywhere |
| Edge | WebM Opus | ❌ | Use VLC or in-app player |

---

## Summary

### The Real Solution

**Don't download recordings** - Just use the built-in player!

**If you must download:**
1. Install VLC (free, universal player)
2. Or play in browser (drag and drop)
3. Or convert to MP3 online

**Windows Media Player is outdated** - It doesn't support modern web codecs (Opus, Vorbis, VP9). Use VLC instead.

---

**Created:** January 2025
**Status:** Current behavior explained
**Impact:** Low (app player works perfectly)
**Recommendation:** Use in-app player, avoid Windows Media Player

---

## Need Help?

**Quick Fix:** Install VLC Player
- Download: https://www.videolan.org/vlc/
- Free, safe, plays everything

**Best Practice:** Use the app's built-in player
- No downloads
- Always works
- Best audio quality
