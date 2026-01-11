import { useState } from 'react';
import { Building2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileSelector, ProfileSelections } from '@/components/ProfileSelector';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface ProfileSidebarProps {
  profileSelections: ProfileSelections;
  onSelectionsChange: (selections: ProfileSelections) => void;
  disabled?: boolean;
}

export default function ProfileSidebar({
  profileSelections,
  onSelectionsChange,
  disabled = false,
}: ProfileSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const selectionCount =
    profileSelections.companies.length +
    profileSelections.sectors.length +
    profileSelections.subsectors.length;

  // Desktop sidebar content
  const sidebarContent = (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Companies & Sectors</h3>
          </div>
          {selectionCount > 0 && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
              {selectionCount}
            </span>
          )}
        </div>
        {selectionCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-7 text-xs w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() =>
              onSelectionsChange({ companies: [], sectors: [], subsectors: [] })
            }
          >
            <X className="h-3 w-3 mr-1" />
            Clear all selections
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <ProfileSelector
          selections={profileSelections}
          onSelectionsChange={onSelectionsChange}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-border bg-background transition-all duration-300 ${
          isCollapsed ? 'w-12' : 'w-80'
        }`}
      >
        {isCollapsed ? (
          <div className="flex flex-col items-center py-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(false)}
              className="mb-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsCollapsed(false)}
            >
              <Building2 className="h-5 w-5" />
              {selectionCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] bg-primary text-primary-foreground w-4 h-4 rounded-full flex items-center justify-center">
                  {selectionCount}
                </span>
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="absolute top-4 right-2 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsCollapsed(true)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            {sidebarContent}
          </>
        )}
      </aside>

      {/* Mobile Sheet */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden fixed left-4 bottom-20 z-40 shadow-lg"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Companies
            {selectionCount > 0 && (
              <span className="ml-2 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                {selectionCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:w-96 p-0">
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Companies & Sectors
            </SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100vh-80px)] overflow-y-auto p-4">
            <ProfileSelector
              selections={profileSelections}
              onSelectionsChange={onSelectionsChange}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
