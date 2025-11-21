import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const testEntries = [
  // Insurance entries
  {
    title: 'State Farm Auto Insurance',
    type: 'Insurance',
    description: 'Family auto insurance policy covering all vehicles',
    details: `## Policy Information
- **Policy Number**: 123-456-789
- **Agent**: John Smith
- **Phone**: (555) 123-4567
- **Email**: john.smith@statefarm.com

## Coverage Details
- Liability: $500,000/$1,000,000
- Collision: $500 deductible
- Comprehensive: $250 deductible
- Rental Car Coverage: Yes

## Vehicles Covered
1. 2020 Honda Odyssey - VIN: 5FNRL6H78LB123456
2. 2019 Tesla Model 3 - VIN: 5YJ3E1EA7KF123456

## Payment
- Monthly Premium: $245
- Auto-pay from checking account
- Renews: December 15, 2025`,
    tags: ['insurance', 'auto', 'state-farm', 'monthly-payment'],
    important_dates: {
      renewal: '2025-12-15',
      last_payment: '2025-01-15',
    },
    status: 'active',
    security_level: 'private',
  },
  {
    title: 'Blue Cross Blue Shield Health Insurance',
    type: 'Insurance',
    description: 'Family health insurance plan',
    details: `## Plan Information
- **Plan**: PPO Gold
- **Group Number**: 12345678
- **Member ID**: ABC123456789
- **Customer Service**: (800) 555-1234

## Coverage
- In-Network Deductible: $1,500/person, $3,000/family
- Out-of-Pocket Max: $5,000/person, $10,000/family
- Office Visit Copay: $30
- Specialist Copay: $60
- ER Copay: $250

## Covered Members
- Max Jaffe (Primary)
- Sarah Jaffe (Spouse)
- Emma Jaffe (Dependent)
- Noah Jaffe (Dependent)

## Resources
- Find a Doctor: www.bcbs.com/find-doctor
- Claims: www.bcbs.com/claims
- ID Cards: Digital cards in mobile app`,
    tags: ['insurance', 'health', 'bcbs', 'ppo'],
    status: 'active',
    security_level: 'private',
  },
  {
    title: 'Homeowners Insurance - Liberty Mutual',
    type: 'Insurance',
    description: 'Home insurance policy with flood coverage',
    details: `## Policy Details
- **Policy Number**: HO-987654321
- **Agent**: Maria Garcia
- **Phone**: (555) 987-6543
- **Annual Premium**: $1,850

## Coverage
- Dwelling: $450,000
- Personal Property: $225,000
- Liability: $500,000
- Deductible: $2,500
- Flood Coverage: $100,000 (separate policy)

## Important Notes
- Home security system installed - 15% discount applied
- Roof replaced in 2022 - documentation on file
- Regular home inspections required every 3 years`,
    tags: ['insurance', 'home', 'liberty-mutual', 'flood-coverage'],
    important_dates: {
      renewal: '2025-07-01',
    },
    status: 'active',
    security_level: 'private',
  },

  // Contact entries
  {
    title: 'Emergency Contacts',
    type: 'Contact',
    description: 'Primary emergency contacts for the family',
    details: `## Primary Contacts

### Grandma Betty
- **Phone**: (555) 111-2222
- **Address**: 123 Oak Street, San Jose, CA 95123
- **Relation**: Maternal Grandmother
- **Available**: Anytime

### Uncle Tom
- **Phone**: (555) 333-4444
- **Email**: tom.jaffe@email.com
- **Relation**: Paternal Uncle
- **Lives**: 5 miles away

### Neighbor - The Johnsons
- **Phone**: (555) 555-6666
- **Address**: Next door (742 Elm Street)
- **Notes**: Have spare house key

## Medical Emergency
- Call 911 first
- Then notify: Dr. Sarah Chen (555) 777-8888`,
    tags: ['emergency', 'contacts', 'family', 'important'],
    status: 'active',
    security_level: 'private',
  },
  {
    title: 'Pediatrician - Dr. Sarah Chen',
    type: 'Healthcare',
    description: 'Primary care physician for children',
    details: `## Office Information
- **Practice**: Silicon Valley Pediatrics
- **Address**: 456 Medical Plaza, Suite 200, San Jose, CA 95110
- **Phone**: (555) 777-8888
- **Fax**: (555) 777-8889
- **Hours**: Mon-Fri 8am-5pm, Sat 9am-1pm

## Appointments
- Online booking: www.svpediatrics.com/appointments
- Patient portal: www.svpediatrics.com/portal
- After-hours nurse line: (555) 777-9999

## Notes
- Accepts BCBS insurance
- Usually can get same-day sick appointments
- Annual physicals required for school
- Immunization records kept on portal`,
    tags: ['healthcare', 'doctor', 'pediatrician', 'kids'],
    status: 'active',
    security_level: 'private',
  },

  // Financial entries
  {
    title: 'Chase Checking Account',
    type: 'Financial',
    description: 'Primary family checking account',
    details: `## Account Information
- **Account Number**: ****1234
- **Routing Number**: 121000248
- **Type**: Premier Plus Checking
- **Branch**: 789 Main St, San Jose

## Features
- No monthly fees (with direct deposit)
- Free checks
- ATM fee reimbursement (up to $25/month)
- Overdraft protection linked to savings

## Auto-Payments
- Mortgage (1st of month)
- Car insurance (15th of month)
- Utilities (various dates)
- Kids' school tuition (5th of month)

## Online Access
- Website: www.chase.com
- Mobile app: Chase Mobile
- Bill pay enabled
- Zelle enabled`,
    tags: ['financial', 'banking', 'checking', 'chase'],
    status: 'active',
    security_level: 'encrypted',
  },
  {
    title: 'Vanguard 529 College Savings',
    type: 'Financial',
    description: 'College savings plans for kids',
    details: `## Emma's 529 Plan
- **Account**: ****5678
- **Balance**: ~$45,000 (as of Dec 2024)
- **Monthly Contribution**: $500 auto-debit
- **Investment**: Target Enrollment 2031

## Noah's 529 Plan
- **Account**: ****5679
- **Balance**: ~$38,000 (as of Dec 2024)
- **Monthly Contribution**: $500 auto-debit
- **Investment**: Target Enrollment 2033

## Access
- Website: www.vanguard.com
- Login: Use family email
- Beneficiary changes: Can be transferred between siblings if needed
- Tax benefits: State tax deduction available`,
    tags: ['financial', 'college', '529', 'vanguard', 'savings'],
    important_dates: {
      emma_enrollment: '2031-08-01',
      noah_enrollment: '2033-08-01',
    },
    status: 'active',
    security_level: 'encrypted',
  },

  // Education entries
  {
    title: 'Lincoln Elementary School',
    type: 'Education',
    description: 'Emma and Noah\'s elementary school',
    details: `## School Information
- **Address**: 1000 Education Way, San Jose, CA 95124
- **Phone**: (555) 888-9999
- **Principal**: Dr. Jennifer Martinez
- **Website**: www.lincoln.sjusd.org

## Emma (5th Grade)
- **Teacher**: Mrs. Anderson
- **Room**: 205
- **Email**: j.anderson@sjusd.org

## Noah (3rd Grade)
- **Teacher**: Mr. Thompson
- **Room**: 108
- **Email**: r.thompson@sjusd.org

## Important Info
- School hours: 8:15am - 2:45pm
- Early dismissal Wednesday: 1:30pm
- Lunch: Bring or buy ($4.50/day)
- Parent portal: www.lincoln.sjusd.org/parent
- Calendar: Check portal for events/holidays`,
    tags: ['education', 'school', 'elementary', 'kids'],
    important_dates: {
      winter_break: '2025-12-20',
      spring_break: '2025-04-07',
      last_day: '2025-06-12',
    },
    status: 'active',
    security_level: 'private',
  },

  // Home entries
  {
    title: 'Home WiFi & Internet',
    type: 'Home',
    description: 'Home network and internet service information',
    details: `## Internet Service
- **Provider**: Xfinity
- **Plan**: 1000 Mbps (Gigabit)
- **Account**: ****6789
- **Monthly**: $80/month
- **Support**: (800) 934-6489

## WiFi Networks
- **Main Network**: JaffeFamily2024
- **Password**: [stored in password manager]
- **Guest Network**: JaffeGuest
- **Guest Password**: Welcome2024!

## Equipment
- **Modem**: Arris SB8200 (owned)
- **Router**: Google Nest WiFi Pro
- **Location**: Network closet in garage
- **Admin**: 192.168.1.1

## Troubleshooting
1. Restart modem/router
2. Check cables
3. Call Xfinity if still down
4. Backup: Mobile hotspot from phone`,
    tags: ['home', 'internet', 'wifi', 'xfinity', 'utilities'],
    status: 'active',
    security_level: 'private',
  },
  {
    title: 'HVAC System Warranty',
    type: 'Home',
    description: 'Home heating and cooling system information',
    details: `## System Information
- **Brand**: Carrier Infinity
- **Installed**: June 2022
- **Installer**: Bay Area HVAC
- **Phone**: (555) 222-3333

## Warranty
- **Parts**: 10 years (expires 2032)
- **Labor**: 2 years (expires 2024) - EXPIRED
- **Compressor**: Lifetime warranty
- **Registration**: Confirmed online

## Maintenance
- **Filter Changes**: Every 3 months
- **Annual Service**: Required for warranty
- **Last Service**: October 2024
- **Next Service**: October 2025
- **Filter Size**: 20x25x4 MERV 11

## Service Contract
- Consider purchasing extended labor warranty
- Annual tune-up: $150
- Priority service in emergencies`,
    tags: ['home', 'hvac', 'warranty', 'maintenance'],
    important_dates: {
      next_service: '2025-10-15',
      next_filter: '2025-04-01',
    },
    status: 'active',
    security_level: 'private',
  },

  // Auto entries
  {
    title: '2020 Honda Odyssey Registration',
    type: 'Auto',
    description: 'Vehicle registration and maintenance info',
    details: `## Vehicle Details
- **VIN**: 5FNRL6H78LB123456
- **License Plate**: ABC1234
- **Registration Expiration**: March 2025
- **Mileage**: ~42,000 (as of Jan 2025)

## Registration
- **DMV**: Renew online at dmv.ca.gov
- **Fee**: ~$350/year
- **Smog**: Required every 2 years (last: 2024)

## Maintenance Schedule
- **Oil Changes**: Every 5,000 miles (Costco)
- **Tire Rotation**: Every 7,500 miles
- **Last Service**: December 2024 at 41,500 miles
- **Next Service**: ~May 2025

## Insurance
- See "State Farm Auto Insurance" entry

## Recalls
- Check www.honda.com/recalls
- Last checked: January 2025`,
    tags: ['auto', 'honda', 'odyssey', 'registration', 'maintenance'],
    important_dates: {
      registration_due: '2025-03-31',
      next_oil_change: '2025-05-15',
    },
    status: 'active',
    security_level: 'private',
  },

  // Legal entries
  {
    title: 'Family Estate Plan',
    type: 'Legal',
    description: 'Wills, trusts, and estate planning documents',
    details: `## Documents Location
- **Originals**: Safe deposit box at Chase Bank
- **Copies**: Fireproof safe at home
- **Digital**: Encrypted folder in cloud storage

## Key Documents
1. Last Will and Testament (both parents)
2. Living Trust
3. Healthcare Power of Attorney
4. Financial Power of Attorney
5. Living Will / Advance Directive

## Attorney
- **Name**: Robert Chen, Esq.
- **Firm**: Chen & Associates
- **Phone**: (555) 444-5555
- **Email**: rchen@chenlegal.com
- **Last Updated**: March 2023

## Important Info
- **Executor**: Tom Jaffe (brother)
- **Trustee**: Betty Jaffe (mother)
- **Guardian for Kids**: Sarah's sister Emily
- **Review**: Update every 3-5 years or after major life changes

## Next Steps
- Review in 2026
- Update if any major assets acquired
- Ensure guardians are still willing/able`,
    tags: ['legal', 'estate', 'will', 'trust', 'important'],
    important_dates: {
      next_review: '2026-03-01',
    },
    status: 'active',
    security_level: 'encrypted',
  },
];

