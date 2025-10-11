import { StyleSheet } from 'react-native';

import type { useAppPalette } from '../../theme/usePalette';

export const createStyles = (palette: ReturnType<typeof useAppPalette>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.text,
    marginLeft: 12,
    flex: 1,
  },
  
  statementBox: {
    backgroundColor: palette.card,
    borderLeftWidth: 4,
    borderLeftColor: palette.primary,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 8,
  },
  
  tagline: {
    fontSize: 16,
    lineHeight: 24,
    color: palette.text,
  },
  
  bold: {
    fontWeight: '700',
    color: palette.primary,
  },
  
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  compactScrollView: {
    maxHeight: 240,
    paddingHorizontal: 16,
  },
  
  principleItem: {
    backgroundColor: palette.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: palette.muted,
  },
  
  principleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  principleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text,
    marginLeft: 10,
    flex: 1,
  },
  
  principleDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.text,
    opacity: 0.8,
    marginLeft: 30,
  },
  
  footer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: palette.muted,
    backgroundColor: palette.card,
  },
  
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary + '15',
    borderWidth: 1,
    borderColor: palette.primary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.primary,
    marginHorizontal: 8,
  },
  
  verification: {
    fontSize: 12,
    color: palette.text,
    opacity: 0.7,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16,
  },
});