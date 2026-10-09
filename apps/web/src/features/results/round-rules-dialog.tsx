import { DIRECTED_RULE_TYPES } from '@line-oa-randomizer/shared';
import { Dialog } from '../../components/ui/dialog';
import { QueryBoundary } from '../../components/ui/states';
import { TH } from '../../lib/th';
import { useRoundRules } from './use-results';

export function RoundRulesDialog({
  eventId,
  version,
  onClose,
}: {
  eventId: string;
  version: number;
  onClose: () => void;
}) {
  const rulesQuery = useRoundRules(eventId, version);
  return (
    <Dialog title={`${TH.results.rulesTitle} · ${TH.common.round} ${version}`} onClose={onClose}>
      <QueryBoundary query={rulesQuery}>
        {(roundRules) => {
          if (!roundRules.recorded) return <p>{TH.results.rulesMissing}</p>;
          if (roundRules.rules.length === 0) return <p>{TH.results.rulesEmpty}</p>;
          return (
            <ul className="space-y-3 text-on-surface">
              {roundRules.rules.map((rule, index) => {
                const isDirected = DIRECTED_RULE_TYPES.includes(rule.type);
                return (
                  <li key={`${rule.type}-${index}`}>
                    <p className="font-medium">{TH.rules.types[rule.type]}</p>
                    <p>{rule.participantNames.join(isDirected ? ' → ' : ', ')}</p>
                    {rule.note && <p className="text-on-surface-variant">{rule.note}</p>}
                  </li>
                );
              })}
            </ul>
          );
        }}
      </QueryBoundary>
    </Dialog>
  );
}
