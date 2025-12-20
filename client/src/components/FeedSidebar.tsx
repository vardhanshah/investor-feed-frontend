import { Button } from '@/components/ui/button';
import { Loader2, Save, X } from 'lucide-react';
import { useFeedManagement } from '@/hooks/useFeedManagement';
import { FeedFilterForm } from '@/components/FeedFilterForm';

interface FeedSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onFeedCreated: (feedId?: number) => void;
  editingFeedId?: number | null;
}

export default function FeedSidebar({ isOpen, onClose, onFeedCreated, editingFeedId }: FeedSidebarProps) {
  // Use shared feed management hook
  const {
    filterConfigs,
    filterGroups,
    isLoadingFilters,
    isLoadingFeed,
    isSaving,
    saveFeed,
    feedName,
    feedDescription,
    filterValues,
    numberFilterStates,
    profileSelections,
    setFeedName,
    setFeedDescription,
    setProfileSelections,
    handleFilterChange,
    handleNumberFilterFromChange,
    handleNumberFilterToChange,
  } = useFeedManagement({
    editingFeedId,
    isActive: isOpen,
    onSuccess: (feedId, isEdit) => {
      onFeedCreated(feedId);
      if (!isEdit) {
        // Close sidebar after creating new feed
        onClose();
      }
      // Keep sidebar open after editing (user can see updated data)
    },
  });

  if (!isOpen) return null;

  return (
    <div className="h-full md:h-[calc(100vh-5rem)] bg-background border-0 md:border md:border-border md:rounded-lg flex flex-col md:sticky md:top-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-xl font-alata font-bold text-foreground">
          {editingFeedId ? 'Edit Feed' : 'Create Custom Feed'}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoadingFilters || isLoadingFeed ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(280,100%,70%)]" />
          </div>
        ) : (
          <FeedFilterForm
            filterConfigs={filterConfigs}
            filterGroups={filterGroups}
            filterValues={filterValues}
            numberFilterStates={numberFilterStates}
            profileSelections={profileSelections}
            feedName={feedName}
            feedDescription={feedDescription}
            onFilterChange={handleFilterChange}
            onNumberFilterFromChange={handleNumberFilterFromChange}
            onNumberFilterToChange={handleNumberFilterToChange}
            onProfileSelectionsChange={setProfileSelections}
            onFeedNameChange={setFeedName}
            onFeedDescriptionChange={setFeedDescription}
            showFeedDetails={true}
            showCombinedQuery={true}
          />
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-background">
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border text-foreground hover:bg-muted font-alata"
          >
            Close
          </Button>
          <Button
            onClick={saveFeed}
            disabled={isSaving}
            className="bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] hover:from-[hsl(280,100%,75%)] hover:to-[hsl(200,100%,75%)] text-black font-alata"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {editingFeedId ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {editingFeedId ? 'Update Feed' : 'Create Feed'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
