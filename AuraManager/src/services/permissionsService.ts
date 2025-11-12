import { supabase } from '@/integrations/supabase/client';

export class PermissionsService {
  static async checkPermission(
    userId: string,
    permissionType: string
  ): Promise<boolean> {
    const { data } = await supabase
      .from('permissions')
      .select('granted')
      .eq('user_id', userId)
      .eq('permission_type', permissionType)
      .single();

    return data?.granted ?? false;
  }

  static async grantPermission(
    userId: string,
    permissionType: string
  ): Promise<void> {
    await supabase.from('permissions').upsert({
      user_id: userId,
      permission_type: permissionType,
      granted: true,
    });
  }

  static async revokePermission(
    userId: string,
    permissionType: string
  ): Promise<void> {
    await supabase
      .from('permissions')
      .update({ granted: false })
      .eq('user_id', userId)
      .eq('permission_type', permissionType);
  }

  static async getAllPermissions(userId: string) {
    const { data } = await supabase
      .from('permissions')
      .select('*')
      .eq('user_id', userId);

    return data ?? [];
  }
}
