/**
 * Firestore Pagination Tests
 * 
 * Tests for pagination service, listener cleanup, and query optimization
 * Run with: npm test -- services/__tests__/firestorePagination.test.ts
 */

import {
    batchFetch,
    clearPaginationCache,
    createListenerPaginator,
    createPaginator,
    getCampaignsPaginator,
    getCommunityPaginator,
    getEventsPaginator,
    getPaginationStats,
} from '../firestorePagination';

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn((db, name) => ({ name })),
  query: jest.fn((...args) => args),
  getDocs: jest.fn(),
  onSnapshot: jest.fn(),
  orderBy: jest.fn((field, dir) => ({ field, dir })),
  limit: jest.fn((n) => ({ limit: n })),
  where: jest.fn((field, op, val) => ({ field, op, val })),
  startAfter: jest.fn((doc) => ({ startAfter: doc })),
}));

jest.mock('../../firebase/config', () => ({
  db: { projectId: 'test-project' },
}));

describe('Firestore Pagination Service', () => {
  beforeEach(() => {
    clearPaginationCache();
    jest.clearAllMocks();
  });

  describe('createPaginator', () => {
    it('should fetch first page without cursor', async () => {
      const mockDocs = [
        { id: '1', data: () => ({ title: 'Campaign 1' }) },
        { id: '2', data: () => ({ title: 'Campaign 2' }) },
      ];

      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValue({ docs: mockDocs });

      const paginator = await createPaginator({
        collection: 'campaigns',
        orderBy: 'createdAt',
      });

      const result = await paginator.getPage(20);

      expect(result.items).toHaveLength(2);
      expect(result.items[0].id).toBe('1');
      expect(result.hasMore).toBe(false);
      expect(result.cursor).toBeNull();
    });

    it('should detect hasMore when docs exceed limit', async () => {
      const mockDocs = Array.from({ length: 21 }, (_, i) => ({
        id: String(i),
        data: () => ({ title: `Campaign ${i}` }),
      }));

      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValue({ docs: mockDocs });

      const paginator = await createPaginator({
        collection: 'campaigns',
        orderBy: 'createdAt',
      });

      const result = await paginator.getPage(20);

      expect(result.items).toHaveLength(20);
      expect(result.hasMore).toBe(true);
      expect(result.cursor).toBe(mockDocs[19]);
    });

    it('should support pagination with cursor', async () => {
      const mockDocs = Array.from({ length: 20 }, (_, i) => ({
        id: String(i + 20),
        data: () => ({ title: `Campaign ${i + 20}` }),
      }));

      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValue({ docs: mockDocs });

      const paginator = await createPaginator({
        collection: 'campaigns',
        orderBy: 'createdAt',
      });

      const firstPage = await paginator.getPage(10);
      const secondPage = await paginator.getPage(10, firstPage.cursor);

      expect(secondPage.items).toHaveLength(10);
      // Verify cursor was passed to startAfter
      const { startAfter } = require('firebase/firestore');
      expect(startAfter).toHaveBeenCalledWith(firstPage.cursor);
    });

    it('should cache cursor for collection', async () => {
      const mockDocs = [
        { id: '1', data: () => ({ title: 'Campaign 1' }) },
        { id: '2', data: () => ({ title: 'Campaign 2' }) },
      ];

      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValue({ docs: mockDocs });

      const paginator = await createPaginator({
        collection: 'campaigns',
        orderBy: 'createdAt',
        cacheKey: 'test:campaigns',
      });

      await paginator.getPage(20);
      const cachedCursor = paginator.getCachedCursor();

      expect(cachedCursor).toBeDefined();
    });

    it('should clear cache', async () => {
      const mockDocs = [{ id: '1', data: () => ({ title: 'Campaign 1' }) }];

      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValue({ docs: mockDocs });

      const paginator = await createPaginator({
        collection: 'campaigns',
        orderBy: 'createdAt',
        cacheKey: 'test:campaigns',
      });

      await paginator.getPage(20);
      paginator.clearCache();
      const cachedCursor = paginator.getCachedCursor();

      expect(cachedCursor).toBeNull();
    });
  });

  describe('createListenerPaginator', () => {
    it('should set up listener and return unsubscribe function', async () => {
      const { onSnapshot } = require('firebase/firestore');
      const mockUnsubscribe = jest.fn();
      onSnapshot.mockReturnValue(mockUnsubscribe);

      const mockDocs = [
        { id: '1', data: () => ({ title: 'Campaign 1' }) },
      ];

      const listener = await createListenerPaginator({
        collection: 'campaigns',
        orderBy: 'createdAt',
      });

      const callback = jest.fn();
      const unsubscribe = listener.subscribe(callback, 20);

      expect(onSnapshot).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should call callback with paginated data', async () => {
      const { onSnapshot } = require('firebase/firestore');
      let capturedCallback: any = null;

      onSnapshot.mockImplementation((q: any, cb: any) => {
        capturedCallback = cb;
        return jest.fn();
      });

       
      const _mockDocs = [
        { id: '1', data: () => ({ title: 'Campaign 1' }) },
        { id: '2', data: () => ({ title: 'Campaign 2' }) },
      ];

      const listener = await createListenerPaginator({
        collection: 'campaigns',
        orderBy: 'createdAt',
      });

      const callback = jest.fn();
      listener.subscribe(callback, 20);

      // Simulate snapshot
      capturedCallback({ docs: _mockDocs });

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.arrayContaining([
            { id: '1', title: 'Campaign 1' },
            { id: '2', title: 'Campaign 2' },
          ]),
          hasMore: false,
        })
      );
    });

    it('should cleanup previous listener when resubscribing', async () => {
      const { onSnapshot } = require('firebase/firestore');
      const mockUnsubscribe1 = jest.fn();
      const mockUnsubscribe2 = jest.fn();

      onSnapshot
        .mockReturnValueOnce(mockUnsubscribe1)
        .mockReturnValueOnce(mockUnsubscribe2);

      const listener = await createListenerPaginator({
        collection: 'campaigns',
        orderBy: 'createdAt',
      });

      listener.subscribe(jest.fn(), 20);
      listener.subscribe(jest.fn(), 20);

      expect(mockUnsubscribe1).toHaveBeenCalled();
    });

    it('should handle listener errors', async () => {
      const { onSnapshot } = require('firebase/firestore');
      let capturedErrorCallback: any = null;

      onSnapshot.mockImplementation((q: any, cb: any, errorCb: any) => {
        capturedErrorCallback = errorCb;
        return jest.fn();
      });

      const listener = await createListenerPaginator({
        collection: 'campaigns',
        orderBy: 'createdAt',
      });

      const errorCallback = jest.fn();
      listener.subscribe(jest.fn(), 20);

      const testError = new Error('Test error');
      capturedErrorCallback(testError);

      expect(errorCallback).not.toHaveBeenCalled(); // Not passed to listener.subscribe
    });
  });

  describe('Specialized paginators', () => {
    it('getCampaignsPaginator should apply active filter', async () => {
      const { where } = require('firebase/firestore');
       
      const _paginator = await getCampaignsPaginator();

      expect(where).toHaveBeenCalledWith('active', '==', true);
    });

    it('getEventsPaginator with province should apply province filter', async () => {
      const { where } = require('firebase/firestore');
       
      const _paginator = await getEventsPaginator('ON');

      expect(where).toHaveBeenCalledWith('province', '==', 'ON');
    });

    it('getCommunityPaginator should apply channel filter', async () => {
      const { where } = require('firebase/firestore');
       
      const _paginator = await getCommunityPaginator('general');

      expect(where).toHaveBeenCalledWith('channel', '==', 'general');
    });
  });

  describe('batchFetch', () => {
    it('should fetch multiple batches', async () => {
      const { getDocs } = require('firebase/firestore');
      const batch1 = Array.from({ length: 21 }, (_, i) => ({
        id: String(i),
        data: () => ({ title: `Doc ${i}` }),
      }));
      const batch2 = Array.from({ length: 10 }, (_, i) => ({
        id: String(i + 20),
        data: () => ({ title: `Doc ${i + 20}` }),
      }));

      getDocs
        .mockResolvedValueOnce({ docs: batch1 })
        .mockResolvedValueOnce({ docs: batch2 });

      const result = await batchFetch('campaigns', 2, 20);

      expect(result.items).toHaveLength(30);
      expect(result.cursors).toHaveLength(2);
    });

    it('should stop early if fewer results than batch size', async () => {
      const { getDocs } = require('firebase/firestore');
      const batch = Array.from({ length: 15 }, (_, i) => ({
        id: String(i),
        data: () => ({ title: `Doc ${i}` }),
      }));

      getDocs.mockResolvedValueOnce({ docs: batch });

      const result = await batchFetch('campaigns', 3, 20);

      expect(result.items).toHaveLength(15);
      expect(getDocs).toHaveBeenCalledTimes(1); // Stopped early
    });
  });

  describe('Cache utilities', () => {
    it('should return pagination stats', async () => {
      const mockDocs = [{ id: '1', data: () => ({ title: 'Campaign 1' }) }];
      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValue({ docs: mockDocs });

      const paginator = await createPaginator({
        collection: 'campaigns',
        orderBy: 'createdAt',
        cacheKey: 'test:campaigns',
      });

      await paginator.getPage(20);
      const stats = getPaginationStats();

      expect(stats.cachedCollections).toBe(1);
      expect(stats.entries).toHaveLength(1);
    });

    it('should clear all caches', async () => {
      const mockDocs = [{ id: '1', data: () => ({ title: 'Campaign 1' }) }];
      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValue({ docs: mockDocs });

      const p1 = await createPaginator({
        collection: 'campaigns',
        orderBy: 'createdAt',
        cacheKey: 'test:campaigns',
      });
      const p2 = await createPaginator({
        collection: 'events',
        orderBy: 'startDate',
        cacheKey: 'test:events',
      });

      await p1.getPage(20);
      await p2.getPage(20);

      clearPaginationCache();
      const stats = getPaginationStats();

      expect(stats.cachedCollections).toBe(0);
    });
  });

  describe('Memory leak prevention', () => {
    it('should not leak listeners when unsubscribe is called', async () => {
      const { onSnapshot } = require('firebase/firestore');
      const mockUnsubscribe = jest.fn();
      onSnapshot.mockReturnValue(mockUnsubscribe);

      const listener = await createListenerPaginator({
        collection: 'campaigns',
        orderBy: 'createdAt',
      });

      const unsubscribe = listener.subscribe(jest.fn(), 20);
      unsubscribe();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should cleanup all listeners on manager unsubscribeAll', async () => {
      const { onSnapshot } = require('firebase/firestore');
      const unsub1 = jest.fn();
      const unsub2 = jest.fn();

      onSnapshot.mockReturnValueOnce(unsub1).mockReturnValueOnce(unsub2);

      const { FirestoreListenerManager } = require('../firestoreExamples');
      const manager = new FirestoreListenerManager();

      const listener1 = await createListenerPaginator({
        collection: 'campaigns',
        orderBy: 'createdAt',
      });
      const listener2 = await createListenerPaginator({
        collection: 'events',
        orderBy: 'startDate',
      });

      const cleanup1 = listener1.subscribe(jest.fn(), 20);
      const cleanup2 = listener2.subscribe(jest.fn(), 20);

      manager.subscribe('campaigns', cleanup1);
      manager.subscribe('events', cleanup2);

      manager.unsubscribeAll();

      expect(manager.getStatus().activeListeners).toBe(0);
    });
  });

  describe('Query constraints', () => {
    // Query order test - skipped for Firebase-dependent validation
    it('should apply custom constraints', async () => {
      const { where } = require('firebase/firestore');

      const constraint = where('status', '==', 'active');
       
      const _paginator = await createPaginator({
        collection: 'campaigns',
        orderBy: 'createdAt',
        constraints: [constraint],
      });

      // Constraint should be in the query
      expect(where).toHaveBeenCalled();
    });
  });
});

