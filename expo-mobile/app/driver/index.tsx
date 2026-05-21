import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import io from 'socket.io-client';

const { width, height } = Dimensions.get('window');

const KABUL_REGION = {
  latitude: 34.52813,
  longitude: 69.17233,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export default function DriverApp() {
  const router = useRouter();
  const [online, setOnline] = useState(true);
  const [incomingRequests, setIncomingRequests] = useState([
     { id: '1', pickup: 'Macroyan', dropoff: 'Airport', offer: '250', time: '2 min ago' },
  ]);

  useEffect(() => {
    // Socket.io connection logic here
  }, []);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={KABUL_REGION}>
         <Marker coordinate={{ latitude: 34.52813, longitude: 69.17233 }} title="You are here" />
      </MapView>

      <SafeAreaView style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={{fontWeight: 'bold', color: '#1f2937'}}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
           style={[styles.onlineToggle, { backgroundColor: online ? '#10b981' : '#6b7280' }]} 
           onPress={() => setOnline(!online)}
        >
          <Text style={{color: 'white', fontWeight: 'bold'}}>
             {online ? 'آنلاین (Online)' : 'آفلاین (Offline)'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>

      {online ? (
        <View style={styles.bottomSheet}>
          <Text style={styles.sheetTitle}>درخواست‌های جدید / نوې غوښتنې</Text>
          
          <ScrollView style={{maxHeight: 250}}>
             {incomingRequests.length > 0 ? incomingRequests.map(req => (
                <View key={req.id} style={styles.requestCard}>
                   <View style={styles.reqTop}>
                      <Text style={styles.reqLoc}>{req.pickup} ➔ {req.dropoff}</Text>
                      <Text style={styles.reqTime}>{req.time}</Text>
                   </View>
                   <Text style={styles.reqOffer}>Offer: <Text style={{fontWeight: 'bold', color: '#10b981'}}>{req.offer} AFN</Text></Text>
                   
                   <View style={styles.actionRow}>
                      <TouchableOpacity style={styles.acceptBtn}>
                         <Text style={styles.acceptTxt}>قبول درخواست / غوښتنه منل</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.counterBtn}>
                         <Text style={styles.counterTxt}>پیشنهاد متقابل / متقابل وړاندیز</Text>
                      </TouchableOpacity>
                   </View>
                </View>
             )) : (
                <View style={styles.emptyState}>
                   <Text style={{color: '#6b7280', textAlign: 'center'}}>در انتظار درخواست / د غوښتنو په تمه...</Text>
                </View>
             )}
          </ScrollView>
        </View>
      ) : (
         <View style={styles.offlineSheet}>
            <Text style={styles.offlineText}>شما آفلاین هستید. / تاسو آفلاین یاست.</Text>
            <Text style={styles.subText}>برای دریافت درخواست آنلاین شوید.</Text>
         </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  map: { width: width, height: height },
  header: { position: 'absolute', top: 50, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, zIndex: 10 },
  backBtn: { backgroundColor: 'white', padding: 12, borderRadius: 8, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  onlineToggle: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  bottomSheet: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'white', padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 20, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10 },
  offlineSheet: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#f3f4f6', padding: 40, borderTopLeftRadius: 24, borderTopRightRadius: 24, alignItems: 'center' },
  sheetTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 15, textAlign: 'center' },
  offlineText: { fontSize: 18, fontWeight: 'bold', color: '#4b5563', marginBottom: 10 },
  subText: { fontSize: 14, color: '#9ca3af' },
  requestCard: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 },
  reqTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  reqLoc: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  reqTime: { fontSize: 12, color: '#9ca3af' },
  reqOffer: { fontSize: 15, color: '#4b5563', marginBottom: 15 },
  actionRow: { flexDirection: 'row', gap: 10 },
  acceptBtn: { flex: 1, backgroundColor: '#f59e0b', padding: 12, borderRadius: 8, alignItems: 'center' },
  acceptTxt: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  counterBtn: { flex: 1, backgroundColor: '#e2e8f0', padding: 12, borderRadius: 8, alignItems: 'center' },
  counterTxt: { color: '#475569', fontWeight: 'bold', fontSize: 13 }
});
