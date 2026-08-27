import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { color, font, space } from '@/constants/theme';

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'home', title: 'Home', icon: 'home' },
  { name: 'progress', title: 'Progress', icon: 'camera' },
  { name: 'learn', title: 'Learn', icon: 'play' },
  { name: 'reorder', title: 'Reorder', icon: 'cart' },
  { name: 'more', title: 'More', icon: 'paw' },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.navy,
        tabBarInactiveTintColor: color.textFaint,
        tabBarStyle: styles.bar,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
        sceneStyle: { backgroundColor: color.bg },
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ color: c, focused }) => (
              // The navigator types this as ColorValue; our icons take a string.
              <Icon name={t.icon} size={23} color={String(c)} filled={focused} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: color.surface,
    borderTopWidth: 1,
    borderTopColor: color.borderSoft,
    height: 76,
    paddingTop: space.x2,
  },
  label: {
    fontFamily: font.neueBold,
    fontSize: 11,
    letterSpacing: 0.2,
    marginTop: 2,
  },
  item: { paddingVertical: space.x1 },
});
