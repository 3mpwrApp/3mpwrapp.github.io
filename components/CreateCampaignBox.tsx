import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { Palette } from '../theme/colors';

interface CreateCampaignBoxProps {
  onCreate: (data: {
    title: string;
    summary: string;
    target?: string;
    goalCount?: number;
    contactEmail?: string;
  }) => void;
  palette: Palette;
}

export default function CreateCampaignBox({ onCreate, palette }: CreateCampaignBoxProps) {
  const [title, setTitle] = React.useState("");
  const [summary, setSummary] = React.useState("");
  const [target, setTarget] = React.useState("");
  const [goalCount, setGoalCount] = React.useState("");
  const [contactEmail, setContactEmail] = React.useState("");
  const [expanded, setExpanded] = React.useState(false);
  const canCreate = title.trim().length > 2 && summary.trim().length > 4;

  const boxStyles = StyleSheet.create({
    container: {
      backgroundColor: palette.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: expanded ? 16 : 0,
    },
    headerText: {
      fontSize: 18,
      fontWeight: '700',
      color: palette.text,
    },
    toggleButton: {
      padding: 4,
    },
    toggleText: {
      fontSize: 24,
      color: palette.primary,
    },
    input: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: palette.text,
      marginBottom: 10,
      backgroundColor: palette.background,
    },
    inputLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 4,
      opacity: 0.8,
    },
    createButton: {
      backgroundColor: palette.primary,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 6,
    },
    createButtonText: {
      color: palette.onPrimary,
      fontWeight: "700",
      fontSize: 15,
    },
  });

  const field = (label: string, ph: string, val: string, set: (v: string) => void, multiline = false) => (
    <View>
      <Text style={boxStyles.inputLabel}>{label}</Text>
      <TextInput
        placeholder={ph}
        placeholderTextColor={palette.muted}
        value={val}
        onChangeText={set}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        style={[boxStyles.input, multiline && { minHeight: 80, textAlignVertical: 'top' }]}
      />
    </View>
  );

  return (
    <View style={boxStyles.container}>
      <Pressable  // a11y-scan: accessibilityRole and hitSlop on next lines
        onPress={() => setExpanded(!expanded)} 
        style={boxStyles.header}
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Collapse create campaign form" : "Expand create campaign form"}
        accessibilityState={{ expanded }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={boxStyles.headerText}>✨ Create New Campaign</Text>
        <View style={boxStyles.toggleButton}>
          <Text style={boxStyles.toggleText}>{expanded ? '−' : '+'}</Text>
        </View>
      </Pressable>
      {expanded && (
        <>
          {field("Campaign Title *", "Enter campaign title", title, setTitle)}
          {field("Summary *", "Brief description of your campaign", summary, setSummary, true)}
          {field("Target (Optional)", "e.g., Ministry of Labour", target, setTarget)}
          {field("Goal Count (Optional)", "Number of supporters needed", goalCount, setGoalCount)}
          {field("Contact Email (Optional)", "Your email for campaign updates", contactEmail, setContactEmail)}
          <Pressable // a11y-scan: accessibilityRole and hitSlop on next lines
            onPress={() => {
              if (!canCreate) return;
              onCreate({
                title: title.trim(),
                summary: summary.trim(),
                target: target.trim() || undefined,
                goalCount: goalCount ? Number(goalCount) : undefined,
                contactEmail: contactEmail.trim() || undefined,
              });
              setTitle("");
              setSummary("");
              setTarget("");
              setGoalCount("");
              setContactEmail("");
              setExpanded(false);
            }}
            disabled={!canCreate}
            accessibilityRole="button"
            accessibilityLabel="Create new campaign"
            accessibilityState={{ disabled: !canCreate }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[boxStyles.createButton, !canCreate && { opacity: 0.5 }]}
          >
            <Text style={boxStyles.createButtonText}>
              🚀 Create Campaign
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
