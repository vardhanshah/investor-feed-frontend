import { useState, useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2, Building2 } from 'lucide-react';
import { profilesApi, Profile } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import { useToast } from '@/hooks/use-toast';

export default function ProfilesListPage() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { toast } = useToast();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const LIMIT = 20;

  // Parse query parameters
  const params = new URLSearchParams(searchString);
  const sector = params.get('sector') || undefined;
  const subsector = params.get('subsector') || undefined;

  // Page title
  const pageTitle = sector
    ? `Companies in ${sector}`
    : subsector
    ? `Companies in ${subsector}`
    : 'All Companies';

  // Fetch profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const profilesData = await profilesApi.listProfiles(LIMIT, 0, sector, subsector);
        setProfiles(profilesData);
        setHasMore(profilesData.length === LIMIT);
        setOffset(profilesData.length);
      } catch (err) {
        const errorInfo = getErrorMessage(err);
        setError(errorInfo.message);
        toast({
          variant: 'destructive',
          title: errorInfo.title,
          description: errorInfo.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, [sector, subsector, toast]);

  const handleLoadMore = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const profilesData = await profilesApi.listProfiles(LIMIT, offset, sector, subsector);
      setProfiles(prev => [...prev, ...profilesData]);
      setHasMore(profilesData.length === LIMIT);
      setOffset(prev => prev + profilesData.length);
    } catch (err) {
      const errorInfo = getErrorMessage(err);
      if (errorInfo.title) {
        toast({
          variant: 'destructive',
          title: errorInfo.title,
          description: errorInfo.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && profiles.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(280,100%,70%)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              onClick={() => setLocation('/home')}
              className="text-foreground hover:bg-muted font-alata"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Feed
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-alata text-foreground mb-2">{pageTitle}</h1>
          {(sector || subsector) && (
            <p className="text-muted-foreground font-alata">
              {profiles.length} {profiles.length === 1 ? 'company' : 'companies'} found
            </p>
          )}
        </div>

        {error && profiles.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <p className="text-destructive font-alata text-lg">{error}</p>
            </CardContent>
          </Card>
        ) : profiles.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-alata text-foreground mb-2">No Companies Found</h3>
              <p className="text-muted-foreground font-alata">
                No companies match the selected criteria
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Profiles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {profiles.map((profile) => (
                <Card
                  key={profile.id}
                  className="bg-card border-border hover:border-[hsl(280,100%,70%)] transition-colors cursor-pointer"
                  onClick={() => setLocation(`/profiles/${profile.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {profile.meta_attributes?.logo_url ? (
                        <img
                          src={profile.meta_attributes.logo_url}
                          alt={profile.title}
                          className="w-12 h-12 rounded-lg object-cover bg-muted shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] flex items-center justify-center text-black font-alata font-bold text-xl shrink-0">
                          {profile.title[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-alata font-semibold text-foreground mb-1 truncate">
                          {profile.title}
                        </h3>
                        {profile.meta_attributes?.symbol && (
                          <p className="text-sm text-muted-foreground font-alata mb-2">
                            {profile.meta_attributes.symbol}
                          </p>
                        )}

                        {/* Display key financial metrics */}
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {profile.attributes?.mcap !== undefined && profile.attributes?.mcap !== null && (
                            <div className="text-xs">
                              <span className="text-muted-foreground">
                                {profile.attributes_metadata?.mcap?.label || 'Market Cap'}:{' '}
                              </span>
                              <span className="font-medium text-foreground">
                                ₹{profile.attributes.mcap.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                {profile.attributes_metadata?.mcap?.unit || 'Cr'}
                              </span>
                            </div>
                          )}
                          {profile.attributes?.pe_ratio !== undefined && profile.attributes?.pe_ratio !== null && (
                            <div className="text-xs">
                              <span className="text-muted-foreground">
                                {profile.attributes_metadata?.pe_ratio?.label || 'P/E'}:{' '}
                              </span>
                              <span className="font-medium text-foreground">
                                {profile.attributes.pe_ratio.toFixed(2)}
                              </span>
                            </div>
                          )}
                          {profile.attributes?.roe !== undefined && profile.attributes?.roe !== null && (
                            <div className="text-xs">
                              <span className="text-muted-foreground">
                                {profile.attributes_metadata?.roe?.label || 'ROE'}:{' '}
                              </span>
                              <span className="font-medium text-foreground">
                                {profile.attributes.roe.toFixed(2)}
                                {profile.attributes_metadata?.roe?.unit || '%'}
                              </span>
                            </div>
                          )}
                          {profile.attributes?.pb !== undefined && profile.attributes?.pb !== null && (
                            <div className="text-xs">
                              <span className="text-muted-foreground">
                                {profile.attributes_metadata?.pb?.label || 'P/B'}:{' '}
                              </span>
                              <span className="font-medium text-foreground">
                                {profile.attributes.pb.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Show sector/subsector if not filtering by them */}
                        {(profile.attributes?.sector && !sector) || (profile.attributes?.subsector && !subsector) ? (
                          <div className="mt-2 pt-2 border-t border-border/50">
                            {profile.attributes?.sector && !sector && (
                              <p className="text-xs text-muted-foreground font-alata truncate">
                                {profile.attributes.sector}
                              </p>
                            )}
                            {profile.attributes?.subsector && !subsector && (
                              <p className="text-xs text-muted-foreground font-alata truncate">
                                {profile.attributes.subsector}
                              </p>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] hover:from-[hsl(280,100%,75%)] hover:to-[hsl(200,100%,75%)] text-black font-alata"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}

            {/* End of list message */}
            {!hasMore && profiles.length > 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground font-alata">
                  You've seen all companies
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
