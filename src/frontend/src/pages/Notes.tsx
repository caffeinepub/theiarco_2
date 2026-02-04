import { useState } from 'react';
import { Button } from '@/components/ui/button';
import AddGlobalNoteModal from '@/components/notes/AddGlobalNoteModal';

const categories = [
  'All Notes',
  'Publishers',
  'Territory',
  'Shepherding',
  'Elder',
  'General',
  'Uncategorized'
] as const;

export default function Notes() {
  const [activeCategory, setActiveCategory] = useState<string>('All Notes');
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);

  return (
    <div className="flex h-full flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Notes</h1>
      </div>

      {/* Add Note Button */}
      <div>
        <Button
          style={{ backgroundColor: '#43587A' }}
          className="text-white hover:opacity-90 transition-opacity"
          onClick={() => setIsAddNoteModalOpen(true)}
        >
          Add Note
        </Button>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? 'default' : 'outline'}
            style={
              activeCategory === category
                ? { backgroundColor: '#43587A', color: 'white' }
                : undefined
            }
            className={
              activeCategory === category
                ? 'hover:opacity-90 transition-opacity'
                : 'hover:bg-accent'
            }
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Placeholder Content */}
      <div className="flex-1 flex items-center justify-center">
        <p className="text-lg text-muted-foreground">
          Notes will be displayed here.
        </p>
      </div>

      {/* Add Note Modal */}
      <AddGlobalNoteModal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
      />
    </div>
  );
}
