# Admin Access Setup Guide

## Overview
Your app now requires proper authentication. This guide shows how to set yourself up as an admin while keeping the app secure.

---

## Option 1: Quick Admin Setup (Recommended)

### Step 1: Create Your Admin Account
1. Visit: https://supabasetest-six.vercel.app
2. Click "Sign Up" 
3. Create your admin account with your email
4. Verify your email

### Step 2: Mark Yourself as Admin in Supabase
1. Go to Supabase Dashboard → Authentication → Users
2. Find your user in the list
3. Click on your user
4. Scroll to "User Metadata" or "Raw User Meta Data"
5. Click "Edit" or add this JSON:
```json
{
  "role": "admin"
}
```
6. Save

### Step 3: Check Admin Status in App
Your ConnectSpotify and other components can now check:
```typescript
const { data: { user } } = await supabase.auth.getUser();
const isAdmin = user?.user_metadata?.role === 'admin';
```

---

## Option 2: Admin Role via Database

### Create an admin_users table:

```sql
-- Run this in Supabase SQL Editor
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.admin_users enable row level security;

-- Allow anyone to check if a user is admin
create policy "Anyone can check admin status" 
  on public.admin_users 
  for select 
  using (true);

-- Only admins can add admins (after you add yourself first)
create policy "Admins can manage admins" 
  on public.admin_users 
  for all 
  using (auth.uid() in (select user_id from public.admin_users));
```

### Add yourself as admin:

```sql
-- Replace YOUR_USER_ID with your actual user ID from auth.users
insert into public.admin_users (user_id) 
values ('YOUR_USER_ID');
```

### Check admin in app:

```typescript
const checkAdmin = async () => {
  const { data } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .single();
  return !!data;
};
```

---

## Option 3: Environment-Based Admin (Dev Only)

### For local development only:

Add to `.env.local`:
```
VITE_ADMIN_EMAILS=your-email@gmail.com,another-admin@example.com
```

### Check in code:
```typescript
const isAdmin = import.meta.env.VITE_ADMIN_EMAILS
  ?.split(',')
  .includes(user?.email);
```

**WARNING:** Don't add VITE_ADMIN_EMAILS to Vercel production! Only use locally.

---

## Implementing Admin Features

### Example: Admin-only settings panel

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const AdminPanel = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // Option 1: Check user metadata
      setIsAdmin(user?.user_metadata?.role === 'admin');
      
      // OR Option 2: Check database
      // const { data } = await supabase
      //   .from('admin_users')
      //   .select('user_id')
      //   .eq('user_id', user?.id)
      //   .single();
      // setIsAdmin(!!data);
    };
    checkAdminStatus();
  }, []);
  
  if (!isAdmin) return null;
  
  return (
    <div className="p-4 border border-yellow-500 rounded">
      <h3>Admin Panel</h3>
      <p>Only admins see this!</p>
      {/* Your admin controls here */}
    </div>
  );
};
```

---

## Security Best Practices

### ✅ DO:
- Require authentication (`DEV_MODE = false`)
- Use RLS policies in Supabase
- Check admin status server-side for sensitive operations
- Keep admin lists in database, not code
- Use Supabase Row Level Security for admin tables

### ❌ DON'T:
- Leave `DEV_MODE = true` in production
- Store admin emails in frontend code
- Trust client-side checks for critical operations
- Expose admin API keys in environment variables
- Skip RLS policies

---

## Testing Admin Access

1. Sign in with your admin account
2. Open browser console (F12)
3. Run:
```javascript
const { data: { user } } = await supabase.auth.getUser();
console.log('User metadata:', user.user_metadata);
console.log('Is admin:', user.user_metadata?.role === 'admin');
```

---

## Current Status

- ✅ Authentication required (DEV_MODE = false)
- ✅ RLS enabled on Spotify tables
- ⚠️ No admin role system yet (choose Option 1, 2, or 3 above)
- ✅ All routes protected by authentication
- ✅ Spotify integration will work properly with real sessions

---

## Quick Start (5 minutes):

1. **Turn off DEV_MODE** (already done ✓)
2. **Create your account** at https://supabasetest-six.vercel.app
3. **Add yourself as admin** in Supabase → Users → Your user → User Metadata:
   ```json
   { "role": "admin" }
   ```
4. **Build admin features** using the examples above
5. **Deploy** the changes

Done! You now have secure authentication + admin privileges.
