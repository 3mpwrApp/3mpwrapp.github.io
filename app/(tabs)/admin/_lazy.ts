import React from 'react';

const isTest = process.env.NODE_ENV === 'test' || (typeof jest !== 'undefined');

export const AuditPanel = isTest
  ? require('./panels/AuditPanel').default
  : React.lazy(() => import('./panels/AuditPanel').then(m => ({ default: m.default })));

export const FaqEditor = isTest
  ? require('./panels/FaqEditor').default
  : React.lazy(() => import('./panels/FaqEditor').then(m => ({ default: m.default })));

export const ContentReview = isTest
  ? require('./panels/ContentReview').default
  : React.lazy(() => import('./panels/ContentReview').then(m => ({ default: m.default })));

export default { AuditPanel, FaqEditor, ContentReview };
