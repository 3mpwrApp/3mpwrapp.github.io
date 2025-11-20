/**
 * Test script for submissions endpoint
 * Run with: node test-submission.mjs
 * Or use with wrangler: wrangler pages dev . --port 8788
 */

const ENDPOINT = process.env.TEST_ENDPOINT || 'http://localhost:8788/api/submissions';

const testEventSubmission = {
  type: 'event',
  data: {
    id: 'evt-test-' + Date.now(),
    title: 'Test Event from Script',
    description: 'This is a test event submission to verify the API endpoint is working correctly.',
    date: '2025-12-15',
    time: '14:00',
    location: 'Thunder Bay, ON',
    isVirtual: false,
    asl: true,
    captions: true,
    stepFree: true,
    sensorySpace: false,
    energyCost: 'medium',
    requiresRSVP: true,
    rsvpDetails: 'test@example.com',
    organizer: 'Test Organizer',
    category: 'community',
    tags: ['test', 'community', 'accessibility'],
  },
  submittedBy: {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
  },
  submittedAt: Date.now(),
};

const testCampaignSubmission = {
  type: 'campaign',
  data: {
    id: 'cmp-test-' + Date.now(),
    title: 'Test Campaign from Script',
    summary: 'This is a test campaign submission to verify the API endpoint.',
    description: 'Longer description of the test campaign with more details about what we are advocating for.',
    target: 'Test Government',
    goalCount: 1000,
    contactEmail: 'campaign@example.com',
    websiteUrl: 'https://example.com',
    category: 'advocacy',
    tags: ['test', 'advocacy'],
  },
  submittedBy: {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
  },
  submittedAt: Date.now(),
};

async function testSubmission(submission, label) {
  console.log(`\n🧪 Testing ${label}...`);
  console.log('Endpoint:', ENDPOINT);
  console.log('Payload:', JSON.stringify(submission, null, 2));

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submission),
    });

    console.log('Status:', response.status, response.statusText);
    
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Test passed!');
      return true;
    } else {
      console.log('❌ Test failed!');
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testInvalidSubmission() {
  console.log('\n🧪 Testing invalid submission (missing required fields)...');
  
  const invalidSubmission = {
    type: 'event',
    data: {
      id: 'evt-invalid',
      // Missing title and description
    },
    submittedBy: {
      uid: 'test-user',
    },
    submittedAt: Date.now(),
  };

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidSubmission),
    });

    console.log('Status:', response.status, response.statusText);
    
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.status === 400 && !data.success) {
      console.log('✅ Validation working correctly!');
      return true;
    } else {
      console.log('❌ Validation failed - should have rejected invalid submission');
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting API Endpoint Tests');
  console.log('================================');

  const results = [];

  // Test event submission
  results.push(await testSubmission(testEventSubmission, 'Event Submission'));

  // Test campaign submission
  results.push(await testSubmission(testCampaignSubmission, 'Campaign Submission'));

  // Test validation
  results.push(await testInvalidSubmission());

  console.log('\n================================');
  console.log('📊 Test Results:');
  console.log(`Passed: ${results.filter(r => r).length}/${results.length}`);
  console.log(`Failed: ${results.filter(r => !r).length}/${results.length}`);

  if (results.every(r => r)) {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed!');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
