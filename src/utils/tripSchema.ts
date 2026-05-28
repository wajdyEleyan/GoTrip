// Autor: Eya Mathlouthi
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
    budgetMin: z.number({ invalid_type_error: 'Budget muss eine Zahl sein' }).min(0, 'Budget muss ≥ 0 sein'),
    budgetMax: z.number({ invalid_type_error: 'Budget muss eine Zahl sein' }).min(0, 'Budget muss ≥ 0 sein'),
    groupSize: z
      .number({ invalid_type_error: 'Gruppengröße muss eine Zahl sein' })
      .int()
      .min(2, 'Mindestens 2 Personen')
      .max(50, 'Maximal 50 Personen'),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'Enddatum muss nach dem Startdatum liegen',
    path: ['endDate'],
  })
  .refine((data) => data.budgetMax >= data.budgetMin, {
    message: 'Max. Budget muss ≥ Min. Budget sein',
    path: ['budgetMax'],
  })

export type CreateTripSchema = z.infer<typeof createTripSchema>
