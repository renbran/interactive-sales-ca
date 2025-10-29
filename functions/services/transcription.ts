// functions/services/transcription.ts
// AI Transcription Service using OpenAI Whisper and GPT

import type { Env } from '../../src/lib/types';

export interface TranscriptionSegment {
  segment_index: number;
  start_time: number;
  end_time: number;
  text: string;
  confidence: number;
  speaker: 'agent' | 'customer' | 'unknown';
}

export interface CallAnalytics {
  talk_time_agent: number;
  talk_time_customer: number;
  interruptions_count: number;
  silence_duration: number;
  sentiment_score: number;
  engagement_score: number;
  key_topics: string[];
  action_items: string[];
  objections_raised: string[];
  buying_signals: string[];
  next_steps: string;
  call_quality_score: number;
}

export interface TranscriptionResult {
  transcription: string;
  segments: TranscriptionSegment[];
  summary: string;
  key_points: string[];
  sentiment_analysis: {
    overall_sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
    emotional_indicators: string[];
  };
  analytics: CallAnalytics;
}

export class TranscriptionService {
  private env: Env;
  private openaiApiKey: string;

  constructor(env: Env) {
    this.env = env;
    this.openaiApiKey = env.OPENAI_API_KEY || '';
  }

  /**
   * Transcribe audio file using OpenAI Whisper
   */
  async transcribeAudio(audioBuffer: ArrayBuffer, language: string = 'en'): Promise<{
    text: string;
    segments: TranscriptionSegment[];
    confidence: number;
  }> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      // Create form data for Whisper API
      const formData = new FormData();
      formData.append('file', new Blob([audioBuffer], { type: 'audio/mpeg' }), 'recording.mp3');
      formData.append('model', 'whisper-1');
      formData.append('language', language);
      formData.append('response_format', 'verbose_json');
      formData.append('timestamp_granularities[]', 'segment');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      // Convert OpenAI segments to our format
      const segments: TranscriptionSegment[] = result.segments?.map((segment: any, index: number) => ({
        segment_index: index,
        start_time: segment.start,
        end_time: segment.end,
        text: segment.text.trim(),
        confidence: segment.avg_logprob ? Math.exp(segment.avg_logprob) : 0.8,
        speaker: this.detectSpeaker(segment.text, index), // Simple speaker detection
      })) || [];

      return {
        text: result.text,
        segments,
        confidence: segments.reduce((acc, seg) => acc + seg.confidence, 0) / segments.length || 0.8,
      };
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  /**
   * Analyze transcription using GPT for insights
   */
  async analyzeTranscription(transcription: string, segments: TranscriptionSegment[]): Promise<{
    summary: string;
    key_points: string[];
    sentiment_analysis: any;
    analytics: CallAnalytics;
  }> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `
Analyze this sales call transcription and provide detailed insights:

TRANSCRIPTION:
${transcription}

Please provide a JSON response with the following structure:
{
  "summary": "Brief 2-3 sentence summary of the call",
  "key_points": ["Key point 1", "Key point 2", "Key point 3"],
  "sentiment_analysis": {
    "overall_sentiment": "positive|neutral|negative",
    "confidence": 0.85,
    "emotional_indicators": ["indicator1", "indicator2"]
  },
  "analytics": {
    "talk_time_agent": 180,
    "talk_time_customer": 120,
    "interruptions_count": 3,
    "silence_duration": 15,
    "sentiment_score": 0.7,
    "engagement_score": 0.8,
    "key_topics": ["pricing", "product features", "timeline"],
    "action_items": ["Send proposal", "Schedule demo"],
    "objections_raised": ["Price concern", "Feature limitation"],
    "buying_signals": ["Asked about implementation", "Discussed budget"],
    "next_steps": "Send detailed proposal by Friday",
    "call_quality_score": 0.85
  }
}

Focus on sales-specific insights like buying signals, objections, and next steps.
`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a sales call analysis expert. Analyze transcriptions and provide detailed insights in JSON format.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const analysis = JSON.parse(result.choices[0].message.content);

      // Enhance analytics with timing data from segments
      const totalDuration = segments.length > 0 ? segments[segments.length - 1].end_time : 0;
      const agentSegments = segments.filter(s => s.speaker === 'agent');
      const customerSegments = segments.filter(s => s.speaker === 'customer');

      analysis.analytics.talk_time_agent = agentSegments.reduce((acc, seg) => acc + (seg.end_time - seg.start_time), 0);
      analysis.analytics.talk_time_customer = customerSegments.reduce((acc, seg) => acc + (seg.end_time - seg.start_time), 0);

      return analysis;
    } catch (error) {
      console.error('Analysis error:', error);
      throw new Error('Failed to analyze transcription');
    }
  }

  /**
   * Simple speaker detection based on content patterns
   */
  private detectSpeaker(text: string, segmentIndex: number): 'agent' | 'customer' | 'unknown' {
    const lowerText = text.toLowerCase();
    
    // Agent indicators
    const agentPatterns = [
      'thank you for calling',
      'can i help you',
      'let me explain',
      'our product',
      'our service',
      'i can offer',
      'would you like',
      'let me show you',
    ];
    
    // Customer indicators
    const customerPatterns = [
      'i need',
      'i want',
      'i\'m looking for',
      'my budget',
      'i\'m interested',
      'tell me more',
      'how much',
      'what about',
    ];

    const hasAgentPattern = agentPatterns.some(pattern => lowerText.includes(pattern));
    const hasCustomerPattern = customerPatterns.some(pattern => lowerText.includes(pattern));

    if (hasAgentPattern && !hasCustomerPattern) return 'agent';
    if (hasCustomerPattern && !hasAgentPattern) return 'customer';
    
    // Default to alternating speakers if unclear
    return segmentIndex % 2 === 0 ? 'agent' : 'customer';
  }

  /**
   * Process complete call recording with transcription and analysis
   */
  async processCallRecording(
    callId: number,
    audioBuffer: ArrayBuffer,
    language: string = 'en'
  ): Promise<TranscriptionResult> {
    try {
      // Step 1: Transcribe audio
      console.log(`Starting transcription for call ${callId}`);
      const transcriptionResult = await this.transcribeAudio(audioBuffer, language);

      // Step 2: Analyze transcription
      console.log(`Starting analysis for call ${callId}`);
      const analysisResult = await this.analyzeTranscription(
        transcriptionResult.text,
        transcriptionResult.segments
      );

      // Step 3: Combine results
      const result: TranscriptionResult = {
        transcription: transcriptionResult.text,
        segments: transcriptionResult.segments,
        summary: analysisResult.summary,
        key_points: analysisResult.key_points,
        sentiment_analysis: analysisResult.sentiment_analysis,
        analytics: analysisResult.analytics,
      };

      console.log(`Transcription completed for call ${callId}`);
      return result;
    } catch (error) {
      console.error(`Transcription failed for call ${callId}:`, error);
      throw error;
    }
  }
}

/**
 * Factory function to create transcription service
 */
export function createTranscriptionService(env: Env): TranscriptionService {
  return new TranscriptionService(env);
}