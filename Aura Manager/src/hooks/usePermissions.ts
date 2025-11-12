import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PermissionsService } from '@/services/permissionsService';
import { supabase } from '@/integrations/supabase/client';

export const usePermissions = () => {
  const queryClient = useQueryClient();

  const { data: permissions, isLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      return PermissionsService.getAllPermissions(user.id);
    },
  });

  const grantPermission = useMutation({
    mutationFn: async (permissionType: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      await PermissionsService.grantPermission(user.id, permissionType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
  });

  const revokePermission = useMutation({
    mutationFn: async (permissionType: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      await PermissionsService.revokePermission(user.id, permissionType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
  });

  const hasPermission = (permissionType: string) => {
    return permissions?.find((p) => p.permission_type === permissionType)?.granted ?? false;
  };

  return {
    permissions,
    isLoading,
    grantPermission,
    revokePermission,
    hasPermission,
  };
};
