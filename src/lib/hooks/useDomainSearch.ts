import { useMutation, useQuery } from '@tanstack/react-query';

export function useDomainSearch() {
  return useMutation({
    mutationFn: async (domain: string) => {
      const response = await fetch('/api/domain/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Search failed');
      }
      
      return response.json();
    }
  });
}

export function useUserSubscription() {
  return useQuery({
    queryKey: ['user-subscription'],
    queryFn: async () => {
      const response = await fetch('/api/user/subscription');
      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }
      return response.json();
    }
  });
}

export function useSavedDomains() {
  return useQuery({
    queryKey: ['saved-domains'],
    queryFn: async () => {
      const response = await fetch('/api/domains/saved');
      if (!response.ok) {
        throw new Error('Failed to fetch saved domains');
      }
      return response.json();
    }
  });
}

export function useSaveDomain() {
  return useMutation({
    mutationFn: async ({ domain, notes }: { domain: string; notes?: string }) => {
      const response = await fetch('/api/domains/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, notes })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save domain');
      }
      
      return response.json();
    }
  });
}