import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Loader2 } from 'lucide-react';

interface BibleReferenceDialogProps {
  reference: string | null;
  bibleText: string | null;
  isLoading: boolean;
  onClose: () => void;
}

export function BibleReferenceDialog({
  reference,
  bibleText,
  isLoading,
  onClose,
}: BibleReferenceDialogProps) {
  return (
    <Dialog open={!!reference} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="w-5 h-5 text-primary" />
            {reference}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-base leading-relaxed text-foreground">
                {bibleText}
              </p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
