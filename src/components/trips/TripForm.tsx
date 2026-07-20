import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/DatePicker'
import { createTripSchema, type CreateTripSchema } from '@/utils/tripSchema'
import { useTripContext } from '@/context/TripContext'
import { useLanguage } from '@/context/LanguageContext'
import type { Trip } from '@/types/trip'

interface TripFormProps {
  editTrip?: Trip
}

export function TripForm({ editTrip }: TripFormProps) {
  const navigate = useNavigate()
  const { createTrip, updateTrip } = useTripContext()
  const { t } = useLanguage()
  const isEdit = !!editTrip

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CreateTripSchema>({
    resolver: zodResolver(createTripSchema),
    mode: 'onChange',
    defaultValues: {
      name: editTrip?.name ?? '',
      startDate: editTrip?.startDate ?? '',
      endDate: editTrip?.endDate ?? '',
    },
  })

  useEffect(() => {
    if (editTrip) {
      reset({
        name: editTrip.name,
        startDate: editTrip.startDate,
        endDate: editTrip.endDate,
      })
    }
  }, [editTrip, reset])

  const today = new Date().toISOString().split('T')[0]

  function onSubmit(data: CreateTripSchema) {
    if (isEdit && editTrip) {
      updateTrip({ ...editTrip, ...data })
      navigate(`/trip/${editTrip.id}/dashboard`)
    } else {
      const trip = createTrip(data)
      navigate(`/trip/${trip.id}/dashboard`)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {/* Trip Name */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name" className="text-sm font-semibold text-gray-700">{t('tripName')}</Label>
        <Input
          id="name"
          placeholder={t('tripNamePlaceholder')}
          className="h-12 rounded-xl border-gray-200 focus:border-primary"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        {errors.name && (
          <p className="text-xs text-red-500" role="alert">{errors.name.message}</p>
        )}
      </div>

      {/* Travel Period */}
      <fieldset className="border-0 p-0 m-0">
        <legend className="text-sm font-semibold text-gray-700 mb-2">{t('travelPeriod')}</legend>
        <div className="flex gap-3">
          <div className="flex-1 flex flex-col gap-1">
            <Label htmlFor="startDate" className="text-xs text-gray-500">{t('from')}</Label>
            <DatePicker
              id="startDate"
              min={today}
              value={watch('startDate')}
              onChange={(v) => setValue('startDate', v, { shouldValidate: true, shouldDirty: true })}
              placeholder={t('from')}
              invalid={!!errors.startDate}
              aria-label={t('from')}
            />
            {errors.startDate && (
              <p className="text-xs text-red-500" role="alert">{errors.startDate.message}</p>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <Label htmlFor="endDate" className="text-xs text-gray-500">{t('to')}</Label>
            <DatePicker
              id="endDate"
              min={watch('startDate') || today}
              value={watch('endDate')}
              onChange={(v) => setValue('endDate', v, { shouldValidate: true, shouldDirty: true })}
              placeholder={t('to')}
              invalid={!!errors.endDate}
              aria-label={t('to')}
            />
            {errors.endDate && (
              <p className="text-xs text-red-500" role="alert">{errors.endDate.message}</p>
            )}
          </div>
        </div>
      </fieldset>

      <Button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="mt-2 h-12 w-full rounded-xl text-base font-semibold"
      >
        {isSubmitting
          ? (isEdit ? t('saving') : t('creating'))
          : (isEdit ? t('saveChanges') : t('createTripBtn'))
        }
      </Button>
    </form>
  )
}
