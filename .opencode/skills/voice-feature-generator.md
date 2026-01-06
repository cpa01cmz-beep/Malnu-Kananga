# Voice Feature Generator Skill

## Description
Implement voice features (speech recognition and text-to-speech) following the MA Malnu Kananga project patterns.

## Instructions

When asked to implement voice features:

1. **Use Existing Services**:
   - Import and use `speechRecognitionService.ts` for speech-to-text
   - Import and use `speechSynthesisService.ts` for text-to-speech
   - Use constants from `src/constants.ts`: `VOICE_CONFIG`, `VOICE_COMMANDS`, `ERROR_MESSAGES`

2. **Speech Recognition Pattern**:
   ```typescript
   import { speechRecognitionService } from '../services/speechRecognitionService';
   import { VOICE_CONFIG, ERROR_MESSAGES } from '../constants';

   const startListening = async () => {
     try {
       speechRecognitionService.start({
         language: VoiceLanguage.Indonesian,
         continuous: false,
         interimResults: true,
         onResult: (transcript, isFinal) => {
           console.log('Heard:', transcript);
           if (isFinal) {
             // Process final result
           }
         },
         onError: (error) => {
           // Handle error
           console.error('Speech error:', error);
         }
       });
     } catch (error) {
       console.error(ERROR_MESSAGES.VOICE_NOT_SUPPORTED);
     }
   };

   const stopListening = () => {
     speechRecognitionService.stop();
   };
   ```

3. **Text-to-Speech Pattern**:
   ```typescript
   import { speechSynthesisService } from '../services/speechSynthesisService';

   const speak = (text: string) => {
     speechSynthesisService.speak(text, {
       rate: 1.0,
       pitch: 1.0,
       volume: 1.0,
       lang: VoiceLanguage.Indonesian,
       onStart: () => console.log('Speaking started'),
       onEnd: () => console.log('Speaking ended'),
       onError: (error) => console.error('TTS error:', error)
     });
   };

   const stopSpeaking = () => {
     speechSynthesisService.stop();
   };

   const pauseSpeaking = () => {
     speechSynthesisService.pause();
   };

   const resumeSpeaking = () => {
     speechSynthesisService.resume();
   };
   ```

4. **Voice Commands Pattern**:
   ```typescript
   import { voiceCommandParser } from '../services/voiceCommandParser';
   import { VOICE_COMMANDS } from '../constants';

   const handleVoiceCommand = (transcript: string) => {
     const command = voiceCommandParser.parse(transcript);

     switch (command.type) {
       case 'open_settings':
         // Navigate to settings
         break;
       case 'stop_speaking':
         speechSynthesisService.stop();
         break;
       case 'read_all':
         // Read all messages
         break;
       case 'unknown':
         console.log(ERROR_MESSAGES.COMMAND_NOT_RECOGNIZED);
         break;
     }
   };
   ```

5. **Browser Compatibility Checks**:
   ```typescript
   // Check if speech recognition is supported
   if (!('webkitSpeechRecognition' in window) &&
       !('SpeechRecognition' in window)) {
     console.error(ERROR_MESSAGES.VOICE_NOT_SUPPORTED);
     // Fallback: show message or disable voice features
   }

   // Check if speech synthesis is supported
   if (!('speechSynthesis' in window)) {
     console.error(ERROR_MESSAGES.TTS_NOT_SUPPORTED);
   }

   // Check microphone permission
   const requestMicrophonePermission = async () => {
     try {
       await navigator.mediaDevices.getUserMedia({ audio: true });
       // Permission granted
     } catch (error) {
       console.error(ERROR_MESSAGES.MICROPHONE_DENIED);
       // Show message to user
     }
   };
   ```

