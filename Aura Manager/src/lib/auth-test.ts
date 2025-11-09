import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1).single();
    
    if (error && !error.message.includes('row')) {
      console.error('❌ Supabase connection failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
    
  } catch (error) {
    console.error('🚨 Supabase connection test failed:', error);
    return false;
  }
};

export const testEmailAuth = async (email: string, password: string) => {
  try {
    console.log('🔍 Testing email authentication...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('❌ Email auth failed:', error);
      toast.error(`Authentication failed: ${error.message}`);
      return false;
    }
    
    console.log('✅ Email authentication successful');
    toast.success('Authentication successful!');
    return true;
    
  } catch (error) {
    console.error('🚨 Email auth test failed:', error);
    toast.error('Authentication system error');
    return false;
  }
};

export const createTestAccount = async () => {
  const testEmail = 'test@auramanager.app';
  const testPassword = 'testpass123';
  
  try {
    console.log('🔍 Creating test account...');
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (error) {
      if (error.message.includes('already registered')) {
        console.log('ℹ️ Test account already exists');
        return { email: testEmail, password: testPassword };
      }
      console.error('❌ Failed to create test account:', error);
      return null;
    }
    
    console.log('✅ Test account created successfully');
    return { email: testEmail, password: testPassword };
    
  } catch (error) {
    console.error('🚨 Test account creation failed:', error);
    return null;
  }
};