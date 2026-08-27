import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { color } from '@/constants/theme';
import { DemoProvider } from '@/lib/store';

import '../global.css';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DemoProvider>
        <View style={styles.root}>
          <StatusBar style="dark" />
          {/*
            Fonts are declared as @font-face in +html.tsx against her own CDN,
            so there is nothing to await here. font-display: swap means text
            paints immediately in the fallback and reflows into her faces.
          */}
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: color.bg },
              animation: 'slide_from_right',
            }}
          />
        </View>
      </DemoProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
});
