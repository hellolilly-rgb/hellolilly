'use client';

import { useRef, useState } from 'react';
import { Upload, Video } from 'lucide-react';
import { submitVerificationVideoAction } from '@/actions/verification';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/badge';

export function VideoUploadForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      await submitVerificationVideoAction(formData);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="border-success/30">
        <CardContent className="py-8 text-center">
          <p className="font-medium text-success">Video submitted successfully!</p>
          <p className="mt-2 text-sm text-text-muted">We&apos;ll review it within 24–48 hours.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-display text-xl font-semibold">Upload Selfie Video</h2>
        <p className="text-sm text-text-muted">
          Record a 30–60 second selfie video clearly showing your face. Max 50MB, MP4 or WebM.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            onClick={() => inputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-subtle p-12 hover:border-accent-gold transition-colors"
          >
            <Video className="h-10 w-10 text-accent-gold mb-3" />
            <p className="text-sm text-text-secondary">Click to select video</p>
            <input
              ref={inputRef}
              type="file"
              name="video"
              accept="video/mp4,video/webm,video/quicktime"
              required
              className="hidden"
            />
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            <Upload className="h-4 w-4" />
            {loading ? 'Uploading...' : 'Submit for Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
