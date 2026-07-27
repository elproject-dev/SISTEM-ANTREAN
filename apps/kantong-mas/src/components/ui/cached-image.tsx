import React, { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface CachedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | null | undefined;
  alt?: string;
  fallback?: React.ReactNode;
}

export function CachedImage({ src, alt = "Image", className, fallback, ...props }: CachedImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      if (!src) {
        if (isMounted) {
          setImageSrc(null);
          setLoading(false);
        }
        return;
      }

      // If it's a local object URL or base64, don't cache it, just use it directly
      if (src.startsWith('blob:') || src.startsWith('data:')) {
        if (isMounted) {
          setImageSrc(src);
          setLoading(false);
        }
        return;
      }

      try {
        if (isMounted) setLoading(true);

        const cacheName = 'kasir-image-cache-v1';
        
        // Cek apakah browser mendukung Cache API
        if ('caches' in window) {
          const cache = await caches.open(cacheName);
          const cachedResponse = await cache.match(src);

          if (cachedResponse) {
            // Gambar ada di cache lokal, buat URL blob
            const blob = await cachedResponse.blob();
            const objectUrl = URL.createObjectURL(blob);
            if (isMounted) {
              setImageSrc(objectUrl);
              setLoading(false);
            }
            return;
          }

          // Gambar belum ada di cache, fetch dari server (Supabase)
          const fetchResponse = await fetch(src);
          if (fetchResponse.ok) {
            // Clone response karena response stream hanya bisa dibaca 1x
            await cache.put(src, fetchResponse.clone());
            
            const blob = await fetchResponse.blob();
            const objectUrl = URL.createObjectURL(blob);
            
            if (isMounted) {
              setImageSrc(objectUrl);
              setLoading(false);
            }
          } else {
            throw new Error('Network response was not ok');
          }
        } else {
          // Fallback jika browser lama (meski jarang)
          if (isMounted) {
            setImageSrc(src);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Error loading cached image:", err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [src]);

  if (!src || error) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className={`flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 ${className}`}>
        <ImageIcon className="w-1/3 h-1/3 min-w-4 min-h-4" opacity={0.5} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 ${className}`} />
    );
  }

  return (
    <img 
      src={imageSrc || ""} 
      alt={alt} 
      className={className} 
      {...props} 
    />
  );
}
