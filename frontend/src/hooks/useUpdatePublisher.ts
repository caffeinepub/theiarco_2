import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PublisherId } from '../backend';

type PrivilegeOption = 'Unbaptized Publisher' | 'Publisher' | 'Ministerial Servant' | 'Elder';

interface UpdatePublisherInput {
  id: PublisherId;
  fullName: string;
  fieldServiceGroup: number;
  privileges: PrivilegeOption;
  isGroupOverseer: boolean;
  isGroupAssistant: boolean;
  isActive: boolean;
}

// Map UI privilege selection to backend privilege object
function mapPrivilegesToBackend(privilege: PrivilegeOption) {
  switch (privilege) {
    case 'Unbaptized Publisher':
      return { publisher: false, servant: false, elder: false };
    case 'Publisher':
      return { publisher: true, servant: false, elder: false };
    case 'Ministerial Servant':
      return { publisher: true, servant: true, elder: false };
    case 'Elder':
      return { publisher: true, servant: false, elder: true };
  }
}

export function useUpdatePublisher() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdatePublisherInput) => {
      if (!actor) throw new Error('Actor not available');

      const privilegesObject = mapPrivilegesToBackend(input.privileges);

      await actor.updatePublisher(
        input.id,
        input.fullName,
        BigInt(input.fieldServiceGroup),
        privilegesObject,
        input.isGroupOverseer,
        input.isGroupAssistant,
        input.isActive
      );
    },
    onSuccess: () => {
      // Invalidate publishers list query to refresh the table
      queryClient.invalidateQueries({ queryKey: ['publishers'] });
    },
  });
}
