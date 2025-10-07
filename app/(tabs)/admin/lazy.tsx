import React from 'react';

const isTest = process.env.NODE_ENV === 'test' || (typeof jest !== 'undefined');

export const AuditPanel = isTest
  ? require('./panels/AuditPanel.tsx').default
  : React.lazy(() => import('./panels/AuditPanel.tsx').then(m => ({ default: m.default })));

export const FaqEditor = isTest
  ? require('./panels/FaqEditor.tsx').default
  : React.lazy(() => import('./panels/FaqEditor.tsx').then(m => ({ default: m.default })));

export const ContentReview = isTest
  ? require('./panels/ContentReview.tsx').default
  : React.lazy(() => import('./panels/ContentReview.tsx').then(m => ({ default: m.default })));

export default { AuditPanel, FaqEditor, ContentReview };
