import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Save, Filter as FilterIcon } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useFeedManagement } from '@/hooks/useFeedManagement';
import { FeedFilterForm } from '@/components/FeedFilterForm';

export default function Filters() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();

  // Use shared feed management hook
  const {
    filterConfigs,
    filterGroups,
    isLoadingFilters,
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
    isActive: !!user, // Only fetch when user is authenticated
    onSuccess: () => {
      // Navigate to home after creating feed
      setLocation('/home');
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/');
    }
  }, [authLoading, user, setLocation]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(280,100%,70%)]" />
      </div>
    );
  }

  // Don't render if no user (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation('/home')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <FilterIcon className="h-6 w-6 text-[hsl(280,100%,70%)]" />
                <h1 className="text-2xl font-alata font-bold text-foreground">
                  Create Custom Feed
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoadingFilters ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(280,100%,70%)]" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Shared Filter Form */}
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

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setLocation('/home')}
                className="border-border text-foreground hover:bg-muted font-alata"
              >
                Cancel
              </Button>
              <Button
                onClick={saveFeed}
                disabled={isSaving}
                className="bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] hover:from-[hsl(280,100%,75%)] hover:to-[hsl(200,100%,75%)] text-black font-alata"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Feed
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