6. **Custom Hooks Pattern**:
   ```typescript
   // useVoiceRecognition.ts - already exists, use it as reference
   // Create similar hooks for specific use cases

   const useVoiceCommands = () => {
     const [isListening, setIsListening] = useState(false);
     const [transcript, setTranscript] = useState('');

     const startListening = useCallback(async () => {
       setIsListening(true);
       speechRecognitionService.start({
         language: VoiceLanguage.Indonesian,
         onResult: (text, isFinal) => {
           setTranscript(text);
           if (isFinal) {
             handleCommand(text);
           }
         },
         onError: (error) => {
           console.error(error);
           setIsListening(false);
         }
       });
     }, []);

     const stopListening = useCallback(() => {
       speechRecognitionService.stop();
       setIsListening(false);
     }, []);

     return { isListening, transcript, startListening, stopListening };
   };
   ```

7. **Voice Settings Management**:
   ```typescript
   import { useLocalStorage } from './useLocalStorage';
   import { VOICE_SETTINGS_BACKUP_KEY } from '../constants';

   // Load voice settings from localStorage
   const [voiceSettings, setVoiceSettings] = useLocalStorage(
     STORAGE_KEYS.VOICE_STORAGE_KEY,
     VOICE_CONFIG.DEFAULT_SYNTHESIS_CONFIG
   );

   // Update settings
   const updateVoiceSettings = (newSettings: VoiceSettings) => {
     setVoiceSettings(newSettings);
     // Apply settings to speech services
     speechSynthesisService.setSettings(newSettings);
   };

   // Backup settings
   const backupSettings = () => {
     localStorage.setItem(
       VOICE_SETTINGS_BACKUP_KEY,
       JSON.stringify(voiceSettings)
     );
   };
   ```

8. **Error Handling**:
   - Always check browser compatibility before using voice features
   - Handle microphone permission errors gracefully
   - Show user-friendly error messages from `ERROR_MESSAGES`
   - Provide fallback options when voice is not available
   - Log errors using `logger.error`

9. **Best Practices**:
   - Support Indonesian language by default
   - Handle both interim and final results from recognition
   - Implement debouncing for command processing
   - Use proper timeouts (see `VOICE_CONFIG`)
   - Manage voice queue for sequential playback
   - Provide visual feedback when listening/speaking
   - Allow users to pause/stop voice output
   - Save and restore user voice preferences

10. **Testing**:
   - Mock browser SpeechRecognition and SpeechSynthesis APIs in tests
   - Test error handling (no support, permission denied, timeout)
   - Test command parsing and recognition
   - Test voice settings persistence

11. **Accessibility Considerations**:
   - Provide visual alternatives to voice commands
   - Show transcription of what is being spoken
   - Allow users to adjust speech rate and pitch
   - Respect system accessibility settings
   - Provide keyboard shortcuts as alternatives

## Examples

See existing voice features:
- `src/services/speechRecognitionService.ts` - Recognition service
- `src/services/speechSynthesisService.ts` - Synthesis service
- `src/services/voiceCommandParser.ts` - Command parsing
- `src/hooks/useVoiceCommands.ts` - Voice commands hook
- `src/hooks/useVoiceRecognition.ts` - Recognition hook
- `src/hooks/useVoiceSynthesis.ts` - Synthesis hook

## Voice Commands Available

From `src/constants.ts`:
- `OPEN_SETTINGS`: "buka pengaturan"
- `CLOSE_SETTINGS`: "tutup pengaturan"
- `STOP_SPEAKING`: "hentikan bicara"
- `PAUSE_SPEAKING`: "jeda bicara"
- `RESUME_SPEAKING`: "lanjutkan bicara"
- `READ_ALL`: "baca semua"
- `CLEAR_CHAT`: "hapus chat"
- `SEND_MESSAGE`: "kirim"
- `TOGGLE_VOICE`: "aktifkan suara"

## Browser Support

Voice features work in:
- Chrome (full support)
- Edge (full support)
- Safari (limited support)
- Firefox (no support - use fallback)

## Checklist

Before completing a voice feature:
- [ ] Used existing services (don't reinvent)
- [ ] Checked browser compatibility
- [ ] Handled errors with ERROR_MESSAGES constants
- [ ] Implemented permission checks
- [ ] Added visual feedback
- [ ] Tested on Chrome/Edge/Safari
- [ ] Added tests
- [ ] Documented voice commands
- [ ] Provided fallback for no-support browsers
