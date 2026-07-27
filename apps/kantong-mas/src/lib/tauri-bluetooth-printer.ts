/**
 * tauri-bluetooth-printer.ts
 * =====================================================
 * Module Printer khusus untuk Tauri Desktop
 * Mendukung USB Printer via Windows Print Spooler API
 * =====================================================
 *
 * Cara kerja:
 * 1. Daftar printer Windows via Rust invoke('list_usb_printers')
 * 2. User pilih printer → nama disimpan di localStorage (key: 'tauriPrinterName')
 * 3. Saat print: format struk → konversi bytes → invoke('print_usb_raw')
 * 4. Rust membuka printer, kirim raw ESC/POS data, lalu tutup
 *
 * Kode Android (bluetooth-printer.ts) TIDAK disentuh sama sekali.
 */

import { isTauri } from './tauri-file';
import { formatReceipt, imageToEscPosBitmap } from './bluetooth-printer';

// ───────────────────────────────────────────────────
// CONSTANTS
// ───────────────────────────────────────────────────
const TAURI_PRINTER_MAC_KEY = 'tauriPrinterMac'; // Legacy, masih dibaca untuk backward compat
const TAURI_PRINTER_NAME_KEY = 'tauriPrinterName';

// ───────────────────────────────────────────────────
// TYPES
// ───────────────────────────────────────────────────
export interface TauriBluetoothDevice {
  name: string;
  address: string;
}

export interface TauriUsbPrinter {
  name: string;
  is_default: boolean;
}

export interface TauriPrinterResult {
  success: boolean;
  message: string;
}

// ───────────────────────────────────────────────────
// ENVIRONMENT CHECK
// ───────────────────────────────────────────────────

/** Cek apakah running di Tauri Desktop */
export function isTauriDesktop(): boolean {
  return isTauri();
}

// ───────────────────────────────────────────────────
// USB PRINTER — DEVICE MANAGEMENT
// ───────────────────────────────────────────────────

/**
 * Daftar semua printer USB/Windows yang terinstall.
 * Memanggil Rust command `list_usb_printers`.
 */
export async function listTauriUsbPrinters(): Promise<{
  success: boolean;
  printers: TauriUsbPrinter[];
  message: string;
}> {
  if (!isTauri()) {
    return {
      success: false,
      printers: [],
      message: 'Fitur ini hanya tersedia di aplikasi Desktop (Tauri).',
    };
  }

  try {
    const { invoke } = await import('@tauri-apps/api/core');
    const printers = await invoke<TauriUsbPrinter[]>('list_usb_printers');

    if (!printers || printers.length === 0) {
      return {
        success: true,
        printers: [],
        message: 'Tidak ada printer ditemukan. Pastikan printer sudah diinstall dan terhubung via USB.',
      };
    }

    return {
      success: true,
      printers,
      message: `Ditemukan ${printers.length} printer.`,
    };
  } catch (error: any) {
    console.error('[Tauri USB] listTauriUsbPrinters error:', error);
    return {
      success: false,
      printers: [],
      message: `Gagal mendaftar printer: ${error?.message || String(error)}.`,
    };
  }
}

/**
 * Simpan nama printer Tauri yang dipilih ke localStorage.
 */
export function setTauriPrinterDevice(nameOrAddress: string, name: string): void {
  localStorage.setItem(TAURI_PRINTER_NAME_KEY, name);
  localStorage.setItem(TAURI_PRINTER_MAC_KEY, nameOrAddress); // backward compat
  console.log(`[Tauri USB] Printer dipilih: ${name}`);
}

/**
 * Hapus pilihan printer Tauri dari localStorage.
 */
export function clearTauriPrinterDevice(): void {
  localStorage.removeItem(TAURI_PRINTER_MAC_KEY);
  localStorage.removeItem(TAURI_PRINTER_NAME_KEY);
  console.log('[Tauri USB] Printer di-reset.');
}

/**
 * Ambil MAC address / identifier printer (backward compat).
 */
export function getTauriPrinterMac(): string {
  return localStorage.getItem(TAURI_PRINTER_MAC_KEY) || '';
}

/**
 * Ambil nama printer Tauri yang tersimpan.
 */
export function getTauriPrinterName(): string {
  return localStorage.getItem(TAURI_PRINTER_NAME_KEY) || '';
}

/**
 * Cek apakah printer Tauri sudah dipilih (nama tersedia).
 */
export function isTauriPrinterReady(): boolean {
  return !!getTauriPrinterName();
}

// ───────────────────────────────────────────────────
// BACKWARD COMPAT — Bluetooth scan (stub)
// ───────────────────────────────────────────────────

/**
 * @deprecated Gunakan listTauriUsbPrinters() untuk USB.
 * Tetap diexport agar kode lama tidak error saat import.
 */
export async function listTauriBluetoothDevices(): Promise<{
  success: boolean;
  devices: TauriBluetoothDevice[];
  message: string;
}> {
  // Redirect ke USB printer list, mapping ke format lama
  const usbResult = await listTauriUsbPrinters();
  return {
    success: usbResult.success,
    devices: usbResult.printers.map(p => ({
      name: p.name,
      address: p.name, // Gunakan nama printer sebagai "address"
    })),
    message: usbResult.message,
  };
}

