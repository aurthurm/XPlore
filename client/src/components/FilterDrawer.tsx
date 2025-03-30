import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import FilterSidebar from "@/components/FilterSidebar";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const FilterDrawer = ({ isOpen, onClose }: FilterDrawerProps) => {
  const [filterChanged, setFilterChanged] = useState(false);

  const handleApply = () => {
    // Close the drawer
    onClose();
    // Reset the changed state
    setFilterChanged(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Filter Options</SheetTitle>
        </SheetHeader>
        
        <div className="p-4 overflow-y-auto" style={{ height: "calc(100vh - 137px)" }}>
          <FilterSidebar
            onFilterChange={() => setFilterChanged(true)}
            isInDrawer={true}
          />
        </div>
        
        <SheetFooter className="p-4 border-t">
          <div className="flex justify-between w-full">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApply} 
              disabled={!filterChanged}
            >
              Apply Filters
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default FilterDrawer;