async function generateTestData() {
  try {
    // Get the current user (you'll need to be logged in)
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error: No authenticated user found.');
      console.log('Please make sure you have an active user session.');
      console.log('You may need to modify this script to use your user ID directly.');
      process.exit(1);
    }

    console.log(`Creating test data for user: ${user.email}`);
    console.log(`Inserting ${testEntries.length} family information entries...\n`);

    // Insert all test entries
    const entriesToInsert = testEntries.map(entry => ({
      ...entry,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('family_information')
      .insert(entriesToInsert)
      .select();

    if (error) {
      console.error('Error inserting test data:', error);
      process.exit(1);
    }

    console.log(`✅ Successfully created ${data.length} test entries!\n`);

    // Show summary
    const typeCounts = data.reduce((acc, entry) => {
      acc[entry.type] = (acc[entry.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('Summary by type:');
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count} entries`);
    });

    console.log('\n🎉 Test data generation complete!');
    console.log('Visit /family-info to see your test data.');
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// If user_id is provided as command line argument, use it
const userId = process.argv[2];

if (userId) {
  console.log(`Using provided user ID: ${userId}`);

  const entriesToInsert = testEntries.map(entry => ({
    ...entry,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  supabase
    .from('family_information')
    .insert(entriesToInsert)
    .select()
    .then(({ data, error }) => {
      if (error) {
        console.error('Error inserting test data:', error);
        process.exit(1);
      }

      console.log(`✅ Successfully created ${data.length} test entries for user ${userId}!\n`);

      const typeCounts = data.reduce((acc, entry) => {
        acc[entry.type] = (acc[entry.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log('Summary by type:');
      Object.entries(typeCounts).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count} entries`);
      });

      console.log('\n🎉 Test data generation complete!');
    });
} else {
  generateTestData();
}
