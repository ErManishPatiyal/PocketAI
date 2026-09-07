/**
 * PocketAI example host — Phase 1 stub.
 * No chat UI. Proves the RN app can import @pocketai/sdk.
 *
 * @format
 */

import { StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PROTOCOL_VERSION } from '@pocketai/sdk';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent isDarkMode={isDarkMode} />
    </SafeAreaProvider>
  );
}

function AppContent({ isDarkMode }: { isDarkMode: boolean }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          backgroundColor: isDarkMode ? '#0B0F14' : '#F5F7FA',
        },
      ]}>
      <Text style={[styles.title, { color: isDarkMode ? '#F5F7FA' : '#0B0F14' }]}>
        PocketAI Example
      </Text>
      <Text style={[styles.subtitle, { color: isDarkMode ? '#9AA4B2' : '#4B5563' }]}>
        Phase 1 protocol foundation — no chat UI yet.
      </Text>
      <Text style={[styles.meta, { color: isDarkMode ? '#7DD3FC' : '#0369A1' }]}>
        PROTOCOL_VERSION = {PROTOCOL_VERSION}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  meta: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Menlo',
  },
});

export default App;