// ───────────────────────────────────────────────────
// CORE PRINT FUNCTIONS
// ───────────────────────────────────────────────────

/**
 * Kirim raw bytes ke printer USB via Rust `print_usb_raw`.
 * Rust membuka printer via Windows Spooler, kirim RAW data, lalu tutup.
 */
async function tauriPrintRaw(data: string): Promise<TauriPrinterResult> {
  const printerName = getTauriPrinterName();

  if (!printerName) {
    return {
      success: false,
      message: 'Printer belum dipilih. Silakan pilih printer terlebih dahulu di Pengaturan.',
    };
  }

  if (!isTauri()) {
    return {
      success: false,
      message: 'Fungsi ini hanya tersedia di aplikasi Desktop (Tauri).',
    };
  }

  // Konversi string ke array bytes (Latin-1)
  const bytes = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    bytes[i] = data.charCodeAt(i) & 0xFF;
  }

  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('print_usb_raw', {
      printerName: printerName,
      data: Array.from(bytes),
    });

    console.log(`[Tauri USB] Print berhasil ke '${printerName}'`);
    return { success: true, message: 'Struk berhasil dicetak.' };
  } catch (error: any) {
    console.error('[Tauri USB] tauriPrintRaw error:', error);
    const msg = error?.message || String(error);

    // Pesan error yang lebih ramah
    if (msg.includes('Gagal membuka printer')) {
      return { success: false, message: `Printer '${printerName}' tidak ditemukan atau offline. Pastikan printer terhubung dan menyala.` };
    }
    if (msg.includes('WritePrinter gagal')) {
      return { success: false, message: 'Gagal mengirim data ke printer. Coba cabut dan pasang kembali kabel USB.' };
    }
    return { success: false, message: `Gagal mencetak: ${msg}` };
  }
}

/**
 * Cetak struk transaksi ke printer USB Tauri Desktop.
 * Reuse `formatReceipt()` dari bluetooth-printer.ts agar format struk konsisten.
 *
 * @param transaction - Data transaksi (format sama seperti printReceipt Android)
 * @param withLogo - Apakah menyertakan logo bitmap (default: true)
 */
export async function printTauriReceipt(
  transaction: any,
  withLogo: boolean = true
): Promise<TauriPrinterResult> {
  if (!isTauri()) {
    return {
      success: false,
      message: 'Fungsi ini hanya tersedia di aplikasi Desktop (Tauri).',
    };
  }

  if (!isTauriPrinterReady()) {
    return {
      success: false,
      message: 'Printer belum dipilih. Silakan pilih printer di menu Pengaturan → Printer Desktop.',
    };
  }

  if (!transaction || !transaction.items || !Array.isArray(transaction.items)) {
    return {
      success: false,
      message: 'Data transaksi tidak valid atau tidak ada item.',
    };
  }

  try {
    console.log('[Tauri USB] Memformat struk...');

    // Gunakan formatReceipt yang sama dengan Android
    const receiptData = formatReceipt(transaction);
    let finalData = '';

    // Coba tambah logo bitmap
    if (withLogo) {
      try {
        const logoData = await imageToEscPosBitmap(`${import.meta.env.BASE_URL}kantongmas.png`, 80);
        finalData = logoData;
        console.log('[Tauri USB] Logo berhasil disiapkan.');
      } catch (logoError) {
        console.warn('[Tauri USB] Logo tidak tersedia, lanjut tanpa logo:', logoError);
      }
    }

    finalData += receiptData;

    console.log('[Tauri USB] Mengirim data ke printer...');
    return await tauriPrintRaw(finalData);
  } catch (error: any) {
    console.error('[Tauri USB] printTauriReceipt error:', error);
    return {
      success: false,
      message: `Terjadi kesalahan saat mencetak: ${error?.message || String(error)}`,
    };
  }
}

/**
 * Cetak struk uji coba (test print) ke printer USB Tauri Desktop.
 * Berguna untuk mengetes koneksi dari menu Pengaturan.
 */
export async function testTauriPrint(): Promise<TauriPrinterResult> {
  const printerName = getTauriPrinterName() || 'Unknown Printer';

  const testTransaction = {
    storeName: localStorage.getItem('bluetoothStoreName') || 'KANTONG-MAS',
    id: 9999,
    cashierName: 'Admin',
    customerName: 'Test Print',
    items: [
      {
        productName: 'Test Produk USB',
        quantity: 1,
        price: 10000,
        unitName: 'pcs',
      },
    ],
    subtotal: 10000,
    tax: 0,
    discount: 0,
    total: 10000,
    amountPaid: 10000,
    change: 0,
    paymentMethod: 'cash',
    payment_status: 'paid',
    footerMessage: `Test Print OK — ${printerName}`,
    footerMessage2: 'Printer USB Desktop Terhubung',
    footerMessage3: '',
    createdAt: new Date().toISOString(),
  };

  return printTauriReceipt(testTransaction, false);
}
