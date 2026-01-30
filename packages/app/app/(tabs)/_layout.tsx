import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    chat: '💬',
    settings: '⚙️',
    brain: '🧠',
  };

  return (
    <View className="items-center justify-center">
      <Text className="text-2xl">{icons[name] || '📄'}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#111827',
        },
        headerTitleStyle: {
          color: '#fff',
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: '#1f2937',
          borderTopColor: '#374151',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          headerTitle: 'Molt-OS',
          tabBarIcon: ({ focused }) => <TabIcon name="chat" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="brain"
        options={{
          title: 'Brain',
          headerTitle: 'Brain View',
          tabBarIcon: ({ focused }) => <TabIcon name="brain" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
