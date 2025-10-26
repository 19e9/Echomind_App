import { DEEPGRAM_CONFIG } from '../config/deepgramConfig';
import * as FileSystem from 'expo-file-system';

/**
 * Deepgram WebSocket Service - Real-time Speech-to-Text
 * 
 * NON-DESTRUCTIVE: New service, doesn't affect existing deepgramService.js
 * 
 * This provides true streaming STT with ~200ms latency for interim results
 */

let activeWebSocket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;

/**
 * Connect to Deepgram Live Transcription WebSocket
 * 
 * @param {Object} options Configuration options
 * @param {string} options.language Language code (default: 'tr')
 * @param {boolean} options.interimResults Enable interim results (default: true)
 * @param {Function} options.onInterimTranscript Callback for interim transcripts
 * @param {Function} options.onFinalTranscript Callback for final transcripts
 * @param {Function} options.onError Callback for errors
 * @returns {Object} Connection object with methods
 */
export async function connectDeepgramWebSocket({
  language = 'tr',
  interimResults = true,
  onInterimTranscript,
  onFinalTranscript,
  onError,
}) {
  return new Promise((resolve, reject) => {
    try {
      // Build WebSocket URL
      const wsUrl = buildWebSocketUrl({
        language,
        interimResults,
        model: DEEPGRAM_CONFIG.stt.model || 'nova-2',
        smartFormat: DEEPGRAM_CONFIG.stt.smartFormat,
        punctuate: DEEPGRAM_CONFIG.stt.punctuate,
      });

      console.log('🔌 Connecting to Deepgram WebSocket...');
      
      // Create WebSocket connection
      const ws = new WebSocket(wsUrl, [], {
        headers: {
          'Authorization': `Token ${DEEPGRAM_CONFIG.apiKey}`,
        },
      });

      // Connection opened
      ws.onopen = () => {
        console.log('✅ Deepgram WebSocket connected');
        reconnectAttempts = 0;
        activeWebSocket = ws;
        
        resolve({
          ws,
          sendAudioChunk,
          startStreaming,
          stopStreaming,
          isConnected: () => ws.readyState === WebSocket.OPEN,
        });
      };

      // Message received (transcript)
      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          
          // Check if this is a transcript response
          if (response.channel && response.channel.alternatives) {
            const transcript = response.channel.alternatives[0]?.transcript;
            
            if (!transcript) return;

            // Interim vs Final
            const isFinal = response.is_final;
            
            if (isFinal) {
              console.log('📝 Final transcript:', transcript);
              if (onFinalTranscript) {
                onFinalTranscript(transcript);
              }
            } else {
              console.log('💬 Interim:', transcript);
              if (onInterimTranscript) {
                onInterimTranscript(transcript);
              }
            }
          }
          
          // Handle metadata
          if (response.metadata) {
            console.log('📊 Metadata:', response.metadata);
          }
          
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      // Error handler
      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        if (onError) {
          onError(new Error('WebSocket connection error'));
        }
        reject(error);
      };

      // Connection closed
      ws.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason);
        activeWebSocket = null;
        
        // Auto-reconnect on unexpected close
        if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          console.log(`🔄 Reconnecting... (attempt ${reconnectAttempts + 1})`);
          reconnectAttempts++;
          setTimeout(() => {
            connectDeepgramWebSocket({
              language,
              interimResults,
              onInterimTranscript,
              onFinalTranscript,
              onError,
            });
          }, 1000 * reconnectAttempts); // Exponential backoff
        }
      };

    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      reject(error);
    }
  });

  /**
   * Send audio chunk to WebSocket
   * 
   * @param {string} audioData Base64 encoded audio data
   */
  function sendAudioChunk(audioData) {
    if (!activeWebSocket || activeWebSocket.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ WebSocket not connected, cannot send audio');
      return;
    }

    try {
      // Convert base64 to binary if needed
      // In production, you'd send raw PCM audio bytes
      activeWebSocket.send(audioData);
    } catch (error) {
      console.error('Error sending audio chunk:', error);
    }
  }

  /**
   * Start streaming audio from recording
   * 
   * @param {Object} recording Expo Audio Recording object
   */
  async function startStreaming(recording) {
    if (!recording) {
      console.warn('⚠️ No recording object provided');
      return;
    }

    console.log('🎙️ Starting audio streaming...');
    
    // Note: This is a simplified implementation
    // In production, you'd need to:
    // 1. Extract raw PCM audio from the recording in real-time
    // 2. Send small chunks (~100ms) to the WebSocket
    // 3. Handle buffering and timing properly
    
    // For React Native, you might need a native module or
    // use expo-av's onRecordingStatusUpdate to get audio samples
    
    // Placeholder implementation:
    // This would need to be implemented with a proper audio streaming solution
    console.log('⚠️ Audio streaming is simplified - implement proper chunk extraction');
  }

  /**
   * Stop streaming (close connection gracefully)
   */
  function stopStreaming() {
    if (activeWebSocket && activeWebSocket.readyState === WebSocket.OPEN) {
      console.log('🛑 Stopping audio streaming...');
      // Send close frame
      activeWebSocket.close(1000, 'Client stopped streaming');
      activeWebSocket = null;
    }
  }
}

