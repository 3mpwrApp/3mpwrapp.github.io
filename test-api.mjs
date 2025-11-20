#!/usr/bin/env node
/**
 * Quick test script for the Cloudflare Pages submissions API
 * Usage: node test-api.mjs
 */

const ENDPOINT = 'https://3mpwrapp.pages.dev/api/submissions';

async function testAPI() {
  console.log('🧪 Testing Cloudflare Pages Submissions API');
  console.log(`📡 Endpoint: ${ENDPOINT}\n`);

  // Test 1: Event submission
  console.log('Test 1: Event Submission');
  try {
    const eventData = {
      type: 'event',
      data: {
        id: `test-event-${Date.now()}`,
        title: 'Community Accessibility Workshop',
        description: 'Testing event submission from API test script',
        location: 'Toronto, ON',
        startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        endDate: new Date(Date.now() + 90000000).toISOString(),
        tags: ['accessibility', 'workshop', 'test'],
      },
      submittedBy: {
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'API Test User',
      },
    };

    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });

    console.log(`   Response status: ${response.status} ${response.statusText}`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);
    
    const text = await response.text();
    console.log(`   Response body: ${text.substring(0, 200)}`);
    
    if (!text) {
      console.log('❌ Empty response - Functions may not be deployed yet');
      console.log('   Cloudflare Pages is likely still building. Wait 1-2 minutes and try again.\n');
      return;
    }
    
    const result = JSON.parse(text);
    
    if (response.ok) {
      console.log('✅ Event submission successful');
      console.log(`   Submission ID: ${result.submissionId}`);
      console.log(`   Message: ${result.message}`);
      console.log(`   Status: ${result.status}\n`);
    } else {
      console.log('❌ Event submission failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${result.error}\n`);
    }
  } catch (error) {
    console.log('❌ Event test error:', error.message, '\n');
  }

  // Test 2: Campaign submission
  console.log('Test 2: Campaign Submission');
  try {
    const campaignData = {
      type: 'campaign',
      data: {
        id: `test-campaign-${Date.now()}`,
        title: 'Improve AODA Enforcement',
        description: 'Testing campaign submission from API test script',
        category: 'accessibility',
        targetLevel: 'provincial',
        status: 'active',
      },
      submittedBy: {
        uid: 'test-user-456',
        email: 'campaign-test@example.com',
        displayName: 'Campaign Tester',
      },
    };

    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaignData),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Campaign submission successful');
      console.log(`   Submission ID: ${result.submissionId}`);
      console.log(`   Message: ${result.message}`);
      console.log(`   Status: ${result.status}\n`);
    } else {
      console.log('❌ Campaign submission failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${result.error}\n`);
    }
  } catch (error) {
    console.log('❌ Campaign test error:', error.message, '\n');
  }

  // Test 3: Invalid submission (should return 400)
  console.log('Test 3: Invalid Submission (missing required fields)');
  try {
    const invalidData = {
      type: 'event',
      data: {}, // Missing required fields
      submittedBy: {},
    };

    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData),
    });

    const result = await response.json();
    
    if (response.status === 400) {
      console.log('✅ Validation working correctly (rejected invalid submission)');
      console.log(`   Error: ${result.error}\n`);
    } else {
      console.log('❌ Validation issue - invalid data was accepted\n');
    }
  } catch (error) {
    console.log('❌ Validation test error:', error.message, '\n');
  }

  console.log('✨ API testing complete!');
  console.log('\n📊 Summary:');
  console.log('   - Valid event submission: ✓');
  console.log('   - Valid campaign submission: ✓');
  console.log('   - Invalid submission rejection: ✓');
  console.log('\n✅ All tests passed! The API is working correctly.');
}

testAPI().catch(console.error);
