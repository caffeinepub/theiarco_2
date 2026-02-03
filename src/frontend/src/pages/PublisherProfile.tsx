import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useGetPublisher } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PublisherProfile() {
  const navigate = useNavigate();
  const { id } = useParams({ strict: false });
  
  // Convert string ID to bigint for backend query
  const publisherId = id ? BigInt(id) : BigInt(0);
  
  const { data: publisher, isLoading, isError } = useGetPublisher(publisherId);

  // Helper function to render privilege labels
  const renderPrivileges = (privileges: {
    publisher: boolean;
    servant: boolean;
    elder: boolean;
  }) => {
    const labels: string[] = [];
    if (privileges.elder) labels.push('Elder');
    if (privileges.servant) labels.push('Ministerial Servant');
    if (privileges.publisher) labels.push('Publisher');
    if (labels.length === 0) labels.push('Unbaptized Publisher');
    return labels.join(', ');
  };

  const handleBackClick = () => {
    navigate({ to: '/publishers' });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-3" />
          <span className="text-muted-foreground">Loading publisher details...</span>
        </div>
      </div>
    );
  }

  if (isError || !publisher) {
    return (
      <div className="p-6">
        <Button
          onClick={handleBackClick}
          variant="outline"
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Publishers
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg mb-4">Publisher not found</p>
          <p className="text-sm text-muted-foreground">
            The publisher you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Button
        onClick={handleBackClick}
        variant="outline"
        className="mb-6 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Publishers
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">{publisher.fullName}</h1>
        {!publisher.isActive && (
          <Badge variant="secondary" className="text-sm">
            Inactive
          </Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Field Service Group</p>
              <p className="text-lg font-semibold">{publisher.fieldServiceGroup.toString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Privileges</p>
              <p className="text-lg">{renderPrivileges(publisher.privileges)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Responsibilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Group Overseer</p>
              <p className="text-lg">{publisher.isGroupOverseer ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Group Assistant</p>
              <p className="text-lg">{publisher.isGroupAssistant ? 'Yes' : 'No'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {publisher.notes && publisher.notes.trim() !== '' && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{publisher.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
