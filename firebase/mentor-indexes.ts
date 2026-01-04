/**
 * Mentor Discovery - Firestore Indexes Configuration
 * 
 * Add these indexes to your Firebase project for optimal query performance.
 * 
 * You can either:
 * 1. Create them manually in Firebase Console
 * 2. Use Firebase CLI: firebase firestore:indexes:create path/to/firestore-indexes.json
 * 3. Follow the links provided by Firestore when you run queries that need indexes
 */

// Required Firestore Indexes for Mentor Discovery:
// 
// Index 1: Mentor Search (acceptingMentees + rating)
// Collection: mentors
// Fields:
//   - acceptingMentees (Ascending)
//   - rating (Descending)
//   - __name__ (Descending)
//
// Index 2: Mentor Search by Disability (acceptingMentees + disabilities + rating)
// Collection: mentors
// Fields:
//   - acceptingMentees (Ascending)
//   - disabilities (Ascending)
//   - rating (Descending)
//
// Index 3: Mentor Search by Experience (acceptingMentees + experiences + rating)
// Collection: mentors
// Fields:
//   - acceptingMentees (Ascending)
//   - experiences (Ascending)
//   - rating (Descending)
//
// Index 4: Mentor Search by Language (acceptingMentees + languages + rating)
// Collection: mentors
// Fields:
//   - acceptingMentees (Ascending)
//   - languages (Ascending)
//   - rating (Descending)
//
// Index 5: Mentorship Requests (mentorId + status + createdAt)
// Collection: mentorship_requests
// Fields:
//   - mentorId (Ascending)
//   - status (Ascending)
//   - createdAt (Descending)
//
// Index 6: Mentor Ratings (mentorId + createdAt)
// Collection: mentor_ratings
// Fields:
//   - mentorId (Ascending)
//   - createdAt (Descending)
//

// Firebase JSON format for indexes:
const firestoreIndexes = {
  "indexes": [
    {
      "collectionId": "mentors",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "acceptingMentees", "order": "ASCENDING" },
        { "fieldPath": "rating", "order": "DESCENDING" },
        { "fieldPath": "__name__", "order": "DESCENDING" }
      ]
    },
    {
      "collectionId": "mentors",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "acceptingMentees", "order": "ASCENDING" },
        { "fieldPath": "disabilities", "order": "ASCENDING" },
        { "fieldPath": "rating", "order": "DESCENDING" }
      ]
    },
    {
      "collectionId": "mentors",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "acceptingMentees", "order": "ASCENDING" },
        { "fieldPath": "experiences", "order": "ASCENDING" },
        { "fieldPath": "rating", "order": "DESCENDING" }
      ]
    },
    {
      "collectionId": "mentors",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "acceptingMentees", "order": "ASCENDING" },
        { "fieldPath": "languages", "order": "ASCENDING" },
        { "fieldPath": "rating", "order": "DESCENDING" }
      ]
    },
    {
      "collectionId": "mentorship_requests",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "mentorId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionId": "mentor_ratings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "mentorId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
};

export default firestoreIndexes;
