import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FiUploadCloud, FiX } from 'react-icons/fi';
import api, { errMsg } from '../services/api';

// ছবি Cloudinary-তে আপলোড করে। images = [{ url, publicId }]
export default function ImageUploader({ images, onChange, multiple = true }) {
  const inputRef = useRef();
  const newlyUploaded = useRef(new Set()); // এই সেশনে আপলোড হওয়া ছবি (বাদ দিলে Cloudinary থেকেও মুছে ফেলা যায়)
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const form = new FormData();
    files.forEach((f) => form.append('images', f));
    setUploading(true);
    try {
      const { data } = await api.post('/upload', form);
      data.forEach((d) => newlyUploaded.current.add(d.publicId));
      onChange(multiple ? [...images, ...data] : [data[0]]);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const remove = async (img) => {
    onChange(images.filter((i) => i.url !== img.url));
    if (img.publicId && newlyUploaded.current.has(img.publicId)) {
      api.delete('/upload', { data: { publicId: img.publicId } }).catch(() => {});
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((img) => (
          <div key={img.url} className="relative h-24 w-20 overflow-hidden rounded-md border">
            <img src={img.url} alt="" className="h-full w-full object-cover" />
            <button type="button" onClick={() => remove(img)} className="absolute right-0.5 top-0.5 rounded-full bg-black/70 p-1 text-white" aria-label="Remove">
              <FiX size={12} />
            </button>
          </div>
        ))}
        {(multiple || images.length === 0) && (
          <button
            type="button"
            onClick={() => inputRef.current.click()}
            disabled={uploading}
            className="flex h-24 w-20 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-gray-300 text-xs text-gray-500 hover:border-ink disabled:opacity-50"
          >
            <FiUploadCloud size={20} />
            {uploading ? 'Uploading' : 'Upload'}
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple={multiple} hidden onChange={handleFiles} />
    </div>
  );
}
