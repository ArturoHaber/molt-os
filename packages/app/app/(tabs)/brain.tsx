import { View, Text } from 'react-native';

export default function BrainScreen() {
  return (
    <View className="flex-1 bg-gray-900 items-center justify-center px-8">
      <Text className="text-6xl mb-6">🧠</Text>
      <Text className="text-white text-2xl font-bold text-center mb-4">
        Brain View
      </Text>
      <Text className="text-gray-400 text-center text-base leading-6 mb-8">
        Watch your AI think in real-time. See tool calls, memory access, and reasoning steps as they happen.
      </Text>
      <View className="bg-gray-800 rounded-xl p-6 w-full">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
          <Text className="text-yellow-400 font-semibold">Coming Soon</Text>
        </View>
        <Text className="text-gray-400 text-sm leading-5">
          The Brain visualizer will show a node graph of your AI&apos;s thought process, inspired by Crabwalk. 
          You&apos;ll see exactly what your assistant is doing and why.
        </Text>
      </View>

      {/* Placeholder for future visualization */}
      <View className="mt-8 w-full">
        <Text className="text-gray-500 text-xs uppercase tracking-wider mb-3">Preview</Text>
        <View className="bg-gray-800/50 border border-gray-700 border-dashed rounded-xl p-8 items-center">
          <View className="flex-row items-center gap-4">
            <View className="bg-blue-500/20 border border-blue-500/50 rounded-lg px-3 py-2">
              <Text className="text-blue-400 text-sm">💬 Input</Text>
            </View>
            <Text className="text-gray-600">→</Text>
            <View className="bg-purple-500/20 border border-purple-500/50 rounded-lg px-3 py-2">
              <Text className="text-purple-400 text-sm">🧠 Think</Text>
            </View>
            <Text className="text-gray-600">→</Text>
            <View className="bg-green-500/20 border border-green-500/50 rounded-lg px-3 py-2">
              <Text className="text-green-400 text-sm">🔧 Tool</Text>
            </View>
            <Text className="text-gray-600">→</Text>
            <View className="bg-orange-500/20 border border-orange-500/50 rounded-lg px-3 py-2">
              <Text className="text-orange-400 text-sm">💬 Reply</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
