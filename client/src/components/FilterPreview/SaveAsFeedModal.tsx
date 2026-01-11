import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { feedConfigApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errorHandler';

interface FilterCriteria {
  filters: Array<{ field: string; operator: string; value: any }>;
  profile_ids?: number[];
}

interface SaveAsFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterCriteria: FilterCriteria | null;
  onSaveSuccess: (feedId: number) => void;
}

export default function SaveAsFeedModal({
  isOpen,
  onClose,
  filterCriteria,
  onSaveSuccess,
}: SaveAsFeedModalProps) {
  const { toast } = useToast();
  const [feedName, setFeedName] = useState('');
  const [feedDescription, setFeedDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!feedName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please enter a feed name',
      });
      return;
    }

    if (!filterCriteria) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No filter criteria available',
      });
      return;
    }

    setIsSaving(true);

    try {
      const response = await feedConfigApi.createFeedConfiguration({
        name: feedName.trim(),
        description: feedDescription.trim() || undefined,
        filter_criteria: {
          ...filterCriteria,
          sort_by: 'submission_date',
          sort_order: 'desc',
        },
      });

      toast({
        title: 'Feed Created',
        description: `Your feed "${feedName}" has been created successfully.`,
      });

      // Reset form
      setFeedName('');
      setFeedDescription('');

      onSaveSuccess(response.id);
    } catch (error) {
      const errorInfo = getErrorMessage(error);
      toast({
        variant: 'destructive',
        title: errorInfo.title || 'Error',
        description: errorInfo.message || 'Failed to create feed',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setFeedName('');
      setFeedDescription('');
      onClose();
    }
  };

  // Count active filters for display
  const filterCount = filterCriteria
    ? filterCriteria.filters.length + (filterCriteria.profile_ids?.length || 0)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save as Feed
          </DialogTitle>
          <DialogDescription>
            Save your current filters as a custom feed to access them anytime.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="feed-name">Feed Name *</Label>
            <Input
              id="feed-name"
              placeholder="e.g., Growth Stocks Feed"
              value={feedName}
              onChange={(e) => setFeedName(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feed-description">Description (Optional)</Label>
            <Input
              id="feed-description"
              placeholder="e.g., Posts from high-growth companies"
              value={feedDescription}
              onChange={(e) => setFeedDescription(e.target.value)}
              disabled={isSaving}
            />
          </div>

          {filterCount > 0 && (
            <div className="p-3 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground">
                This feed will include{' '}
                <span className="font-medium text-foreground">
                  {filterCount} filter{filterCount !== 1 ? 's' : ''}
                </span>{' '}
                based on your current selection.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !feedName.trim()}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Feed
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
