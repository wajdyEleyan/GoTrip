// Autor: Eya Mathlouthi
// src/components/trips/TripForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BudgetRangeInput } from './BudgetRangeInput'
import { GroupSizeStepper } from './GroupSizeStepper'
import { createTripSchema, type CreateTripSchema } from '@/utils/tripSchema'
import { useTripContext } from '@/context/TripContext'

export function TripForm() {
  const navigate = useNavigate()
  const { createTrip } = useTripContext()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CreateTripSchema>({
    resolver: zodResolver(createTripSchema),
    mode: 'onChange',
    defaultValues: {
      groupSize: 2,
      budgetMin: 0,
      budgetMax: 0,
    },
  })

  const groupSize = watch('groupSize')
  const budgetMin = watch('budgetMin')
  const budgetMax = watch('budgetMax')
  const today = new Date().toISOString().split('T')[0]

  function onSubmit(data: CreateTripSchema) {
    const trip = createTrip(data)
    navigate(`/trip/${trip.id}/dashboard`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {/* Trip Name */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Trip Name *</Label>
        <Input
          id="name"
          placeholder="z.B. Sommerwochenende Barcelona"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          {...register('name')}
        />
        {errors.name && (
          <p id="name-error" className="text-xs text-red-500" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Travel Period */}
      <fieldset className="border-0 p-0 m-0">
        <legend className="text-sm font-medium text-gray-700 mb-1.5">Reisezeitraum *</legend>
        <div className="flex gap-3">
          <div className="flex-1 flex flex-col gap-1">
            <Label htmlFor="startDate" className="text-xs text-gray-500">Von</Label>
            <Input
              id="startDate"
              type="date"
              min={today}
              aria-invalid={!!errors.startDate}
              {...register('startDate')}
            />
            {errors.startDate && (
              <p className="text-xs text-red-500" role="alert">{errors.startDate.message}</p>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <Label htmlFor="endDate" className="text-xs text-gray-500">Bis</Label>
            <Input
              id="endDate"
              type="date"
              min={today}
              aria-invalid={!!errors.endDate}
              {...register('endDate')}
            />
            {errors.endDate && (
              <p className="text-xs text-red-500" role="alert">{errors.endDate.message}</p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Budget Range */}
      <div className="flex flex-col gap-1.5">
        <Label>Budget pro Person *</Label>
        <BudgetRangeInput
          minValue={budgetMin}
          maxValue={budgetMax}
          onMinChange={(v) => setValue('budgetMin', v, { shouldValidate: true })}
          onMaxChange={(v) => setValue('budgetMax', v, { shouldValidate: true })}
          minError={errors.budgetMin?.message}
          maxError={errors.budgetMax?.message}
        />
      </div>

      {/* Group Size */}
      <div className="flex flex-col gap-1.5">
        <Label>Gruppengröße *</Label>
        <GroupSizeStepper
          value={groupSize}
          onChange={(v) => setValue('groupSize', v, { shouldValidate: true })}
        />
        {errors.groupSize && (
          <p className="text-xs text-red-500" role="alert">{errors.groupSize.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="mt-2 w-full"
        aria-label="Reise erstellen"
      >
        {isSubmitting ? 'Wird erstellt…' : 'Create Trip'}
      </Button>
    </form>
  )
}
