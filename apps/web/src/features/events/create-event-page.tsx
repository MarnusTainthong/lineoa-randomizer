import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../../components/ui/button';
import { TextAreaField, TextField } from '../../components/ui/field';
import { Page } from '../../components/ui/page';
import { Switch } from '../../components/ui/switch';
import { useSnackbar } from '../../components/ui/snackbar';
import { TH } from '../../lib/th';
import { useCreateEvent } from './use-events';

const createEventSchema = z.object({
  name: z.string().trim().min(1, 'กรุณาใส่ชื่อห้อง').max(80),
  description: z.string().max(500).optional(),
  budget: z.string().regex(/^\d*$/, 'ใส่ตัวเลขเท่านั้น').optional(),
  exchangeDate: z.string().optional(),
  allowViewAllResults: z.boolean(),
});
type CreateEventFormValues = z.infer<typeof createEventSchema>;

export function CreateEventPage() {
  const navigate = useNavigate();
  const showSnackbar = useSnackbar();
  const createEvent = useCreateEvent();
  const { register, handleSubmit, control, formState } = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: { name: '', allowViewAllResults: false },
  });

  const onSubmit = handleSubmit((values) =>
    createEvent.mutate(
      {
        name: values.name,
        description: values.description?.trim() || undefined,
        budget: values.budget ? Number(values.budget) : undefined,
        exchangeDate: values.exchangeDate || undefined,
        allowViewAllResults: values.allowViewAllResults,
      },
      {
        onSuccess: (event) => navigate(`/manage/${event.id}`, { replace: true }),
        onError: (error) => showSnackbar(error.message),
      },
    ),
  );

  return (
    <Page title={TH.manage.newTitle} backTo="/manage">
      <form onSubmit={onSubmit} className="space-y-4">
        <TextField label={TH.manage.name} error={formState.errors.name?.message} {...register('name')} />
        <TextAreaField label={TH.manage.description} {...register('description')} />
        <TextField label={TH.manage.budget} inputMode="numeric" error={formState.errors.budget?.message} {...register('budget')} />
        <TextField label={TH.manage.exchangeDate} type="date" {...register('exchangeDate')} />
        <Controller
          control={control}
          name="allowViewAllResults"
          render={({ field }) => (
            <Switch
              label={TH.manage.allowViewAll}
              hint={TH.manage.allowViewAllHint}
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Button type="submit" className="w-full" disabled={createEvent.isPending}>
          {TH.manage.create}
        </Button>
      </form>
    </Page>
  );
}
