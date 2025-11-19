/**
 * Setup Script for Calendar and Weather
 * Run with: npx tsx scripts/setup-calendars.ts
 */

const CALENDARS = [
  {
    name: "Riley's Calendar",
    ical_url: "https://p71-caldav.icloud.com/published/2/MTUxMzgxNDAwMTUxMzgxNKD_eOQwbZaTDc7qrvwbHYcZlXrfBkUCWr5DC64QwRGnlY-PWOOa1eK7P5au_I0zdpVhB1PIXdWVgFAx7VetfBo",
    color: "#3b82f6", // Blue
  },
  {
    name: "Devin's Calendar",
    ical_url: "https://p71-caldav.icloud.com/published/2/MTUxMzgxNDAwMTUxMzgxNKD_eOQwbZaTDc7qrvwbHYdnhEY3I0DXsrZdHc13g2c6IbDr3cLt8eK0HvnJgr7Z5TsscsnPNH0UHB2ULOXRipU",
    color: "#10b981", // Green
  },
  {
    name: "Parker's Calendar",
    ical_url: "https://p71-caldav.icloud.com/published/2/MTUxMzgxNDAwMTUxMzgxNKD_eOQwbZaTDc7qrvwbHYd1ZYHQzLLB30RmDXC8fVsT",
    color: "#f59e0b", // Amber
  },
  {
    name: "Home Calendar",
    ical_url: "https://p47-caldav.icloud.com/published/2/MTM0MTU1MjQzNzEzNDE1NWHqDVGjQfmHOSjW5j9wCCqTGVjA-Osp-JoDI44hqDnZ",
    color: "#8b5cf6", // Purple
  },
  {
    name: "School Calendar",
    ical_url: "https://p71-caldav.icloud.com/published/2/MTUxMzgxNDAwMTUxMzgxNKD_eOQwbZaTDc7qrvwbHYfZGOP1jhlMemb0A32E_oMcaC-Z5waBQLlG7FEXEgugWXPqo1WQ1qQYWEeQ3lceMeM",
    color: "#ef4444", // Red
  },
];

const LOCATION = "Bronxville, NY 10708";

async function setup() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  console.log('🚀 Setting up calendars and weather...\n');

  // You'll need to get a session token first
  console.log('⚠️  This script needs to be run from the browser console or with a valid session.');
  console.log('    Copy and paste this into your browser console while logged in:\n');

  console.log('```javascript');
  console.log('// Set up weather location');
  console.log(`fetch('/api/weather', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ location: '${LOCATION}' })
}).then(r => r.json()).then(d => console.log('Weather configured:', d));
`);

  console.log('\n// Add calendar subscriptions');
  CALENDARS.forEach((cal, idx) => {
    console.log(`
fetch('/api/calendar/subscriptions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(${JSON.stringify(cal, null, 2)})
}).then(r => r.json()).then(d => console.log('${cal.name} added:', d));
`);
  });

  console.log('\n// Sync all calendars');
  console.log(`
fetch('/api/calendar/sync', {
  method: 'POST'
}).then(r => r.json()).then(d => console.log('Sync complete:', d));
`);

  console.log('```\n');

  console.log('📋 Or, you can run these commands manually:');
  console.log('\n1. Set weather location:');
  console.log(`   POST /api/weather`);
  console.log(`   { "location": "${LOCATION}" }`);

  console.log('\n2. Add each calendar:');
  CALENDARS.forEach(cal => {
    console.log(`   POST /api/calendar/subscriptions`);
    console.log(`   ${JSON.stringify(cal)}`);
  });

  console.log('\n3. Trigger initial sync:');
  console.log(`   POST /api/calendar/sync`);

  console.log('\n✅ Once complete, visit /home to see your Family Command Center!');
}

setup();
