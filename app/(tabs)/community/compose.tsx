import React from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import A11yPressable from '../../../components/A11yPressable';
import { useAppPalette } from '../../../theme/usePalette';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useAuth } from '../../../context/AuthContext';
import { db, auth } from '../../../firebase/config';

export const options = { href: null };

export default function CommunityCompose() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Compose Post');
  useFocusOnRefOnMount(titleRef);
  const { user } = useAuth();
  const [channel, setChannel] = React.useState('general');
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');

  const save = async () => {
    if (!user) { Alert.alert('Sign in required', 'Please sign in to post.'); return; }
    if (!title.trim() || !body.trim()) { Alert.alert('Missing', 'Title and body are required.'); return; }
    try {
      const col = collection(db, 'threads');
      await addDoc(col, {
        channel,
        title: title.trim(),
        body: body.trim(),
        authorUid: auth.currentUser?.uid,
        createdAt: serverTimestamp(),
      });
      setTitle(''); setBody('');
      Alert.alert('Posted', 'Your post has been created.');
    } catch (e: any) {
      Alert.alert('Not posted', e?.message || 'Unable to post.');
    }
  };

  return (
    <View style={s.container} accessibilityLabel="Compose post" accessible>
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>Compose Post</Text>
      <Text style={s.label}>Channel</Text>
      <TextInput value={channel} onChangeText={setChannel} style={s.input} placeholder="general" placeholderTextColor={palette.text} />
      <Text style={s.label}>Title</Text>
      <TextInput value={title} onChangeText={setTitle} style={s.input} placeholder="Add a title" placeholderTextColor={palette.text} />
      <Text style={s.label}>Body</Text>
      <TextInput value={body} onChangeText={setBody} style={[s.input, { minHeight: 120 }]} multiline placeholder="Write your post" placeholderTextColor={palette.text} />
      <A11yPressable onPress={save} style={s.button}>
        <Text style={s.buttonText}>Publish</Text>
      </A11yPressable>
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: 16 },
    title: { color: palette.text, fontSize: 22, fontWeight: '700', marginBottom: 8 },
    label: { color: palette.text, opacity: 0.9, marginTop: 8, marginBottom: 4 },
    input: { borderWidth: 1, borderColor: palette.muted, borderRadius: 8, padding: 10, color: palette.text },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 12 },
    buttonText: { color: palette.onPrimary, fontWeight: '700' },
  });
}

