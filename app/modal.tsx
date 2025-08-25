import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function Modal() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
      <Text>This is a modal!</Text>
      <Button title="Close" onPress={() => router.back()} />
    </View>
  );
}
