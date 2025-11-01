import { useLocalSearchParams } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { useAuth } from '../../../context/AuthContext';
import { channels as seedChannels } from '../../../data/community';
import { auth, db } from '../../../firebase/config';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useAppPalette } from '../../../theme/usePalette';

export default function CommunityCompose() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Compose Post screen loaded');
  useFocusOnRefOnMount(titleRef);
  const { user } = useAuth();
  const params = useLocalSearchParams<{ slug?: string }>();
  const initialSlug = typeof params.slug === 'string' ? params.slug : 'general';
  const [channelSlug, setChannelSlug] = React.useState(initialSlug);
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');

  const save = async () => {
    if (!user) { Alert.alert('Sign in required', 'Please sign in to post.'); return; }
    if (!title.trim() || !body.trim()) { Alert.alert('Missing', 'Title and body are required.'); return; }
    try {
      const channel = seedChannels.find(c => c.slug === channelSlug);
      const channelId = channel?.id ?? channelSlug; // fallback to slug if unknown
      const col = collection(db, 'threads');
      await addDoc(col, {
        channel: channelSlug, // legacy/back-compat
        channelSlug,
        channelId,
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
    <View style={s.container} accessibilityLabel="Compose post" accessible={true}>
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>Compose Post</Text>
      <DisclaimerBanner type="general" compact={true} />
  <Text style={s.label}>Channel</Text>
  <TextInput value={channelSlug} onChangeText={setChannelSlug} style={s.input} placeholder="general" placeholderTextColor={palette.text} />
      <Text style={s.label}>Title</Text>
          <TextInput
            accessibilityLabel="Post title"
            value={title}
            onChangeText={setTitle}
            style={s.input}
            placeholder="Short, clear title (what + when)"
            placeholderTextColor={palette.text}
          />
          <Text style={s.label}>Body</Text>
          <TextInput
            accessibilityLabel="Post body"
            value={body}
            onChangeText={setBody}
            style={[s.input, { minHeight: 140 }]} multiline={true}
            placeholder="Write your post. Keep it specific. Add dates if relevant."
            placeholderTextColor={palette.text}
          />
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
