// src/utils/tripSchema.ts
import { z } from 'zod'

export const createTripSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Bitte gib einen Reisenamen ein')
      .max(60, 'Name darf max. 60 Zeichen haben'),
    startDate: z.string().min(1, 'Startdatum ist erforderlich'),
    endDate: z.string().min(1, 'Enddatum ist erforderlich'),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'Enddatum muss nach dem Startdatum liegen',
    path: ['endDate'],
  })

export type CreateTripSchema = z.infer<typeof createTripSchema>
