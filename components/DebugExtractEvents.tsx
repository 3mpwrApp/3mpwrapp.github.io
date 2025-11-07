import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * DEBUG COMPONENT: Extract Events from AsyncStorage
 * 
 * Add this to your Events screen temporarily to extract your 3 TBDIWSG events
 * 
 * Usage:
 * 1. Import this component in app/events/index.impl.tsx
 * 2. Add <DebugExtractEvents /> at the top of the screen
 * 3. Press the button
 * 4. Copy the console output or share the alert
 */
export function DebugExtractEvents() {
  const extractEvents = async () => {
    try {
      const data = await AsyncStorage.getItem('events:local:v1');
      if (!data) {
        Alert.alert('No Events', 'No local events found in AsyncStorage');
        return;
      }
      
      const events = JSON.parse(data);
      console.log('============================================');
      console.log('YOUR 3 TBDIWSG EVENTS FROM ASYNCSTORAGE:');
      console.log('============================================');
      console.log(JSON.stringify(events, null, 2));
      console.log('============================================');
      console.log(`Total events: ${events.length}`);
      
      // Show summary in alert
      const summary = events.map((e: any, i: number) => 
        `Event ${i + 1}: ${e.title}\nDate: ${e.date}\nLocation: ${e.location || 'N/A'}`
      ).join('\n\n');
      
      Alert.alert(
        `Found ${events.length} Events`,
        summary,
        [
          { 
            text: 'Copy to Console', 
            onPress: () => console.log(JSON.stringify(events, null, 2))
          },
          { text: 'OK' }
        ]
      );
      
    } catch (error) {
      console.error('Failed to extract events:', error);
      Alert.alert('Error', 'Failed to extract events: ' + error.message);
    }
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={extractEvents}>
        <Text style={styles.buttonText}>🔍 DEBUG: Extract My 3 Events</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    marginBottom: 10,
  },
  button: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
});
