import { Link, useRouterState } from '@tanstack/react-router';
import { useGetAllPublishers } from '../hooks/useQueries';
import { Users } from 'lucide-react';
import type { Publisher } from '../backend';
import { getGroupColor } from '@/utils/fieldServiceGroupColors';

export default function FieldServiceGroups() {
  const routerState = useRouterState();
  
  const { data: publishers = [], isLoading } = useGetAllPublishers();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Hard-coded groups 1-4
  const groups = [1, 2, 3, 4];

  // Helper function to get overseer for a group
  const getOverseer = (groupNumber: number): Publisher | undefined => {
    return publishers.find(
      (p) => Number(p.fieldServiceGroup) === groupNumber && p.isGroupOverseer
    );
  };

  // Helper function to get assistant for a group
  const getAssistant = (groupNumber: number): Publisher | undefined => {
    return publishers.find(
      (p) => Number(p.fieldServiceGroup) === groupNumber && p.isGroupAssistant
    );
  };

  // Helper function to get active publishers for a group (sorted A-Z)
  const getGroupPublishers = (groupNumber: number): Publisher[] => {
    return publishers
      .filter(
        (p) => Number(p.fieldServiceGroup) === groupNumber && p.isActive
      )
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Field Service Groups</h1>

      <div className="space-y-6">
        {groups.map((groupNumber) => {
          const overseer = getOverseer(groupNumber);
          const assistant = getAssistant(groupNumber);
          const groupPublishers = getGroupPublishers(groupNumber);
          const groupColor = getGroupColor(groupNumber);

          return (
            <Link
              key={groupNumber}
              to="/field-service-groups/$groupNumber"
              params={{ groupNumber: groupNumber.toString() }}
              className="block border rounded-lg bg-card hover:bg-accent/50 transition-colors cursor-pointer overflow-hidden"
            >
              {/* Top colored bar */}
              <div className="h-1.5 w-full" style={{ backgroundColor: groupColor }} />
              
              {/* Card content */}
              <div className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Users className="h-6 w-6" style={{ color: groupColor }} />
                  <span style={{ color: groupColor }}>
                    Group {groupNumber}
                  </span>
                </h2>

                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-foreground">Overseer: </span>
                    {overseer ? (
                      <span className="text-foreground">{overseer.fullName}</span>
                    ) : (
                      <span className="text-muted-foreground">No overseer assigned</span>
                    )}
                  </div>

                  <div>
                    <span className="font-medium text-foreground">Assistant: </span>
                    {assistant ? (
                      <span className="text-foreground">{assistant.fullName}</span>
                    ) : (
                      <span className="text-muted-foreground">No assistant assigned</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-foreground mb-2">Publishers:</h3>
                  {groupPublishers.length > 0 ? (
                    <ul className="space-y-1 ml-4">
                      {groupPublishers.map((publisher) => (
                        <li key={publisher.id.toString()} className="text-foreground">
                          • {publisher.fullName}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground ml-4">No active publishers in this group</p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
