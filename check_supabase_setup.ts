import { createClient } from 'npm:@supabase/supabase-js@2.35.0';
import dotenv from 'npm:dotenv@16.1.4';

dotenv.config();

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
  Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

console.log('🔍 Checking Supabase Setup...\n');
console.log(`📍 URL: ${SUPABASE_URL}\n`);

const results = {
  tables: { artists: false, songs: false, insights: false, profiles: false },
  storage: { avatars: false },
  auth: { emailEnabled: false, googleOAuthConfigured: false },
  policies: { artists: 0, songs: 0, insights: 0, profiles: 0 },
  issues: [] as string[],
  recommendations: [] as string[]
};

// Test 1: Check if tables exist by attempting to query them
console.log('📋 Checking Tables...');

async function checkTable(tableName: string) {
  try {
    const { data, error } = await supabase.from(tableName).select('*').limit(1);
    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log(`  ❌ ${tableName}: Table does not exist`);
        results.issues.push(`Table '${tableName}' is missing`);
        return false;
      }
      // If we get a different error, table might exist but have RLS issues
      console.log(`  ⚠️  ${tableName}: Exists (RLS may be blocking query)`);
      return true;
    }
    console.log(`  ✅ ${tableName}: OK (${data?.length || 0} rows visible)`);
    return true;
  } catch (err: any) {
    console.log(`  ❌ ${tableName}: Error - ${err.message}`);
    results.issues.push(`Table '${tableName}' check failed: ${err.message}`);
    return false;
  }
}

results.tables.artists = await checkTable('artists');
results.tables.songs = await checkTable('songs');
results.tables.insights = await checkTable('insights');
results.tables.profiles = await checkTable('profiles');

// Test 2: Check Storage Buckets
console.log('\n💾 Checking Storage...');
try {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    console.log(`  ❌ Storage API Error: ${error.message}`);
    results.issues.push('Cannot access storage buckets');
  } else {
    const avatarsBucket = buckets?.find((b: any) => b.name === 'avatars');
    if (avatarsBucket) {
      console.log(`  ✅ avatars bucket: OK (${avatarsBucket.public ? 'public' : 'private'})`);
      results.storage.avatars = true;
      if (!avatarsBucket.public) {
        results.issues.push("'avatars' bucket should be public");
      }
    } else {
      console.log('  ❌ avatars bucket: Missing');
      results.issues.push("Storage bucket 'avatars' needs to be created");
    }
  }
} catch (err: any) {
  console.log(`  ❌ Storage check failed: ${err.message}`);
  results.issues.push(`Storage check failed: ${err.message}`);
}

// Test 3: Check Auth Configuration
console.log('\n🔐 Checking Auth Configuration...');

// We can't directly check auth settings via API, but we can test signup
const testEmail = `check_${Date.now()}@test.com`;
const testPassword = 'TestPassword123!';

try {
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword
  });
  
  if (error) {
    if (error.message.includes('rate limit')) {
      console.log('  ⚠️  Email auth: Working (rate limited)');
      results.auth.emailEnabled = true;
    } else if (error.message.includes('Email signups are disabled')) {
      console.log('  ❌ Email auth: DISABLED');
      results.issues.push('Email authentication is disabled in Supabase settings');
    } else {
      console.log(`  ⚠️  Email auth: ${error.message}`);
    }
  } else {
    console.log('  ✅ Email auth: Enabled');
    results.auth.emailEnabled = true;
    
    if (data.user && !data.user.email_confirmed_at) {
      console.log('  ℹ️  Email confirmation: Required');
    }
  }
} catch (err: any) {
  console.log(`  ❌ Auth check failed: ${err.message}`);
}

console.log('  ℹ️  Google OAuth: Check Dashboard → Authentication → Providers');
results.recommendations.push('Configure Google OAuth in Supabase Dashboard if not already done');

// Test 4: Test RLS Policies with a real user
console.log('\n🛡️  Testing RLS Policies...');

const testUserEmail = `rls_test_${Date.now()}@test.com`;
const testUserPassword = 'RLSTest123!';

