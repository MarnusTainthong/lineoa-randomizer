import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../../components/ui/button';
import { ConfirmDialog } from '../../components/ui/dialog';
import { TextField } from '../../components/ui/field';
import { Page } from '../../components/ui/page';
import { Switch } from '../../components/ui/switch';
import { useSnackbar } from '../../components/ui/snackbar';
import { TH } from '../../lib/th';
import { useCreateEvent } from './use-events';

const createEventSchema = z.object({
  name: z.string().trim().min(1, 'กรุณาใส่ชื่อห้อง').max(80),
  allowViewAllResults: z.boolean(),
});
type CreateEventFormValues = z.infer<typeof createEventSchema>;

export function CreateEventPage() {
  const navigate = useNavigate();
  const showSnackbar = useSnackbar();
  const createEvent = useCreateEvent();
  const [pendingValues, setPendingValues] = useState<CreateEventFormValues | null>(null);
  const { register, handleSubmit, control, formState } = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: { name: '', allowViewAllResults: false },
  });

  const onSubmit = handleSubmit((values) => setPendingValues(values));

  function confirmCreate() {
    if (!pendingValues) return;
    createEvent.mutate(
      {
        name: pendingValues.name,
        allowViewAllResults: pendingValues.allowViewAllResults,
      },
      {
        onSuccess: (event) => navigate(`/manage/${event.id}`, { replace: true }),
        onError: (error) => showSnackbar(error.message),
      },
    );
  }

  return (
    <Page title={TH.manage.newTitle} backTo="/manage">
      <form onSubmit={onSubmit} className="space-y-4">
        <TextField
          label={TH.manage.name}
          error={formState.errors.name?.message}
          {...register('name')}
        />
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
        <Button type="submit" className="w-full">
          {TH.manage.create}
        </Button>
      </form>
      {pendingValues && (
        <ConfirmDialog
          title={TH.manage.create}
          message={TH.manage.createConfirm(pendingValues.name)}
          confirmLabel={TH.manage.create}
          isBusy={createEvent.isPending}
          onClose={() => {
            if (!createEvent.isPending) setPendingValues(null);
          }}
          onConfirm={confirmCreate}
        />
      )}
    </Page>
  );
}