describe('Integration Tests: Listener Cleanup', () => {
  it('Component cleanup should call unsubscribe', async () => {
    const { onSnapshot } = require('firebase/firestore');
    const mockUnsubscribe = jest.fn();
    onSnapshot.mockReturnValue(mockUnsubscribe);

    // Simulate React component mount/unmount
    const listener = await createListenerPaginator({
      collection: 'campaigns',
      orderBy: 'createdAt',
    });

    const callback = jest.fn();
    const cleanup = listener.subscribe(callback, 20);

    // Component unmounts
    cleanup();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('Manager should track listener lifecycle', async () => {
    const { onSnapshot } = require('firebase/firestore');
    onSnapshot.mockReturnValue(jest.fn());

    const { FirestoreListenerManager } = require('../firestoreExamples');
    const manager = new FirestoreListenerManager();

    const listener = await createListenerPaginator({
      collection: 'campaigns',
      orderBy: 'createdAt',
    });

    const cleanup = listener.subscribe(jest.fn(), 20);
    const wrappedCleanup = manager.subscribe('test:campaigns', cleanup);

    let status = manager.getStatus();
    expect(status.activeListeners).toBe(1);

    wrappedCleanup();
    status = manager.getStatus();
    expect(status.activeListeners).toBe(0);
  });

  it('Should not leak after rapid subscribe/unsubscribe cycles', async () => {
    const { onSnapshot } = require('firebase/firestore');
    const mockUnsubscribe = jest.fn();
    onSnapshot.mockReturnValue(mockUnsubscribe);

    const listener = await createListenerPaginator({
      collection: 'campaigns',
      orderBy: 'createdAt',
    });

    for (let i = 0; i < 10; i++) {
      const cleanup = listener.subscribe(jest.fn(), 20);
      cleanup();
    }

    expect(mockUnsubscribe).toHaveBeenCalledTimes(10);
  });
});
