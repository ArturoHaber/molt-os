import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, Settings, GatewayStatus } from './types';

interface AppState {
  // Messages
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => string;
  updateMessage: (id: string, content: string) => void;
  clearMessages: () => void;

  // Settings
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;

  // Gateway status
  gatewayStatus: GatewayStatus;
  setGatewayStatus: (status: Partial<GatewayStatus>) => void;

  // UI state
  isSending: boolean;
  setIsSending: (sending: boolean) => void;
}

const defaultSettings: Settings = {
  gatewayUrl: 'http://localhost:18789',
  gatewayToken: '',
  botName: 'Clawd',
  theme: 'dark',
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Messages
      messages: [],
      addMessage: (message) => {
        const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const newMessage: Message = {
          ...message,
          id,
          timestamp: Date.now(),
        };
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
        return id;
      },
      updateMessage: (id, content) => {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, content, isStreaming: false } : m
          ),
        }));
      },
      clearMessages: () => set({ messages: [] }),

      // Settings
      settings: defaultSettings,
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      // Gateway status
      gatewayStatus: { connected: false },
      setGatewayStatus: (status) => {
        set((state) => ({
          gatewayStatus: { ...state.gatewayStatus, ...status },
        }));
      },

      // UI state
      isSending: false,
      setIsSending: (sending) => set({ isSending: sending }),
    }),
    {
      name: 'molt-os-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        settings: state.settings,
        // Don't persist messages for now (can enable later)
      }),
    }
  )
);
