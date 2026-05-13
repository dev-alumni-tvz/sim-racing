import { useMutation } from '@tanstack/react-query'
import type { RegistrationRequest, RegistrationResponse } from '@sim-racing/api-types'
import { postRegistration } from '../services/registration'

export function useRegistration() {
  return useMutation<RegistrationResponse, Error, RegistrationRequest>({
    mutationFn: postRegistration,
  })
}
