/**
 * Discord Integration Service - Priority 4 Community Enhancement
 * 
 * Provides Discord integration for the Community Hub:
 * - OAuth2 authentication with Discord
 * - Display Discord server invite/status
 * - Sync Discord presence to app
 * - Bridge between app community and Discord channels
 * - Webhook integration for notifications
 * 
 * Features:
 * - Deep linking to Discord app/web
 * - Server widget display
 * - Member count and online status
 * - Channel-specific invites
 * - Role-based access (e.g., Beta Tester role)
 */

import { Alert, Linking } from 'react-native';

import { logError } from '../utils/errorLogger';

// Lazy-load modules
let AsyncStorage: any;
let AuthSession: any;
let WebBrowser: any;

try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch {}
try { AuthSession = require('expo-auth-session'); } catch {}
try { WebBrowser = require('expo-web-browser'); } catch {}

// Configuration - These should be set via environment variables
const DISCORD_CLIENT_ID = process.env.EXPO_PUBLIC_DISCORD_CLIENT_ID || '';
const DISCORD_REDIRECT_URI = AuthSession?.makeRedirectUri?.({ scheme: 'empowrapp' }) || 'empowrapp://discord-callback';

// Discord API endpoints
const DISCORD_API_BASE = 'https://discord.com/api/v10';
const DISCORD_CDN_BASE = 'https://cdn.discordapp.com';

// Storage keys
const DISCORD_TOKEN_KEY = 'discord:accessToken:v1';
const DISCORD_USER_KEY = 'discord:user:v1';
const DISCORD_SERVER_KEY = 'discord:serverConfig:v1';

// Types
export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string;
  verified?: boolean;
  globalName?: string;
}

export interface DiscordServerConfig {
  serverId: string;
  serverName: string;
  inviteCode: string;
  iconHash?: string;
  welcomeChannelId?: string;
  betaTestersChannelId?: string;
  supportChannelId?: string;
  announcementsChannelId?: string;
}

export interface DiscordServerWidget {
  id: string;
  name: string;
  instant_invite: string | null;
  presence_count: number;
  members: Array<{
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    status: 'online' | 'idle' | 'dnd' | 'offline';
    avatar_url: string;
  }>;
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: number;
  description?: string;
}

/**
 * Default server configuration for 3mpwrApp Discord
 * Main community communication hub
 */
export const DEFAULT_SERVER_CONFIG: DiscordServerConfig = {
  serverId: '1444061902555840667', // 3mpwrApp Discord server
  serverName: '3mpwrApp Community',
  inviteCode: 'fJB2DJ7Yn', // Main Discord invite: https://discord.gg/fJB2DJ7Yn
  welcomeChannelId: '1444061903684112455',
  betaTestersChannelId: '1446264193580929066',
  supportChannelId: '1446264655571058718',
  announcementsChannelId: '1444061903684112456',
};

/**
 * Get stored Discord token
 */