try {
  // Create test user
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email: testUserEmail,
    password: testUserPassword
  });

  if (signupError && !signupError.message.includes('rate limit')) {
    console.log(`  ⚠️  Could not create test user: ${signupError.message}`);
  } else {
    // Try to sign in
    const { data: sessionData, error: signinError } = await supabase.auth.signInWithPassword({
      email: testUserEmail,
      password: testUserPassword
    });

    if (sessionData?.session) {
      const authedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false },
        global: {
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`
          }
        }
      });

      // Test artists table
      if (results.tables.artists) {
        const { data: artistData, error: artistError } = await authedClient
          .from('artists')
          .insert({ name: 'Test Artist', country: 'US' })
          .select();
        
        if (!artistError && artistData && artistData.length > 0) {
          console.log('  ✅ Artists RLS: Working (insert allowed)');
          results.policies.artists++;
          
          // Cleanup
          await authedClient.from('artists').delete().eq('id', artistData[0].id);
        } else if (artistError) {
          console.log(`  ❌ Artists RLS: ${artistError.message}`);
          results.issues.push(`Artists RLS policy issue: ${artistError.message}`);
        }
      }

      // Test profiles table
      if (results.tables.profiles) {
        const userId = sessionData.user.id;
        const { data: profileData, error: profileError } = await authedClient
          .from('profiles')
          .upsert({ id: userId, full_name: 'Test User' })
          .select();
        
        if (!profileError && profileData) {
          console.log('  ✅ Profiles RLS: Working (upsert allowed)');
          results.policies.profiles++;
        } else if (profileError) {
          console.log(`  ❌ Profiles RLS: ${profileError.message}`);
          results.issues.push(`Profiles RLS policy issue: ${profileError.message}`);
        }
      }
    } else if (signinError) {
      console.log(`  ⚠️  Could not sign in test user: ${signinError.message}`);
    }
  }
} catch (err: any) {
  console.log(`  ⚠️  RLS test skipped: ${err.message}`);
}

// Summary Report
console.log('\n' + '='.repeat(60));
console.log('📊 SUMMARY REPORT');
console.log('='.repeat(60));

console.log('\n✅ Working:');
const working = [];
if (results.tables.artists) working.push('Artists table');
if (results.tables.songs) working.push('Songs table');
if (results.tables.insights) working.push('Insights table');
if (results.tables.profiles) working.push('Profiles table');
if (results.storage.avatars) working.push('Avatars storage bucket');
if (results.auth.emailEnabled) working.push('Email authentication');

if (working.length > 0) {
  working.forEach(item => console.log(`  • ${item}`));
} else {
  console.log('  • None');
}

if (results.issues.length > 0) {
  console.log('\n❌ Issues Found:');
  results.issues.forEach(issue => console.log(`  • ${issue}`));
}

console.log('\n📝 Next Steps for Frontend:');

const steps = [];

if (!results.tables.profiles) {
  steps.push('1. Run setup_profiles.sql in Supabase SQL Editor to create profiles table');
}

if (!results.storage.avatars) {
  steps.push('2. Create "avatars" storage bucket in Supabase Dashboard → Storage');
  steps.push('   - Set it as PUBLIC bucket');
  steps.push('   - Add storage policies (see PROFILE_SETUP.md)');
}

if (results.storage.avatars && !results.issues.some(i => i.includes('public'))) {
  steps.push('3. Verify storage policies for avatars bucket are configured');
}

steps.push('4. Frontend design improvements needed:');
steps.push('   - Add loading spinners for all async operations');
steps.push('   - Add search/filter for artists list');
steps.push('   - Add pagination for large datasets');
steps.push('   - Add proper error boundaries');
steps.push('   - Add toast notifications instead of banner alerts');
steps.push('   - Add responsive design for mobile');
steps.push('   - Add empty states with better visuals');
steps.push('   - Add confirmation modals for delete operations');
steps.push('   - Add inline validation for forms');
steps.push('   - Improve avatar upload with preview and cropping');

if (steps.length > 0) {
  steps.forEach(step => console.log(`  ${step}`));
} else {
  console.log('  • All Supabase setup complete! ✅');
  console.log('  • Focus on frontend UX improvements');
}

console.log('\n' + '='.repeat(60));

// Exit code
if (results.issues.filter(i => !i.includes('rate limit')).length > 0) {
  console.log('\n⚠️  Some issues need attention before frontend will work fully');
  Deno.exit(1);
} else {
  console.log('\n✅ Supabase setup looks good!');
  Deno.exit(0);
}
