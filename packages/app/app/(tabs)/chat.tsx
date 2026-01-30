import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useStore } from '../../lib/store';
import { gateway } from '../../lib/gateway';

function ChatMessage({ message }: { message: { role: string; content: string; isStreaming?: boolean } }) {
  const isUser = message.role === 'user';

  return (
    <View className={`flex-row ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <View
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-orange-500 rounded-br-sm'
            : 'bg-gray-700 rounded-bl-sm'
        }`}
      >
        <Text className="text-white text-base leading-6">
          {message.content}
          {message.isStreaming && <Text className="text-orange-300">▊</Text>}
        </Text>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  
  const { messages, addMessage, updateMessage, isSending, setIsSending, settings, gatewayStatus } = useStore();

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMessage = input.trim();
    setInput('');
    setIsSending(true);

    // Add user message
    addMessage({ role: 'user', content: userMessage });

    // Add placeholder for assistant response
    const assistantId = addMessage({ role: 'assistant', content: '', isStreaming: true });

    let fullResponse = '';

    try {
      await gateway.sendMessage(userMessage, {
        onChunk: (chunk) => {
          fullResponse += chunk;
          updateMessage(assistantId, fullResponse);
        },
        onComplete: (response) => {
          updateMessage(assistantId, response || fullResponse);
        },
        onError: (error) => {
          updateMessage(assistantId, `Error: ${error.message}`);
        },
      });
    } catch (error) {
      updateMessage(assistantId, `Error: ${(error as Error).message}`);
    } finally {
      setIsSending(false);
    }
  };

  const isConfigured = settings.gatewayUrl && settings.gatewayToken;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-900"
      keyboardVerticalOffset={90}
    >
      {/* Connection Banner */}
      {!isConfigured && (
        <View className="bg-yellow-500/20 border-b border-yellow-500/50 px-4 py-2">
          <Text className="text-yellow-300 text-sm text-center">
            ⚠️ Configure your gateway in Settings to start chatting
          </Text>
        </View>
      )}

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-6xl mb-4">🦞</Text>
            <Text className="text-gray-400 text-lg text-center">
              {isConfigured
                ? `Say hello to ${settings.botName}!`
                : 'Configure your gateway to get started'}
            </Text>
          </View>
        ) : (
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}
      </ScrollView>

      {/* Input */}
      <View className="border-t border-gray-700 bg-gray-800 px-4 py-3">
        <View className="flex-row items-end gap-3">
          <TextInput
            className="flex-1 bg-gray-700 rounded-2xl px-4 py-3 text-white text-base max-h-32"
            placeholder="Type a message..."
            placeholderTextColor="#6b7280"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            multiline
            editable={!isSending && isConfigured}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim() || isSending || !isConfigured}
            className={`w-12 h-12 rounded-full items-center justify-center ${
              input.trim() && !isSending && isConfigured
                ? 'bg-orange-500'
                : 'bg-gray-600'
            }`}
          >
            <Text className="text-white text-xl">
              {isSending ? '⏳' : '↑'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
