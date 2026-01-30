import { useStore } from './store';

interface SendMessageOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
}

class GatewayClient {
  private baseUrl: string = '';
  private token: string = '';

  configure(url: string, token: string) {
    this.baseUrl = url.replace(/\/$/, '');
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async checkStatus(): Promise<{ ok: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/status`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        return { ok: false, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: (error as Error).message };
    }
  }

  async sendMessage(
    message: string,
    options: SendMessageOptions = {}
  ): Promise<string> {
    const { onChunk, onComplete, onError } = options;

    try {
      // Try streaming endpoint first, fall back to regular
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          message,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check if streaming
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('text/event-stream') || contentType.includes('application/x-ndjson')) {
        // Handle SSE/streaming
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        if (!reader) {
          throw new Error('No response body');
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || 
                               parsed.content || 
                               parsed.text || '';
                if (content) {
                  fullResponse += content;
                  onChunk?.(content);
                }
              } catch {
                // Not JSON, treat as plain text
                fullResponse += data;
                onChunk?.(data);
              }
            } else if (line.trim() && !line.startsWith(':')) {
              // Plain text line
              try {
                const parsed = JSON.parse(line);
                const content = parsed.choices?.[0]?.delta?.content || 
                               parsed.content || 
                               parsed.text || '';
                if (content) {
                  fullResponse += content;
                  onChunk?.(content);
                }
              } catch {
                // Not JSON
              }
            }
          }
        }

        onComplete?.(fullResponse);
        return fullResponse;
      } else {
        // Non-streaming response
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || 
                       data.content || 
                       data.response || 
                       JSON.stringify(data);
        onComplete?.(content);
        return content;
      }
    } catch (error) {
      const err = error as Error;
      onError?.(err);
      throw err;
    }
  }
}

export const gateway = new GatewayClient();

// Initialize from store
const settings = useStore.getState().settings;
gateway.configure(settings.gatewayUrl, settings.gatewayToken);

// Subscribe to settings changes
useStore.subscribe((state) => {
  gateway.configure(state.settings.gatewayUrl, state.settings.gatewayToken);
});
