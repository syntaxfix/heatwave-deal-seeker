
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  bucket: string;
}

const ImageUpload = ({ onUpload, bucket }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }

    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      if (data) {
        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);
        
        if (publicUrlData) {
          onUpload(publicUrlData.publicUrl);
          toast.success('Image uploaded successfully!');
          setFile(null);
        } else {
            toast.error('Failed to get public URL.');
        }
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Input type="file" onChange={handleFileChange} className="flex-grow" disabled={uploading} />
      <Button onClick={handleUpload} disabled={uploading || !file}>
        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Upload
      </Button>
    </div>
  );
};

export default ImageUpload;
