import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <Text style={styles.title}>رَهی / رَهي (HamRah)</Text>
        <Text style={styles.subtitle}>پورتال خود را انتخاب کنید / خپل پورټل وټاکئ</Text>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#f59e0b' }]} 
          onPress={() => router.push('/driver')}
        >
          <Text style={styles.btnText}>من راننده هستم / زه موټر چلوونکی یم (Driver)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#3b82f6' }]} 
          onPress={() => router.push('/rider')}
        >
          <Text style={styles.btnText}>من مسافر هستم / زه مسافر یم (Rider)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 36, fontWeight: '900', color: 'white', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#9ca3af', marginBottom: 40, textAlign: 'center', lineHeight: 24 },
  button: { width: '100%', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 16, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
