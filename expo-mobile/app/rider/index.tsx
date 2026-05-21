import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, SafeAreaView, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import io from 'socket.io-client';

const { width, height } = Dimensions.get('window');

// Default to Kabul Coordinates
const KABUL_REGION = {
  latitude: 34.52813,
  longitude: 69.17233,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function RiderApp() {
  const router = useRouter();
  const [pickup, setPickup] = useState('Shar-e-Naw');
  const [dropoff, setDropoff] = useState('Karte Seh');
  const [offer, setOffer] = useState('150');
  const [status, setStatus] = useState('idle'); // idle, requested, accepted

  useEffect(() => {
    // Initialize Socket.io connecting to active backend
    // const socket = io('https://your-backend-url.com'); 
  }, []);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={KABUL_REGION}>
         <Marker coordinate={{ latitude: 34.52813, longitude: 69.17233 }} title="Kabul (کابل)" />
      </MapView>

      <SafeAreaView style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={{fontWeight: 'bold', color: '#1f2937'}}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>اپلیکیشن مسافر / د مسافر اپلیکیشن</Text>
      </SafeAreaView>

      <View style={styles.bottomSheet}>
        {status === 'idle' && (
          <View>
            <Text style={styles.label}>مکان مبدا / د پورته کیدو ځای</Text>
            <TextInput style={styles.input} value={pickup} onChangeText={setPickup} placeholder="Pickup Location" />

            <Text style={styles.label}>مقصد / د کوزیدو ځای</Text>
            <TextInput style={styles.input} value={dropoff} onChangeText={setDropoff} placeholder="Dropoff Location" />

            <Text style={styles.label}>پیشنهاد شما افغانی / ستا وړاندیز (AFN)</Text>
            <TextInput style={styles.input} value={offer} keyboardType="numeric" onChangeText={setOffer} placeholder="Offer Amount" />

            <TouchableOpacity style={styles.button} onPress={() => setStatus('requested')}>
              <Text style={styles.buttonText}>درخواست سفر / موټر غوښتل</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'requested' && (
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <ActivityIndicator size="large" color="#3b82f6" style={{marginBottom: 15}} />
            <Text style={styles.findingText}>در حال جستجوی راننده / موټر چلوونکی لټول...</Text>
            <Text style={styles.subText}>Offering {offer} AFN</Text>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setStatus('idle')}>
              <Text style={styles.cancelBtnText}>لغو درخواست / غوښتنه لغوه کول (Cancel)</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  map: { width: width, height: height },
  header: { position: 'absolute', top: 50, width: '100%', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, zIndex: 10 },
  backBtn: { backgroundColor: 'white', padding: 12, borderRadius: 8, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  headerTitle: { flex: 1, textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.9)', marginHorizontal: 10, paddingVertical: 12, borderRadius: 8, fontWeight: 'bold', fontSize: 16, overflow: 'hidden' },
  bottomSheet: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'white', padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 20, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10 },
  label: { fontSize: 13, color: '#4b5563', marginBottom: 6, marginTop: 12, fontWeight: '600' },
  input: { backgroundColor: '#f3f4f6', borderRadius: 12, padding: 16, marginBottom: 8, fontSize: 16, color: '#111827' },
  button: { backgroundColor: '#3b82f6', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  findingText: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', textAlign: 'center' },
  subText: { fontSize: 14, color: '#6b7280', marginTop: 8 },
  cancelBtn: { marginTop: 24, backgroundColor: '#fee2e2', padding: 16, borderRadius: 12, width: '100%', alignItems: 'center' },
  cancelBtnText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 }
});
