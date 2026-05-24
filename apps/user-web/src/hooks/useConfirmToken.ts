import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { confirmRegistration } from '../services/registration'

const token = new URLSearchParams(window.location.search).get('confirmationToken')

export function useConfirmToken() {
  const query = useQuery({
    queryKey: ['confirmToken', token],
    queryFn: () => confirmRegistration(token!),
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  useEffect(() => {
    if (query.isSuccess && token) {
      const url = new URL(window.location.href)
      url.searchParams.delete('confirmationToken')
      window.history.replaceState({}, '', url.toString())
    }
  }, [query.isSuccess])

  return { ...query, hasToken: !!token }
}