export async function getDiscordToken(): Promise<string | null> {
  try {
    return await AsyncStorage?.getItem?.(DISCORD_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Save Discord token
 */
async function saveDiscordToken(token: string): Promise<void> {
  try {
    await AsyncStorage?.setItem?.(DISCORD_TOKEN_KEY, token);
  } catch (err) {
    logError('discord', 'saveToken', err);
  }
}

/**
 * Get stored Discord user
 */
export async function getDiscordUser(): Promise<DiscordUser | null> {
  try {
    const raw = await AsyncStorage?.getItem?.(DISCORD_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

/**
 * Save Discord user
 */
async function saveDiscordUser(user: DiscordUser): Promise<void> {
  try {
    await AsyncStorage?.setItem?.(DISCORD_USER_KEY, JSON.stringify(user));
  } catch (err) {
    logError('discord', 'saveUser', err);
  }
}

/**
 * Clear Discord auth data
 */
export async function clearDiscordAuth(): Promise<void> {
  try {
    await AsyncStorage?.removeItem?.(DISCORD_TOKEN_KEY);
    await AsyncStorage?.removeItem?.(DISCORD_USER_KEY);
  } catch {}
}

/**
 * Get server configuration
 */
export async function getServerConfig(): Promise<DiscordServerConfig> {
  try {
    const raw = await AsyncStorage?.getItem?.(DISCORD_SERVER_KEY);
    if (raw) return { ...DEFAULT_SERVER_CONFIG, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SERVER_CONFIG;
}

/**
 * Save server configuration
 */
export async function saveServerConfig(config: Partial<DiscordServerConfig>): Promise<void> {
  try {
    const current = await getServerConfig();
    const updated = { ...current, ...config };
    await AsyncStorage?.setItem?.(DISCORD_SERVER_KEY, JSON.stringify(updated));
  } catch (err) {
    logError('discord', 'saveServerConfig', err);
  }
}

/**
 * Build Discord avatar URL
 */
export function getAvatarUrl(user: DiscordUser, size: number = 128): string {
  if (user.avatar) {
    return `${DISCORD_CDN_BASE}/avatars/${user.id}/${user.avatar}.png?size=${size}`;
  }
  // Default avatar based on discriminator
  const defaultIndex = parseInt(user.discriminator) % 5;
  return `${DISCORD_CDN_BASE}/embed/avatars/${defaultIndex}.png`;
}

/**
 * Build server icon URL
 */
export function getServerIconUrl(serverId: string, iconHash: string, size: number = 128): string {
  return `${DISCORD_CDN_BASE}/icons/${serverId}/${iconHash}.png?size=${size}`;
}

/**
 * Authenticate with Discord using OAuth2
 */
export async function authenticateWithDiscord(): Promise<DiscordUser | null> {
  if (!DISCORD_CLIENT_ID) {
    Alert.alert(
      'Discord Not Configured',
      'Discord integration is not yet configured. Please check back later!',
      [{ text: 'OK' }]
    );
    return null;
  }
  
  if (!AuthSession) {
    console.warn('[Discord] expo-auth-session not available');
    return null;
  }
  
  try {
    // Build auth request
    const discovery = {
      authorizationEndpoint: 'https://discord.com/api/oauth2/authorize',
      tokenEndpoint: 'https://discord.com/api/oauth2/token',
      revocationEndpoint: 'https://discord.com/api/oauth2/token/revoke',
    };
    
    const request = new AuthSession.AuthRequest({
      clientId: DISCORD_CLIENT_ID,
      scopes: ['identify', 'email', 'guilds'],
      redirectUri: DISCORD_REDIRECT_URI,
      responseType: AuthSession.ResponseType.Code,
    });
    
    const result = await request.promptAsync(discovery);
    
    if (result.type === 'success' && result.params.code) {
      // Exchange code for token
      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          clientId: DISCORD_CLIENT_ID,
          code: result.params.code,
          redirectUri: DISCORD_REDIRECT_URI,
        },
        discovery
      );
      
      if (tokenResponse.accessToken) {
        await saveDiscordToken(tokenResponse.accessToken);
        
        // Fetch user info
        const user = await fetchDiscordUser(tokenResponse.accessToken);
        if (user) {
          await saveDiscordUser(user);
          return user;
        }
      }
    }
    
    return null;
  } catch (err) {
    logError('discord', 'authenticate', err);
    return null;
  }
}

/**
 * Fetch Discord user from API
 */
async function fetchDiscordUser(accessToken: string): Promise<DiscordUser | null> {
  try {
    const response = await fetch(`${DISCORD_API_BASE}/users/@me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    logError('discord', 'fetchUser', err);
  }
  return null;
}

/**
 * Fetch server widget (public info)
 */
export async function fetchServerWidget(serverId: string): Promise<DiscordServerWidget | null> {
  try {
    const response = await fetch(`${DISCORD_API_BASE}/guilds/${serverId}/widget.json`);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    logError('discord', 'fetchWidget', err);
  }
  return null;
}

/**
 * Check if user is in the server
 */
export async function isUserInServer(serverId: string): Promise<boolean> {
  const token = await getDiscordToken();
  if (!token) return false;
  
  try {
    const response = await fetch(`${DISCORD_API_BASE}/users/@me/guilds`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      const guilds = await response.json();
      return guilds.some((g: any) => g.id === serverId);
    }
  } catch (err) {
    logError('discord', 'isUserInServer', err);
  }
  return false;
}

/**
 * Open Discord invite link
 * Tries to open Discord app first, falls back to browser
 */
export async function openDiscordInvite(inviteCode?: string): Promise<void> {
  const config = await getServerConfig();
  const code = inviteCode || config.inviteCode;
  
  if (!code) {
    Alert.alert(
      'Invite Not Available',
      'The Discord invite is not configured yet. Please check back later!',
      [{ text: 'OK' }]
    );
    return;
  }
  
  const inviteUrl = `https://discord.gg/${code}`;
  const discordAppUrl = `discord://discord.gg/${code}`;
  
  try {
    // Try to open Discord app first
    const canOpen = await Linking.canOpenURL(discordAppUrl);
    if (canOpen) {
      await Linking.openURL(discordAppUrl);
    } else {
      // Fall back to web browser
      if (WebBrowser?.openBrowserAsync) {
        await WebBrowser.openBrowserAsync(inviteUrl);
      } else {
        await Linking.openURL(inviteUrl);
      }
    }
  } catch (err) {
    // Last resort: try regular URL
    try {
      await Linking.openURL(inviteUrl);
    } catch {
      logError('discord', 'openInvite', err);
    }
  }
}

/**
 * Open specific Discord channel
 */
export async function openDiscordChannel(channelId: string): Promise<void> {
  const config = await getServerConfig();
  
  const webUrl = `https://discord.com/channels/${config.serverId}/${channelId}`;
  const appUrl = `discord://discord.com/channels/${config.serverId}/${channelId}`;
  
  try {
    const canOpen = await Linking.canOpenURL(appUrl);
    if (canOpen) {
      await Linking.openURL(appUrl);
    } else {
      if (WebBrowser?.openBrowserAsync) {
        await WebBrowser.openBrowserAsync(webUrl);
      } else {
        await Linking.openURL(webUrl);
      }
    }
  } catch (err) {
    logError('discord', 'openChannel', err);
    await Linking.openURL(webUrl);
  }
}

/**
 * Get quick links for Discord integration
 */
export async function getDiscordQuickLinks(): Promise<Array<{
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => Promise<void>;
}>> {
  const config = await getServerConfig();
  const links: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    action: () => Promise<void>;
  }> = [];
  
  // Main server invite
  links.push({
    id: 'join',
    title: 'Join Discord Server',
    description: 'Connect with the 3mpwrApp community',
    icon: '🎮',
    action: async () => openDiscordInvite(),
  });
  
  // Beta testers channel
  if (config.betaTestersChannelId) {
    links.push({
      id: 'beta',
      title: 'Beta Testers Channel',
      description: 'Discuss features and report bugs',
      icon: '🧪',
      action: async () => openDiscordChannel(config.betaTestersChannelId!),
    });
  }
  
  // Support channel
  if (config.supportChannelId) {
    links.push({
      id: 'support',
      title: 'Get Support',
      description: 'Ask questions and get help',
      icon: '💬',
      action: async () => openDiscordChannel(config.supportChannelId!),
    });
  }
  
  // Announcements channel
  if (config.announcementsChannelId) {
    links.push({
      id: 'announcements',
      title: 'Announcements',
      description: 'Stay updated on new features',
      icon: '📢',
      action: async () => openDiscordChannel(config.announcementsChannelId!),
    });
  }
  
  return links;
}

/**
 * Send webhook message (for app-to-Discord notifications)
 */
export async function sendWebhookMessage(
  webhookUrl: string,
  content: string,
  options?: {
    username?: string;
    avatarUrl?: string;
    embeds?: Array<{
      title?: string;
      description?: string;
      color?: number;
      fields?: Array<{ name: string; value: string; inline?: boolean }>;
    }>;
  }
): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        username: options?.username || '3mpwrApp',
        avatar_url: options?.avatarUrl,
        embeds: options?.embeds,
      }),
    });
    
    return response.ok;
  } catch (err) {
    logError('discord', 'sendWebhook', err);
    return false;
  }
}

/**
 * Get Discord connection status
 */
export async function getDiscordStatus(): Promise<{
  isAuthenticated: boolean;
  user: DiscordUser | null;
  serverConfigured: boolean;
  isInServer: boolean | null;
}> {
  const token = await getDiscordToken();
  const user = await getDiscordUser();
  const config = await getServerConfig();
  
  let isInServer: boolean | null = null;
  if (token && config.serverId) {
    isInServer = await isUserInServer(config.serverId);
  }
  
  return {
    isAuthenticated: !!token && !!user,
    user,
    serverConfigured: !!config.serverId && !!config.inviteCode,
    isInServer,
  };
}

/**
 * Disconnect Discord account
 */
export async function disconnectDiscord(): Promise<void> {
  await clearDiscordAuth();
}

/**
 * Format Discord username for display
 */
export function formatUsername(user: DiscordUser): string {
  if (user.globalName) {
    return user.globalName;
  }
  if (user.discriminator === '0') {
    return `@${user.username}`;
  }
  return `${user.username}#${user.discriminator}`;
}
