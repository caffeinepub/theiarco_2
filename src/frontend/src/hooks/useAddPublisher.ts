import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

type PrivilegeOption = 'Unbaptized Publisher' | 'Publisher' | 'Ministerial Servant' | 'Elder';

interface AddPublisherInput {
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

export function useAddPublisher() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddPublisherInput) => {
      if (!actor) throw new Error('Actor not available');

      const privilegesObject = mapPrivilegesToBackend(input.privileges);

      const publisherId = await actor.addPublisher(
        input.fullName,
        BigInt(input.fieldServiceGroup),
        privilegesObject,
        input.isGroupOverseer,
        input.isGroupAssistant,
        input.isActive,
        '' // notes default to empty string
      );

      return publisherId;
    },
    onSuccess: () => {
      // Invalidate publishers list query when it's implemented
      queryClient.invalidateQueries({ queryKey: ['publishers'] });
    },
  });
}
