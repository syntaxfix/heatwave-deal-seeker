
import { Button } from '@/components/ui/button';
import { Grid3X3, List, LayoutGrid } from 'lucide-react';

export type ViewType = 'grid' | 'full' | 'compact';

interface ViewSwitcherProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const ViewSwitcher = ({ currentView, onViewChange }: ViewSwitcherProps) => {
  return (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
      <Button
        variant={currentView === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('grid')}
        className={`h-8 px-3 ${currentView === 'grid' ? 'bg-primary text-white' : 'hover:bg-gray-200'}`}
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant={currentView === 'full' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('full')}
        className={`h-8 px-3 ${currentView === 'full' ? 'bg-primary text-white' : 'hover:bg-gray-200'}`}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={currentView === 'compact' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('compact')}
        className={`h-8 px-3 ${currentView === 'compact' ? 'bg-primary text-white' : 'hover:bg-gray-200'}`}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ViewSwitcher;
