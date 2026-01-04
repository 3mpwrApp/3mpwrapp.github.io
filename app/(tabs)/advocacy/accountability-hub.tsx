/**
 * REDIRECT: accountability-hub → Legal Action Hub
 * This screen has been consolidated into the Legal Action Hub PowerTool
 * Maintaining backward compatibility for deep links and navigation
 */

import LegalActionHub from './legal-action-hub';

export const options = { href: null };

export default function AccountabilityHub() {
  return <LegalActionHub initialTab="accountability" />;
}