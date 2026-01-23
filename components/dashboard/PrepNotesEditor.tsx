'use client';

import { useState } from 'react';
import { Textarea, Button } from '@/components/ui';

interface PrepNotesEditorProps {
  meetingId: string;
  initialNotes?: string;
  onSave?: (notes: string) => void;
}

export function PrepNotesEditor({ meetingId, initialNotes = '', onSave }: PrepNotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (value: string) => {
    setNotes(value);
    setHasChanges(value !== initialNotes);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement actual save logic
      await new Promise(resolve => setTimeout(resolve, 500));
      if (onSave) {
        onSave(notes);
      }
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save notes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Add your preparation notes here... Research points, talking points, questions to ask, etc."
        rows={8}
        className="resize-none"
      />
      {hasChanges && (
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Notes'}
          </Button>
        </div>
      )}
    </div>
  );
}
