import { View, Text, Button, Modal } from "react-native";
import { useState } from "react";

export default function AppModal() {
  const [visible, setVisible] = useState(false);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="Open Modal" onPress={() => setVisible(true)} />
      <Modal visible={visible} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000000aa" }}>
          <View style={{ width: 300, padding: 20, backgroundColor: "white", borderRadius: 10 }}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Hello from Modal!</Text>
            <Button title="Close" onPress={() => setVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
