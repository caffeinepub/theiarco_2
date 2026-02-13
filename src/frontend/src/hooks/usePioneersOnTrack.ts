import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Pioneer, PioneerMonthlyHours } from '../backend';

/**
 * Hook to calculate the number of pioneers who are "on track"
 * (averaging 50 or more hours per month for the given service year)
 */
export function usePioneersOnTrack(serviceYear: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<number>({
    queryKey: ['pioneersOnTrack', serviceYear],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');

      // Get all pioneers
      const pioneers: Pioneer[] = await actor.getAllPioneers();

      // For each pioneer, calculate their average hours for the service year
      let onTrackCount = 0;

      for (const pioneer of pioneers) {
        // Get monthly hours for this pioneer's service year
        const monthlyHours: PioneerMonthlyHours[] = await actor.getPioneerHoursForServiceYear(
          pioneer.id,
          serviceYear
        );

        // Calculate average
        if (monthlyHours.length > 0) {
          const totalHours = monthlyHours.reduce((sum, record) => {
            return sum + Number(record.hours);
          }, 0);

          const average = totalHours / monthlyHours.length;

          // Count as "on track" if average is 50 or more
          if (average >= 50) {
            onTrackCount++;
          }
        }
        // If no hours entered (monthlyHours.length === 0), don't count them as on track
      }

      return onTrackCount;
    },
    enabled: !!actor && !actorFetching && !!serviceYear,
  });
}