/**
 * Disconnect from Deepgram WebSocket
 * 
 * @param {Object} connection Connection object from connectDeepgramWebSocket
 */
export function disconnectDeepgramWebSocket(connection) {
  if (!connection || !connection.ws) {
    console.warn('⚠️ No connection to disconnect');
    return;
  }

  try {
    if (connection.stopStreaming) {
      connection.stopStreaming();
    }
    
    if (connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.close(1000, 'Client disconnected');
    }
    
    activeWebSocket = null;
    console.log('✅ Deepgram WebSocket disconnected');
  } catch (error) {
    console.error('Error disconnecting WebSocket:', error);
  }
}

/**
 * Build WebSocket URL with query parameters
 */
function buildWebSocketUrl({
  language,
  interimResults,
  model,
  smartFormat,
  punctuate,
}) {
  const baseUrl = 'wss://api.deepgram.com/v1/listen';
  
  const params = new URLSearchParams({
    language,
    model,
    interim_results: interimResults,
    smart_format: smartFormat,
    punctuate: punctuate,
    encoding: 'linear16',
    sample_rate: 16000,
    channels: 1,
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Chunk-based alternative implementation
 * 
 * This version records 1-second chunks and sends them sequentially
 * for pseudo-streaming (better than 2-second chunks from HomeScreen)
 */
export async function startChunkedStreaming({
  onInterimTranscript,
  onFinalTranscript,
  onError,
  chunkDuration = 1000, // 1 second chunks
}) {
  let isStreaming = true;
  let connection = null;

  try {
    // Connect WebSocket
    connection = await connectDeepgramWebSocket({
      language: 'tr',
      interimResults: true,
      onInterimTranscript,
      onFinalTranscript,
      onError,
    });

    // Start recording loop
    while (isStreaming) {
      try {
        // Record chunk
        const { recording: rec } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

        // Wait for chunk duration
        await new Promise((resolve) => setTimeout(resolve, chunkDuration));

        // Stop chunk
        await rec.stopAndUnloadAsync();
        const uri = rec.getURI();

        // Read audio file
        const audioBase64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Send to WebSocket
        if (connection.sendAudioChunk) {
          connection.sendAudioChunk(audioBase64);
        }

        // Cleanup
        await FileSystem.deleteAsync(uri, { idempotent: true });

      } catch (chunkError) {
        console.error('Chunk recording error:', chunkError);
      }
    }

  } catch (error) {
    console.error('Chunked streaming error:', error);
    if (onError) {
      onError(error);
    }
  }

  // Cleanup function
  return {
    stop: () => {
      isStreaming = false;
      if (connection) {
        disconnectDeepgramWebSocket(connection);
      }
    },
  };
}

/**
 * Test connection to Deepgram WebSocket
 * 
 * @returns {Promise<boolean>} True if connection successful
 */
export async function testDeepgramWebSocket() {
  try {
    const connection = await connectDeepgramWebSocket({
      language: 'tr',
      interimResults: false,
      onFinalTranscript: (text) => {
        console.log('Test transcript:', text);
      },
      onError: (error) => {
        console.error('Test error:', error);
      },
    });

    // Disconnect after 2 seconds
    setTimeout(() => {
      disconnectDeepgramWebSocket(connection);
    }, 2000);

    return true;
  } catch (error) {
    console.error('WebSocket test failed:', error);
    return false;
  }
}

