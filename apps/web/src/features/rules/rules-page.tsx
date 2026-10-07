import { DIRECTED_RULE_TYPES, RULE_TYPE, type ParticipantView, type RuleType, type RuleView } from '@line-oa-randomizer/shared';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, IconButton } from '../../components/ui/button';
import { Chip } from '../../components/ui/chip';
import { Dialog } from '../../components/ui/dialog';
import { TextField } from '../../components/ui/field';
import { Page } from '../../components/ui/page';
import { useSnackbar } from '../../components/ui/snackbar';
import { EmptyState, QueryBoundary } from '../../components/ui/states';
import { FeasibilityBadge, FeasibilityBanner } from '../events/feasibility-badge';
import { useEventDetail } from '../events/use-events';
import { TH } from '../../lib/th';
import { useCreateRule, useDeleteRule, useRules } from './use-rules';

const RULE_TYPES = Object.values(RULE_TYPE);

function RuleFormDialog({
  eventId,
  participants,
  onClose,
}: {
  eventId: string;
  participants: ParticipantView[];
  onClose: () => void;
}) {
  const showSnackbar = useSnackbar();
  const createRule = useCreateRule(eventId);
  const [type, setType] = useState<RuleType>(RULE_TYPE.MUTUAL_EXCLUDE);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const isDirected = DIRECTED_RULE_TYPES.includes(type);

  const toggleParticipant = (participantId: string) =>
    setSelectedIds((current) =>
      current.includes(participantId) ? current.filter((id) => id !== participantId) : [...current, participantId],
    );

  function changeType(nextType: RuleType) {
    setType(nextType);
    setSelectedIds([]);
  }

  const canSave = isDirected ? selectedIds.length === 2 : selectedIds.length >= 2;

  return (
    <Dialog
      title={TH.rules.add}
      onClose={onClose}
      actions={
        <>
          <Button variant="text" onClick={onClose}>{TH.common.cancel}</Button>
          <Button
            disabled={!canSave || createRule.isPending}
            onClick={() =>
              createRule.mutate(
                { type, participantIds: selectedIds, note: note.trim() || undefined },
                { onSuccess: onClose, onError: (error) => showSnackbar(error.message) },
              )
            }
          >
            {TH.common.save}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block font-medium">{TH.rules.type}</span>
          <select
            className="min-h-12 w-full rounded-xl border border-outline bg-surface px-3 text-on-surface"
            value={type}
            onChange={(event) => changeType(event.target.value as RuleType)}
          >
            {RULE_TYPES.map((ruleType) => (
              <option key={ruleType} value={ruleType}>{TH.rules.types[ruleType]}</option>
            ))}
          </select>
          <span className="mt-1 block text-xs">{TH.rules.typeHelp[type]}</span>
        </label>

        <fieldset>
          <legend className="mb-1 font-medium">
            {isDirected ? `${TH.rules.from} → ${TH.rules.to} (เลือกตามลำดับ)` : TH.rules.pickPeople}
          </legend>
          <ul className="max-h-56 overflow-auto rounded-xl border border-outline-variant">
            {participants.map((participant) => {
              const order = selectedIds.indexOf(participant.id);
              return (
                <li key={participant.id}>
                  <label className="flex min-h-12 cursor-pointer items-center gap-3 px-3">
                    <input
                      type="checkbox"
                      className="size-5 accent-primary"
                      checked={order >= 0}
                      disabled={isDirected && order < 0 && selectedIds.length >= 2}
                      onChange={() => toggleParticipant(participant.id)}
                    />
                    <span className="flex-1 text-on-surface">{participant.displayName}</span>
                    {isDirected && order >= 0 && <Chip tone="primary">{order === 0 ? TH.rules.from : TH.rules.to}</Chip>}
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
        <TextField label={TH.rules.note} value={note} onChange={(event) => setNote(event.target.value)} />
      </div>
    </Dialog>
  );
}

function RuleRow({ rule, nameById, onDelete }: { rule: RuleView; nameById: Map<string, string>; onDelete: () => void }) {
  const isDirected = DIRECTED_RULE_TYPES.includes(rule.type);
  const names = rule.participantIds.map((id) => nameById.get(id) ?? '?');
  return (
    <li className="flex items-center gap-2 rounded-2xl bg-surface-container py-2 pl-4 pr-1">
      <div className="min-w-0 flex-1 space-y-1">
        <Chip tone="accent">{TH.rules.types[rule.type]}</Chip>
        <p className="text-sm">{names.join(isDirected ? ' → ' : ', ')}</p>
        {rule.note && <p className="text-xs text-on-surface-variant">{rule.note}</p>}
      </div>
      <IconButton icon="delete" label={TH.common.delete} onClick={onDelete} />
    </li>
  );
}

export function RulesPage() {
  const { eventId = '' } = useParams();
  const showSnackbar = useSnackbar();
  const eventQuery = useEventDetail(eventId);
  const rulesQuery = useRules(eventId);
  const deleteRule = useDeleteRule(eventId);
  const [isAdding, setIsAdding] = useState(false);

  return (
    <Page title={TH.rules.title} backTo={`/manage/${eventId}`} action={<FeasibilityBadge feasibility={eventQuery.data?.feasibility ?? null} />}>
      <QueryBoundary query={eventQuery}>
        {(event) => {
          const nameById = new Map(event.participants.map((participant) => [participant.id, participant.displayName]));
          return (
            <>
              <FeasibilityBanner event={event} />
              <QueryBoundary query={rulesQuery}>
                {(rules) =>
                  rules.length === 0 ? (
                    <EmptyState message={TH.rules.empty} />
                  ) : (
                    <ul className="space-y-2">
                      {rules.map((rule) => (
                        <RuleRow
                          key={rule.id}
                          rule={rule}
                          nameById={nameById}
                          onDelete={() => deleteRule.mutate(rule.id, { onError: (error) => showSnackbar(error.message) })}
                        />
                      ))}
                    </ul>
                  )
                }
              </QueryBoundary>
              <Button icon="add" className="w-full" onClick={() => setIsAdding(true)}>{TH.rules.add}</Button>
              {isAdding && (
                <RuleFormDialog eventId={eventId} participants={event.participants} onClose={() => setIsAdding(false)} />
              )}
            </>
          );
        }}
      </QueryBoundary>
    </Page>
  );
}
