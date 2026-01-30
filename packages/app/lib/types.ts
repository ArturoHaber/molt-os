export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface Settings {
  gatewayUrl: string;
  gatewayToken: string;
  botName: string;
  theme: 'dark' | 'light';
}

export interface GatewayStatus {
  connected: boolean;
  version?: string;
  model?: string;
  availableModels?: string[];
}

export interface BrainEvent {
  type: 'thinking' | 'tool_call' | 'tool_result' | 'message';
  content?: string;
  tool?: string;
  args?: Record<string, unknown>;
  result?: unknown;
  timestamp: number;
}
