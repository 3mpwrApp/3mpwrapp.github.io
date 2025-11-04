/**
 * Mock for expo-calendar
 */

export const EntityTypes = {
  EVENT: 'event',
  REMINDER: 'reminder',
};

export const requestCalendarPermissionsAsync = jest.fn(async () => ({
  status: 'granted',
  granted: true,
  canAskAgain: true,
  expires: 'never',
}));

export const getCalendarsAsync = jest.fn(async () => [
  {
    id: '1',
    title: 'Personal',
    color: '#FF0000',
    allowsModifications: true,
    source: { name: 'Default', type: 'local' },
    type: 'local',
    isPrimary: true,
    name: 'Personal',
  },
]);

export const createEventAsync = jest.fn(async () => '1');

export const getEventsAsync = jest.fn(async () => []);
export const updateEventAsync = jest.fn(async () => undefined);
export const deleteEventAsync = jest.fn(async () => undefined);
export const getEventAsync = jest.fn(async () => null);

export default {
  EntityTypes,
  requestCalendarPermissionsAsync,
  getCalendarsAsync,
  createEventAsync,
  getEventsAsync,
  updateEventAsync,
  deleteEventAsync,
  getEventAsync,
};
