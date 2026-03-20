
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { AppMode, Attachment, GroundingSource } from "../types.ts";

// Initialize the client strictly following standard SDK guidelines
// Using process.env.API_KEY directly is a mandatory security and configuration requirement
const createClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

interface GenerateOptions {
  prompt: string;
  attachments?: Attachment[];
  mode: AppMode;
  systemInstruction?: string;
}

interface StreamCallbacks {
  onChunk: (text: string) => void;
  onThinking: (isThinking: boolean) => void;
  onGrounding: (sources: GroundingSource[]) => void;
  onImageGenerated: (base64Image: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

// --- Content Generation (Chat, Reasoning, Search) ---

export const generateContentStream = async (
  options: GenerateOptions,
  callbacks: StreamCallbacks
) => {
  try {
    const ai = createClient();
    const { prompt, attachments, mode, systemInstruction } = options;

    const parts: any[] = [{ text: prompt }];
    
    if (attachments && attachments.length > 0) {
      attachments.forEach(att => {
        parts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: att.data
          }
        });
      });
    }

    let modelName = 'gemini-3-flash-preview'; 
    
    const defaultInstruction = "You are the Verifind AI Assistant. Your goal is to help users navigate the Abuja real estate market, understand our total cost breakdown (including 10% agency and legal fees), and explain our physical verification process. Be professional, transparent, and safety-focused.";

    let config: any = {
      systemInstruction: systemInstruction || defaultInstruction,
    };

    switch (mode) {
      case AppMode.CHAT_ASSISTANT:
      default:
        modelName = 'gemini-3-flash-preview';
        config.tools = [{ googleSearch: {} }];
        break;
    }

    callbacks.onThinking(false);

    const result = await ai.models.generateContentStream({
      model: modelName,
      contents: { parts },
      config: config
    });

    for await (const chunk of result) {
      const text = chunk.text;
      if (text) {
        callbacks.onChunk(text);
      }

      const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks) {
        const sources: GroundingSource[] = groundingChunks
          .map((c: any) => c.web)
          .filter((w: any) => w && w.uri && w.title)
          .map((w: any) => ({ uri: w.uri, title: w.title }));
        
        if (sources.length > 0) {
          callbacks.onGrounding(sources);
        }
      }
    }

    callbacks.onComplete();

  } catch (error) {
    console.error("Gemini API Error:", error);
    callbacks.onError(error instanceof Error ? error : new Error("Unknown error"));
  }
};

// --- Live API Implementation ---

// Implementation follows provided examples for manual Base64 decoding
export const decode = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Implementation follows provided examples for manual Base64 encoding
export const encode = (bytes: Uint8Array) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Manual audio decoding for raw PCM streams returned by the Live API
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export class LiveSession {
  private inputContext: AudioContext | null = null;
  private outputContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private outputNode: GainNode | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private session: any = null;
  
  public onConnect?: () => void;
  public onDisconnect?: () => void;
  public onError?: (e: Error) => void;
  public onVolume?: (level: number) => void;

  constructor() {}

  async connect() {
    try {
      const ai = createClient();
      
      this.inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      this.outputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      this.outputNode = this.outputContext.createGain();
      this.outputNode.connect(this.outputContext.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            this.onConnect?.();
            this.startAudioInput(stream, sessionPromise);
          },
          onmessage: (msg: LiveServerMessage) => this.handleMessage(msg),
          onclose: (e: CloseEvent) => this.disconnect(),
          onerror: (e: ErrorEvent) => {
            console.error(e);
            this.onError?.(new Error("Session error"));
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            // Other available voices: Puck, Charon, Kore, Fenrir
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: "You are the Verifind voice assistant. Help users find homes in Abuja.",
        }
      });
      
      this.session = await sessionPromise;

    } catch (err) {
      console.error("Live Connection Error", err);
      this.onError?.(err instanceof Error ? err : new Error("Could not connect"));
      this.disconnect();
    }
  }

  private startAudioInput(stream: MediaStream, sessionPromise: Promise<any>) {
    if (!this.inputContext) return;

    this.inputSource = this.inputContext.createMediaStreamSource(stream);
    this.processor = this.inputContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      this.onVolume?.(rms);

      const pcmBlob = this.createBlob(inputData);
      
      // CRITICAL: initiate sendRealtimeInput solely after session promise resolves
      sessionPromise.then(session => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    this.inputSource.connect(this.processor);
    this.processor.connect(this.inputContext.destination);
  }

  private async handleMessage(message: LiveServerMessage) {
    if (!this.outputContext || !this.outputNode) return;

    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      // Synchronize next chunk playback to ensure smooth, gapless audio
      this.nextStartTime = Math.max(this.nextStartTime, this.outputContext.currentTime);
      
      const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        this.outputContext,
        24000,
        1
      );

      const source = this.outputContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputNode);
      source.addEventListener('ended', () => this.sources.delete(source));
      
      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      this.sources.add(source);
    }

    if (message.serverContent?.interrupted) {
      this.sources.forEach(s => s.stop());
      this.sources.clear();
      this.nextStartTime = 0;
    }
  }

  disconnect() {
    this.sources.forEach(s => s.stop());
    this.sources.clear();
    this.processor?.disconnect();
    this.inputSource?.disconnect();
    this.inputContext?.close();
    this.outputContext?.close();
    this.session = null;
    this.onDisconnect?.();
  }

  private createBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      // Mandatory MIME type for raw PCM audio input in the Live API
      mimeType: 'audio/pcm;rate=16000',
    };
  }
}
