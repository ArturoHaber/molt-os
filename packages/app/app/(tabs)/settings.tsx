import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useStore } from '../../lib/store';
import { gateway } from '../../lib/gateway';

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3 px-1">
        {title}
      </Text>
      <View className="bg-gray-800 rounded-xl overflow-hidden">
        {children}
      </View>
    </View>
  );
}

function SettingRow({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
}) {
  return (
    <View className="border-b border-gray-700 last:border-b-0">
      <Text className="text-gray-300 text-sm px-4 pt-3">{label}</Text>
      <TextInput
        className="text-white text-base px-4 py-3"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6b7280"
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const { settings, updateSettings, setGatewayStatus, gatewayStatus, clearMessages } = useStore();
  const [testing, setTesting] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const result = await gateway.checkStatus();
      if (result.ok) {
        setGatewayStatus({ connected: true, ...result.data });
        Alert.alert('Success', 'Connected to gateway!');
      } else {
        setGatewayStatus({ connected: false });
        Alert.alert('Connection Failed', result.error || 'Unknown error');
      }
    } catch (error) {
      setGatewayStatus({ connected: false });
      Alert.alert('Error', (error as Error).message);
    } finally {
      setTesting(false);
    }
  };

  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => clearMessages(),
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-900 px-4 pt-4">
      {/* Connection Status */}
      <View className={`rounded-xl p-4 mb-6 ${gatewayStatus.connected ? 'bg-green-500/20' : 'bg-gray-800'}`}>
        <View className="flex-row items-center gap-3">
          <View className={`w-3 h-3 rounded-full ${gatewayStatus.connected ? 'bg-green-500' : 'bg-gray-500'}`} />
          <Text className={`text-base font-medium ${gatewayStatus.connected ? 'text-green-400' : 'text-gray-400'}`}>
            {gatewayStatus.connected ? 'Connected' : 'Not Connected'}
          </Text>
        </View>
        {gatewayStatus.model && (
          <Text className="text-gray-400 text-sm mt-2">
            Model: {gatewayStatus.model}
          </Text>
        )}
      </View>

      {/* Connection Settings */}
      <SettingSection title="Connection">
        <SettingRow
          label="Gateway URL"
          value={settings.gatewayUrl}
          onChangeText={(text) => updateSettings({ gatewayUrl: text })}
          placeholder="http://localhost:18789"
        />
        <SettingRow
          label="Gateway Token"
          value={settings.gatewayToken}
          onChangeText={(text) => updateSettings({ gatewayToken: text })}
          placeholder="Your gateway token"
          secureTextEntry
        />
        <TouchableOpacity
          onPress={handleTestConnection}
          disabled={testing}
          className="px-4 py-4 border-t border-gray-700"
        >
          <Text className={`text-center font-semibold ${testing ? 'text-gray-500' : 'text-orange-500'}`}>
            {testing ? 'Testing...' : 'Test Connection'}
          </Text>
        </TouchableOpacity>
      </SettingSection>

      {/* Bot Settings */}
      <SettingSection title="Bot">
        <SettingRow
          label="Bot Name"
          value={settings.botName}
          onChangeText={(text) => updateSettings({ botName: text })}
          placeholder="Clawd"
        />
      </SettingSection>

      {/* Appearance */}
      <SettingSection title="Appearance">
        <View className="px-4 py-4 flex-row items-center justify-between">
          <Text className="text-gray-300 text-base">Theme</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => updateSettings({ theme: 'dark' })}
              className={`px-4 py-2 rounded-lg ${settings.theme === 'dark' ? 'bg-orange-500' : 'bg-gray-700'}`}
            >
              <Text className="text-white text-sm">Dark</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => updateSettings({ theme: 'light' })}
              className={`px-4 py-2 rounded-lg ${settings.theme === 'light' ? 'bg-orange-500' : 'bg-gray-700'}`}
            >
              <Text className="text-white text-sm">Light</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SettingSection>

      {/* Data */}
      <SettingSection title="Data">
        <TouchableOpacity onPress={handleClearChat} className="px-4 py-4">
          <Text className="text-red-400 text-base">Clear Chat History</Text>
        </TouchableOpacity>
      </SettingSection>

      {/* Info */}
      <View className="items-center py-8">
        <Text className="text-gray-500 text-sm">Molt-OS v1.0.0</Text>
        <Text className="text-gray-600 text-xs mt-1">Built by R2 & Clawd 🦞</Text>
      </View>
    </ScrollView>
  );
}
