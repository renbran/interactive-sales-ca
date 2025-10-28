// Recording Debug Test
// Add this to browser console to diagnose recording issues

console.log('=== RECORDING DIAGNOSTICS ===');

// Check browser support
console.log('1. Browser Support:');
console.log('   - navigator.mediaDevices:', !!navigator.mediaDevices);
console.log('   - getUserMedia:', !!navigator.mediaDevices?.getUserMedia);
console.log('   - MediaRecorder:', !!window.MediaRecorder);

// Check HTTPS
console.log('2. Security:');
console.log('   - Protocol:', window.location.protocol);
console.log('   - HTTPS:', window.location.protocol === 'https:');

// Check supported formats
console.log('3. Supported Audio Formats:');
const formats = ['audio/webm', 'audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg'];
formats.forEach(format => {
  console.log(`   - ${format}:`, MediaRecorder.isTypeSupported(format));
});

// Test microphone permission
console.log('4. Testing Microphone Access...');
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('   ✅ Microphone access granted!');
    console.log('   - Tracks:', stream.getTracks().length);
    stream.getTracks().forEach(track => {
      console.log(`     - ${track.kind}: ${track.label}`);
      track.stop(); // Clean up
    });
  })
  .catch(error => {
    console.error('   ❌ Microphone access denied:', error.name);
    console.error('   - Error:', error.message);
  });

// Check auto-download setting
console.log('5. Auto-Download Setting:');
console.log('   - Enabled:', localStorage.getItem('scholarix-auto-download-recordings'));

console.log('=========================');
