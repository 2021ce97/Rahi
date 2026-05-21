import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="driver/index" />
      <Stack.Screen name="rider/index" />
    </Stack>
  );
}
