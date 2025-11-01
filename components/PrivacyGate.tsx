import React from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useTranslation } from "../i18n";
import { usePrivacy } from "../store/privacy";
import { useAppPalette } from "../theme/usePalette";

export default function PrivacyGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { state } = usePrivacy();
  const [unlocked, setUnlocked] = React.useState(!state.passcode);
  const [code, setCode] = React.useState("");
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const { t } = useTranslation();

  if (unlocked) return <>{children}</>;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('privacyGate.title','Privacy Lock')}</Text>
      <Text style={styles.text}>{t('privacyGate.subtitle','Enter your passcode to continue.')}</Text>
      <TextInput
        style={styles.input}
        value={code}
        onChangeText={setCode}
        secureTextEntry={true}
        placeholder={t('privacyGate.placeholder','Passcode')}
      />
      <Pressable
        onPress={() => {
          if (code === (state.passcode ?? "")) setUnlocked(true);
          else Alert.alert(t('privacyGate.incorrectTitle','Incorrect'), t('privacyGate.incorrectBody','Wrong passcode.'));
        }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>{t('privacyGate.unlock','Unlock')}</Text>
      </Pressable>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: palette.background,
      padding: 16,
    },
    title: { color: palette.text, fontWeight: "700", fontSize: 18 },
    text: { color: palette.text, opacity: 0.9, marginTop: 6, marginBottom: 8 },
    input: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: palette.text,
      width: "80%",
      marginBottom: 8,
    },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    buttonText: { color: palette.onPrimary, fontWeight: "700" },
  });
}
