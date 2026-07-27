import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { skipVersion, checkForUpdate } from '@/lib/update-checker';
import type { UpdateInfo } from '@/lib/version';
import { useAuth } from '@/contexts/AuthContext';
import { Capacitor } from '@capacitor/core';
import { downloadAndInstallApk, type DownloadProgress } from '@/lib/apk-installer';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export function UpdateDialog() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Cek update hanya jika auth sudah selesai loading dan user sudah login
    if (isLoading || !user) return;

    // Hanya jalankan di perangkat native (Capacitor) atau Tauri (Desktop)
    const isNative = Capacitor.isNativePlatform();
    const isTauri = '__TAURI_INTERNALS__' in window;

    if (!isNative && !isTauri) {
      return; // Sembunyikan di web
    }

    checkForUpdate().then((info) => {
      if (info?.hasUpdate) {
        setUpdateInfo(info);
        setIsOpen(true);
      }
    });
  }, [user, isLoading]);

  useEffect(() => {
    if (isOpen) {
      // Trigger entrance animation
      const timer = setTimeout(() => setIsAnimating(true), 100);
      const changelogTimer = setTimeout(() => setShowChangelog(true), 500);
      return () => {
        clearTimeout(timer);
        clearTimeout(changelogTimer);
      };
    }
    setIsAnimating(false);
    setShowChangelog(false);
    setIsDownloading(false);
    setDownloadProgress(null);
    setDownloadError(null);
    return undefined;
  }, [isOpen]);

  if (!updateInfo) return null;

  const handleUpdate = async () => {
    const url = updateInfo.downloadUrl;

    // Jika di Android native DAN link APK, download + auto-install
    if (Capacitor.isNativePlatform() && (url.endsWith('.apk') || url.includes('/storage/'))) {
      setIsDownloading(true);
      setDownloadError(null);
      setDownloadProgress({ percent: 0, loaded: 0, total: 0, status: 'Memulai download...' });

      const result = await downloadAndInstallApk(url, (progress) => {
        setDownloadProgress(progress);
      });

      if (!result.success) {
        setDownloadError(result.message);
        setIsDownloading(false);
      }
      // Jika sukses, biarkan dialog terbuka (user akan switch ke installer Android)
      return;
    }

    // Jika di Desktop (Tauri) gunakan silent update
    if ('__TAURI_INTERNALS__' in window) {
      setIsDownloading(true);
      setDownloadError(null);
      setDownloadProgress({ percent: 0, loaded: 0, total: 100, status: 'Memeriksa pembaruan...' });

      try {
        const update = await check();
        if (update) {
          setDownloadProgress({ percent: 10, loaded: 10, total: 100, status: 'Mempersiapkan unduhan...' });

          let downloaded = 0;
          let contentLength = 0;

          await update.downloadAndInstall((event) => {
            switch (event.event) {
              case 'Started':
                contentLength = event.data.contentLength || 0;
                setDownloadProgress({ percent: 20, loaded: 20, total: 100, status: 'Mulai mengunduh...' });
                break;
              case 'Progress':
                downloaded += event.data.chunkLength;
                const percent = contentLength ? Math.round((downloaded / contentLength) * 100) : 50;
                setDownloadProgress({ percent, loaded: downloaded, total: contentLength, status: `Mengunduh... ${percent}%` });
                break;
              case 'Finished':
                setDownloadProgress({ percent: 100, loaded: 100, total: 100, status: 'Selesai. Memulai ulang...' });
                break;
            }
          });

          await relaunch();
        } else {
          // Jika update tidak terdeteksi via sistem Tauri (misal cache), fallback ke download manual
          setIsDownloading(false);
          window.open(url, '_blank');
          if (!updateInfo.forceUpdate) {
            setIsOpen(false);
          }
        }
      } catch (err) {
        console.error('Tauri updater failed, falling back:', err);
        setIsDownloading(false);

        // Fallback ke manual download
        const a = document.createElement('a');
        a.href = url;
        a.download = url.split('/').pop() || 'kasir-update.exe';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        if (!updateInfo.forceUpdate) {
          setIsOpen(false);
        }
      }
      return;
    }

    // Untuk web atau link eksternal biasa
    if (url.endsWith('.apk') || url.includes('/storage/')) {
      const a = document.createElement('a');
      a.href = url;
      a.download = url.split('/').pop() || 'kasir-update.apk';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      window.open(url, '_blank');
    }

    if (!updateInfo.forceUpdate) {
      setIsOpen(false);
    }
  };

  const handleSkip = () => {
    if (!updateInfo.forceUpdate && !isDownloading) {
      skipVersion(updateInfo.latestVersion);
      setIsOpen(false);
    }
  };

  const handleLater = () => {
    if (!updateInfo.forceUpdate && !isDownloading) {
      setIsOpen(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(isOpenVal) => {
        if (!isOpenVal && !updateInfo.forceUpdate && !isDownloading) {
          setIsOpen(false);
        }
      }}
    >
      <DialogContent
        className="update-dialog-content max-w-[380px] sm:max-w-[420px] p-0 overflow-hidden border-0 rounded-2xl shadow-2xl"
        onPointerDownOutside={(e) => {
          if (updateInfo.forceUpdate || isDownloading) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (updateInfo.forceUpdate || isDownloading) e.preventDefault();
        }}
        aria-describedby="update-dialog-description"
      >
        <DialogTitle className="sr-only">{updateInfo.title}</DialogTitle>

        {/* Gradient Header with Animation */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/70 dark:from-primary/90 dark:via-primary/80 dark:to-primary/60 px-6 pt-10 pb-12">
          {/* Animated Background Particles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="update-particle update-particle-1 bg-white/20 blur-md" />
            <div className="update-particle update-particle-2 bg-white/20 blur-md" />
            <div className="update-particle update-particle-3 bg-white/20 blur-md" />
          </div>

          {/* Rocket Icon */}
          <div className={`relative flex flex-col items-center text-center transition-all duration-700 ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
            <div className="relative mb-6 flex items-center justify-center">
              {/* Outer Spinning Ring */}
              <div className="absolute inset-0 w-24 h-24 -ml-2 -mt-2 rounded-full border-2 border-dashed border-white/40 animate-[spin_10s_linear_infinite]" />
              {/* Inner Image (No Background) */}
              <div className="relative w-20 h-20 flex items-center justify-center z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                {isDownloading ? (
                  <span className="text-5xl drop-shadow-lg">📥</span>
                ) : (
                  <img src="/update.png" alt="Update Icon" className="w-16 h-16 object-contain animate-[spin_8s_linear_infinite]" />
                )}
              </div>
              {/* Glow Effect */}
              {!isDownloading && (
                <div className="absolute inset-0 w-20 h-20 rounded-full bg-white/30 animate-ping" style={{ animationDuration: '2s' }} />
              )}
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
              {isDownloading ? 'Mengunduh Update...' : updateInfo.title}
            </h2>
            <p className="text-[15px] font-medium text-white/90 mt-2 max-w-[280px] leading-relaxed drop-shadow-sm">
              {isDownloading
                ? downloadProgress?.status || 'Memproses...'
                : updateInfo.message
              }
            </p>
          </div>

          {/* Wave Divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-8 fill-white dark:fill-slate-900">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.71,78.73,125.13,63.64,185.64,59.78,238.54,56.51,274.2,63.51,321.39,56.44Z" />
            </svg>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-6 pb-6 pt-2 bg-white dark:bg-slate-900">

          {/* Download Progress Mode */}
          {isDownloading && downloadProgress ? (
            <div className="py-4 space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{downloadProgress.status}</span>
                  <span className="font-semibold text-primary">{downloadProgress.percent}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300 ease-out relative"
                    style={{ width: `${downloadProgress.percent}%` }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent update-shimmer" />
                  </div>
                </div>
              </div>

              {/* Download size info */}
              {downloadProgress.total > 0 && (
                <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                  Jangan tutup aplikasi selama proses download
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Version Badges */}
              <div className={`relative flex items-center justify-center gap-4 mb-7 mt-2 transition-all duration-500 delay-200 ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}>
                {/* Connection Line */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-0.5 bg-gradient-to-r from-slate-200 via-primary/50 to-primary/20 dark:from-slate-700 dark:via-primary/50" />

                <div className="relative flex flex-col items-center px-5 py-3 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800 z-10">
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Saat ini</span>
                  <span className="text-sm font-black text-slate-600 dark:text-slate-300">v{updateInfo.currentVersion}</span>
                </div>

                {/* Arrow */}
                <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary animate-pulse shadow-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </div>

                <div className="relative flex flex-col items-center px-5 py-3 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,229,153,0.3)] ring-2 ring-primary/40 update-new-version-badge z-10">
                  <span className="text-[10px] uppercase tracking-widest text-primary/80 font-bold mb-0.5">Terbaru</span>
                  <span className="text-sm font-black text-primary drop-shadow-sm">v{updateInfo.latestVersion}</span>
                </div>
              </div>

              {/* Changelog */}
              {updateInfo.changelog && updateInfo.changelog.length > 0 && (
                <div className={`mb-5 transition-all duration-500 delay-400 ${showChangelog ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <span>✨</span> Yang Baru
                    </p>
                    <ul className="space-y-2">
                      {updateInfo.changelog.map((item, index) => (
                        <li
                          key={index}
                          className={`flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300 transition-all duration-300`}
                          style={{ transitionDelay: `${500 + index * 100}ms`, opacity: showChangelog ? 1 : 0, transform: showChangelog ? 'translateX(0)' : 'translateX(-8px)' }}
                        >
                          <span className="w-5 h-5 rounded-full bg-primary/15 dark:bg-primary/25 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Force Update Warning */}
              {updateInfo.forceUpdate && (
                <div className={`mb-5 flex items-start gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-sm transition-all duration-500 delay-300 ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}>
                  <span className="text-amber-500 mt-0.5 text-base">⚠️</span>
                  <p className="text-amber-700 dark:text-amber-300 leading-relaxed">
                    Update ini <strong>wajib</strong> dilakukan untuk melanjutkan menggunakan aplikasi.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Download Error */}
          {downloadError && (
            <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl text-sm">
              <span className="text-red-500 mt-0.5">❌</span>
              <div>
                <p className="text-red-700 dark:text-red-300 font-medium">Download gagal</p>
                <p className="text-red-600 dark:text-red-400 mt-0.5">{downloadError}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={`space-y-3 transition-all duration-500 delay-500 ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {!isDownloading && (
              <Button
                id="btn-update-now"
                onClick={handleUpdate}
                className="group relative w-full h-14 text-[15px] font-bold rounded-xl bg-gradient-to-r from-primary to-primary/90 text-white shadow-[0_8px_25px_-8px_var(--tw-shadow-color)] shadow-primary/50 hover:shadow-primary/60 transition-all duration-300 active:scale-[0.98] overflow-hidden border-0"
              >
                {/* Shine Animation */}
                <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />

                <span className="relative flex items-center z-10">
                  <svg className="w-5 h-5 mr-2 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {downloadError ? 'Coba Lagi' : 'Update Sekarang'}
                </span>
              </Button>
            )}

            {!updateInfo.forceUpdate && !isDownloading && (
              <Button
                id="btn-update-later"
                variant="ghost"
                onClick={handleLater}
                className="w-full h-10 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl text-center"
              >
                Nanti Saja
              </Button>
            )}
          </div>
          <p id="update-dialog-description" className="sr-only">
            Dialog untuk memperbarui aplikasi ke versi terbaru
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
