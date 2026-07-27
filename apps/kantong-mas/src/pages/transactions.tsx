import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useListTransactions, useListOutlets, useGetTransaction, useDeleteTransaction, useStoreSettings } from "@workspace/api-client-react";
import { formatRupiah, formatInvoiceNumber } from "@/lib/formatters";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, CreditCard, Banknote, QrCode, User, History, SlidersHorizontal, Printer, Trash2, Edit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ADMIN_EMAIL } from "@/lib/auth";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Capacitor } from "@capacitor/core";

import {
  connectToPrinter,
  disconnectPrinter,
  printReceipt,
  getBluetoothPrinterMac,
  isBluetoothAvailable
} from "@/lib/bluetooth-printer";
import { isTauriDesktop, printTauriReceipt, isTauriPrinterReady } from "@/lib/tauri-bluetooth-printer";
import {
  showPrinterNotConnectedNotification,
  showPrintSuccessNotification
} from "@/lib/android-notifications";

const ITEMS_PER_PAGE = 20;

const formatTransactionHistoryDate = (dateStr: string) => {
  if (!dateStr) return '-';

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';

  const month = new Intl.DateTimeFormat("id-ID", { month: "long" })
    .format(date)
    .toLowerCase();
  const day = date.getDate();
  const year = date.getFullYear();
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${day} ${month} ${year} — ${hour}:${minute}`;
};

function TransactionReceiptDialog({
  transaction: trx,
  onClose,
  onDeleted
}: {
  transaction: any | null,
  onClose: () => void,
  onDeleted: () => void
}) {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const { data: storeSettingsData } = useStoreSettings();

  const storeInfo = {
    name: storeSettingsData?.name || 'KANTONG-MAS',
    address: storeSettingsData?.address || '',
    phone: storeSettingsData?.phone || '',
    showFooter: storeSettingsData?.show_footer ?? true,
    footerMessage: storeSettingsData?.footer_message || '',
    footerMessage2: storeSettingsData?.footer_message2 || '',
    footerMessage3: storeSettingsData?.footer_message3 || '',
    bankName: storeSettingsData?.bank_name || 'BCA',
    bankAccount: storeSettingsData?.bank_account || '4451377137',
    bankAccountName: storeSettingsData?.bank_account_name || 'AULIA USAHA'
  };

  const deleteTransaction = useDeleteTransaction();
  const [isPrinting, setIsPrinting] = useState(false);

  const displayedStoreName = storeInfo.name;
  const displayedAddress = storeInfo.address;
  const displayedPhone = storeInfo.phone || '';

  const displayedFooter1 = trx?.outlets?.footer_message || storeInfo.footerMessage;
  const displayedFooter2 = trx?.outlets?.footer_message2 || storeInfo.footerMessage2;
  const displayedFooter3 = trx?.outlets?.footer_message3 || storeInfo.footerMessage3;

  const handlePrintReceipt = async () => {
    if (!trx) return;

    // ── Tauri Desktop: gunakan printTauriReceipt ──
    if (isTauriDesktop()) {
      if (!isTauriPrinterReady()) {
        void showPrinterNotConnectedNotification('Printer Desktop belum dipilih. Buka Pengaturan \u2192 Printer Desktop (Tauri) untuk memilih printer.');
        return;
      }
      setIsPrinting(true);
      try {
        const receiptCustomerName = trx.customers?.name || trx.customerName || trx.customer_name || "Umum";
        const items = trx.transaction_items?.map((item: any) => ({
          productId: item.product_id,
          productName: item.product_name,
          quantity: item.quantity,
          price: item.price
        })) || [];
        const total = (trx.subtotal || 0) + (trx.tax || 0) - (trx.discount || 0);
        const showFooter = localStorage.getItem('showFooter') !== 'false';

        const printData = {
          ...trx,
          cashierName: trx.cashier_name,
          items,
          tax: trx.tax || 0,
          ppnPercentage: 11,
          discount: trx.discount || 0,
          discountNote: trx.discount_note || '',
          customerName: receiptCustomerName,
          total: total,
          amountPaid: trx.amount_paid || 0,
          change: trx.change || 0,
          paymentMethod: trx.payment_method || 'cash',
          storeName: displayedStoreName,
          storeAddress: displayedAddress,
          storePhone: displayedPhone,
          footerMessage: showFooter ? (trx?.outlets?.footer_message || localStorage.getItem('footerMessage') || '') : '',
          footerMessage2: showFooter ? (trx?.outlets?.footer_message2 || localStorage.getItem('footerMessage2') || '') : '',
          footerMessage3: showFooter ? (trx?.outlets?.footer_message3 || localStorage.getItem('footerMessage3') || '') : '',
        };

        console.log('[Tauri] Printing receipt via Tauri...');
        const result = await printTauriReceipt(printData);
        if (!result.success) {
          void showPrinterNotConnectedNotification(result.message);
        } else {
          void showPrintSuccessNotification(total, formatInvoiceNumber(trx.id));
        }
      } catch (error) {
        console.error('[Tauri] Print error:', error);
        void showPrinterNotConnectedNotification(
          error instanceof Error ? error.message : 'Terjadi kesalahan saat mencetak struk.'
        );
      } finally {
        setIsPrinting(false);
      }
      return;
    }

    // ── Android / Mobile: alur Bluetooth lama ──
    if (!isBluetoothAvailable()) {
      void showPrinterNotConnectedNotification('Plugin Bluetooth tidak tersedia di perangkat ini.');
      return;
    }

    const printerMac = getBluetoothPrinterMac();
    if (!printerMac) {
      void showPrinterNotConnectedNotification('Alamat MAC printer belum diatur di pengaturan.');
      return;
    }

    setIsPrinting(true);
    try {

      const receiptCustomerName = trx.customers?.name || trx.customerName || trx.customer_name || "Umum";

      const items = trx.transaction_items?.map((item: any) => ({
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        price: item.price
      })) || [];

      const total = (trx.subtotal || 0) + (trx.tax || 0) - (trx.discount || 0);
      const showFooter = localStorage.getItem('showFooter') !== 'false';

      const printData = {
        ...trx,
        cashierName: trx.cashier_name,
        items,
        tax: trx.tax || 0,
        ppnPercentage: 11,
        discount: trx.discount || 0,
        discountNote: trx.discount_note || '',
        customerName: receiptCustomerName,
        total: total,
        amountPaid: trx.amount_paid || 0,
        change: trx.change || 0,
        paymentMethod: trx.payment_method || 'cash',
        storeName: displayedStoreName,
        storeAddress: displayedAddress,
        storePhone: displayedPhone,
        footerMessage: showFooter ? (trx?.outlets?.footer_message || localStorage.getItem('footerMessage') || '') : '',
        footerMessage2: showFooter ? (trx?.outlets?.footer_message2 || localStorage.getItem('footerMessage2') || '') : '',
        footerMessage3: showFooter ? (trx?.outlets?.footer_message3 || localStorage.getItem('footerMessage3') || '') : '',
      };

      const connectionResult = await connectToPrinter(printerMac);
      if (!connectionResult.success) {
        void showPrinterNotConnectedNotification(connectionResult.message);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      const printed = await printReceipt(printData);

      if (!printed) {
        void showPrinterNotConnectedNotification('Gagal mencetak struk. Pastikan printer menyala dan terhubung.');
      } else {
        void showPrintSuccessNotification(total, formatInvoiceNumber(trx.id));
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      await disconnectPrinter();
    } catch (error) {
      void showPrinterNotConnectedNotification(
        error instanceof Error ? error.message : 'Terjadi kesalahan saat mencetak struk.'
      );
      try {
        await disconnectPrinter();
      } catch (e) { }
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrintInvoice = () => {
    if (!trx) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const printWindow = iframe.contentWindow;
    if (!printWindow) {
      document.body.removeChild(iframe);
      toast({
        title: "Gagal mencetak",
        description: "Tidak dapat membuat frame cetak.",
        variant: "destructive"
      });
      return;
    }

    const storeName = displayedStoreName || "CV AULIA USAHA";
    const storeAddress = displayedAddress || "";
    const storePhone = displayedPhone || "";

    let grossSubtotal = 0;
    let totalItemDiscounts = 0;

    let itemsHtml = trx.transaction_items?.map((item: any, index: number) => {
      const productName = item.product_name || 'Unknown';
      const qty = item.unit_qty !== undefined && item.unit_qty !== null ? item.unit_qty : (item.quantity || 0);
      const unit = item.unit_name || 'pcs';
      const subtotal = item.subtotal || 0;
      const baseQty = item.quantity || 0;
      
      const totalDiscount = (item.discount_amount || 0) * baseQty;
      totalItemDiscounts += totalDiscount;
      
      let totalOriginalPrice = (item.original_price || item.price || 0) * baseQty;
      if (totalDiscount > 0 && totalOriginalPrice <= subtotal) {
        totalOriginalPrice = subtotal + totalDiscount;
      }
      grossSubtotal += totalOriginalPrice;

      const displayOriginalPrice = qty > 0 ? (totalOriginalPrice / qty) : 0;

      return `
        <tr>
          <td style="text-align: center; color: #64748b;">${index + 1}</td>
          <td style="font-weight: 600; color: #0f172a;">${productName}</td>
          <td style="text-align: center; font-weight: 600; color: #0f172a;">${qty} ${unit}</td>
          <td style="text-align: right; color: #475569;">${formatRupiah(displayOriginalPrice)}</td>
          <td style="text-align: right; font-weight: 700; color: #0f172a;">${formatRupiah(displayOriginalPrice * qty)}</td>
        </tr>`;
    }).join('') || '';

    const itemsCount = trx.transaction_items?.length || 0;
    if (itemsCount < 8) {
      for (let i = itemsCount; i < 8; i++) {
        itemsHtml += `
          <tr class="empty-row">
            <td style="text-align: center; color: #cbd5e1;">${i + 1}</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
          </tr>`;
      }
    }

    let returnDate = '-';
    if (trx.created_at) {
      const dateObj = new Date(trx.created_at);
      const dateStr = dateObj.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const timeStr = dateObj.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(':', '.');
      returnDate = `${dateStr} ,${timeStr}`;
    }

    if (grossSubtotal === 0 && trx.subtotal) {
      grossSubtotal = trx.subtotal;
    }
    const finalTotalDiscount = totalItemDiscounts + (trx.discount || 0);


    const getInvoiceContentHtml = () => {
      return `
        <div class="invoice-copy">
          <div>
            <table class="info-table">
              <tr>
                <td style="width: 60%; vertical-align: middle;">
                  <table style="border-collapse: collapse; border: none; margin: 0; padding: 0;">
                    <tr>
                      <td style="vertical-align: middle; padding-right: 12px; border: none;">
                        <img src="${import.meta.env.BASE_URL}kantongmas.png" alt="Logo" style="height: 40px; width: auto; display: block; position: relative; top: 2px;" onerror="this.style.display='none'" />
                      </td>
                      <td style="vertical-align: middle; border: none; padding: 0; text-align: left;">
                        <div class="company-name">${storeName}</div>
                        ${storeAddress ? `<div class="company-address">${storeAddress}</div>` : ''}
                        ${storePhone ? `<div class="company-contact">Telp: ${storePhone}</div>` : ''}
                      </td>
                    </tr>
                  </table>
                </td>
                <td style="width: 40%; text-align: right; vertical-align: top;">
                  <h1 class="invoice-title">FAKTUR PENJUALAN</h1>
                  <div style="font-size: 12px; font-weight: 700; margin-top: 4px; display: inline-flex; gap: 6px; justify-content: flex-end; align-items: center; width: 100%;">
                    <span class="invoice-status-badge ${trx.payment_status === 'paid' ? 'badge-completed' : 'badge-pending'}">${trx.payment_status === 'paid' ? 'LUNAS' : trx.payment_status === 'partial' ? 'CICILAN' : 'TEMPO'}</span>
                  </div>
                </td>
              </tr>
            </table>

            <hr class="header-divider">

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
              <tr>
                <td style="width: 70%; vertical-align: top;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <tr>
                      <td style="width: 1%; white-space: nowrap; padding: 2px 0; color: #475569; font-weight: 500;">Kepada Yth.</td>
                      <td style="width: 1%; white-space: nowrap; padding: 2px 8px 2px 4px; color: #475569;">:</td>
                      <td style="padding: 2px 0; font-weight: 600; color: #0f172a;">${trx.customers?.name || trx.customerName || trx.customer_name || 'Pelanggan Umum'}</td>
                    </tr>
                    <tr>
                      <td style="width: 1%; white-space: nowrap; padding: 2px 0; color: #475569; font-weight: 500;">No. Telepon</td>
                      <td style="width: 1%; white-space: nowrap; padding: 2px 8px 2px 4px; color: #475569;">:</td>
                      <td style="padding: 2px 0;">${trx.customers?.phone || trx.customerPhone || '-'}</td>
                    </tr>
                    <tr>
                      <td style="width: 1%; white-space: nowrap; padding: 2px 0; color: #475569; font-weight: 500;">Alamat</td>
                      <td style="width: 1%; white-space: nowrap; padding: 2px 8px 2px 4px; color: #475569;">:</td>
                      <td style="padding: 2px 0; font-size: 11.4px; line-height: 1.2;">
                        ${trx.customers?.address || '-'}
                        ${trx.customers?.district ? `, ${trx.customers?.district}` : ''}
                        ${trx.customers?.city ? `, ${trx.customers?.city}` : ''}
                      </td>
                    </tr>
                  </table>
                </td>
                <td style="width: 2%;"></td> <!-- Spacer -->
                <td style="width: 28%; vertical-align: top;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <tr>
                      <td style="width: 1%; white-space: nowrap; padding: 2px 0; color: #475569; font-weight: 500;">No. Invoice</td>
                      <td style="width: 1%; white-space: nowrap; padding: 2px 8px 2px 4px; color: #475569;">:</td>
                      <td style="padding: 2px 0; font-weight: 600; color: #0f172a; white-space: nowrap;">${formatInvoiceNumber(trx.id)}</td>
                    </tr>
                    <tr>
                      <td style="width: 1%; white-space: nowrap; padding: 2px 0; color: #475569; font-weight: 500;">Tanggal</td>
                      <td style="width: 1%; white-space: nowrap; padding: 2px 8px 2px 4px; color: #475569;">:</td>
                      <td style="padding: 2px 0; white-space: nowrap;">${returnDate}</td>
                    </tr>
                    <tr>
                      <td style="width: 1%; white-space: nowrap; padding: 2px 0; color: #475569; font-weight: 500;">Salesman</td>
                      <td style="width: 1%; white-space: nowrap; padding: 2px 8px 2px 4px; color: #475569;">:</td>
                      <td style="padding: 2px 0; white-space: nowrap;">${trx.cashier_name || 'N/A'}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 5%; text-align: center;">No</th>
                  <th style="width: 47%; text-align: left;">Nama Produk / Item</th>
                  <th style="width: 8%; text-align: center;">Qty</th>
                  <th style="width: 20%; text-align: right;">Harga Satuan</th>
                  <th style="width: 20%; text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <table style="width: 100%; border-collapse: collapse; margin-top: 4px;">
              <tr>
                <td style="width: 55%; vertical-align: top;">
                  <div style="font-size: 14.4px; line-height: 1.6; color: #0f172a;">
                    Metode Pembayaran : <strong>${getPaymentLabel(trx.payment_method)}</strong><br>
                    Status : <strong>${trx.payment_status === 'paid' ? 'Lunas' : trx.payment_status === 'partial' ? 'Cicilan' : 'Tempo Penuh'}</strong>
                  </div>
                </td>
                <td style="width: 45%; vertical-align: top; text-align: right;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 11.4px; line-height: 1.4; float: right;">
                    <tr>
                      <td style="color: #475569; font-weight: 500; text-align: left;">Subtotal</td>
                      <td style="text-align: right; color: #0f172a; font-weight: 600;">${formatRupiah(grossSubtotal)}</td>
                    </tr>
                    ${finalTotalDiscount > 0 ? `
                      <tr>
                        <td style="color: #475569; font-weight: 500; text-align: left;">Diskon</td>
                        <td style="text-align: right; color: #ea580c; font-weight: 600;">${formatRupiah(finalTotalDiscount)}</td>
                      </tr>` : ''}
                    ${trx.tax && trx.tax > 0 ? `
                    <tr>
                      <td style="color: #475569; font-weight: 500; text-align: left;">Pajak</td>
                      <td style="text-align: right; color: #0f172a; font-weight: 600;">${formatRupiah(trx.tax)}</td>
                    </tr>` : ''}
                    <tr>
                      <td style="color: #0f172a; font-weight: 800; border-top: 1.5px solid #0f172a; padding-top: 4px; text-align: left; font-size: 15.6px;">${trx.payment_status === 'partial' ? 'TOTAL' : 'GRAND TOTAL'}</td>
                      <td style="text-align: right; color: #0f172a; font-weight: 800; border-top: 1.5px solid #0f172a; padding-top: 4px; font-size: 15.6px;">
                        ${formatRupiah((trx.subtotal || 0) + (trx.tax || 0) - (trx.discount || 0))}
                      </td>
                    </tr>
                    ${trx.payment_status === 'partial' ? `
                    <tr>
                      <td style="color: #475569; font-weight: 500; text-align: left;">Cicilan Dibayar</td>
                      <td style="text-align: right; color: #0f172a; font-weight: 600;">${formatRupiah(trx.amount_paid || 0)}</td>
                    </tr>
                    <tr>
                      <td style="color: #ea580c; font-weight: 800; border-top: 1px solid #0f172a; padding-top: 4px; text-align: left; font-size: 15.6px;">GRAND TOTAL</td>
                      <td style="text-align: right; color: #ea580c; font-weight: 800; border-top: 1px solid #0f172a; padding-top: 4px; font-size: 15.6px;">${formatRupiah(trx.remaining_balance || 0)}</td>
                    </tr>` : ''}

                  </table>
                </td>
              </tr>
            </table>
          </div>

          <div>
            <table style="width: 100%; margin-top: 12px; border-collapse: collapse;">
              <tr>
                <td style="width: 50%; text-align: center; font-size: 12px; color: #334155; vertical-align: top;">
                  <div>Penerima,</div>
                  <div style="height: 32px;"></div>
                  <div style="color: #0f172a; display: inline-block; min-width: 130px; padding-top: 2px; font-family: monospace;">
                    ( _________________ )
                  </div>
                </td>
                <td style="width: 50%; text-align: center; font-size: 12px; color: #334155; vertical-align: top;">
                  <div>Hormat Kami,</div>
                  <div style="height: 32px;"></div>
                  <div style="color: #0f172a; display: inline-block; min-width: 130px; padding-top: 2px; font-family: monospace;">
                    ( _________________ )
                  </div>
                </td>
              </tr>
            </table>
            
            <div style="text-align: left; font-size: 9.6px; font-style: italic; color: #475569; margin-top: 10px; line-height: 1.2; width: 100%;">
              Pembayaran Transfer melalui Bank: <strong>${storeInfo?.bankName || 'BCA'} ${storeInfo?.bankAccount || '4451377137'}</strong> a/n <strong>${storeInfo?.bankAccountName || 'AULIA USAHA'}</strong>
            </div>

            <div class="footer-divider"></div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="text-align: center; font-size: 10.2px; color: #64748b;">
                  ${[displayedFooter1, displayedFooter2, displayedFooter3].filter(Boolean).join(' | ') || 'Terima Kasih Sudah Melakukan Order'}
                </td>
              </tr>
            </table>
          </div>
        </div>
      `;
    };

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Faktur Penjualan - ${formatInvoiceNumber(trx.id)}</title>
        <style>
          @font-face {
            font-family: 'GoogleSansFlex';
            src: url('${import.meta.env.BASE_URL}GoogleSansFlex_9pt-Regular.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
          }
          @page {
            size: auto; /* Biarkan driver printer continuous yang menentukan ukuran */
            margin: 0mm;
          }
          @media print {
            body { margin: 0; padding: 5mm 8mm; }
            .no-print { display: none !important; }
            .invoice-copy { border: none !important; } /* Hilangkan border putus-putus luar */
          }
          * {
            box-sizing: border-box;
            color: #000000 !important; /* WAJIB HITAM PEKAT agar jelas di printer Dot Matrix */
            font-family: 'GoogleSansFlex', Arial, Helvetica, sans-serif !important; /* Custom font */
            font-weight: bold !important; /* Semua teks ditebalkan */
          }
          body {
            font-size: 13.2px;
            font-weight: 600;
            line-height: 1.35;
            margin: 0;
            padding: 5mm 8mm;
            background-color: #ffffff;
          }
          .print-wrapper {
            display: flex;
            flex-direction: column;
          }
          .invoice-copy {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden;
            border: none; /* Tanpa border luar agar tidak terpotong tepi kertas */
            padding: 0;
            background-color: #ffffff;
          }
          .cut-divider {
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: #94a3b8;
            font-size: 9.6px;
            font-weight: 700;
            letter-spacing: 0.15em;
            margin: 1mm 0;
            border-top: 1px dashed #cbd5e1;
            position: relative;
            height: 1px;
          }
          .cut-divider span {
            background: #ffffff;
            padding: 0 10px;
            position: absolute;
            top: -6px;
            text-transform: uppercase;
          }
          .info-table {
            width: 100%;
            border-collapse: collapse;
          }
          .company-name {
            font-size: 15.6px;
            font-weight: 800;
            color: #0f172a;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .company-address, .company-contact {
            margin: 0;
            font-size: 10.2px;
            color: #475569;
          }
          .invoice-title {
            font-size: 18px;
            font-weight: 800;
            color: #0f172a;
            margin: 0;
            letter-spacing: 0.02em;
          }
          .invoice-copy-badge {
            display: inline-block;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.05em;
            padding: 1px 5px;
            border-radius: 3px;
            background-color: #f1f5f9;
            color: #475569;
            border: 1px solid #e2e8f0;
            text-transform: uppercase;
          }
          .invoice-status-badge {
            display: inline-block;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.05em;
            padding: 1px 5px;
            border-radius: 3px;
            text-transform: uppercase;
          }
          .badge-completed {
            background-color: #dcfce7;
            color: #166534;
            border: 1px solid #bbf7d0;
          }
          .badge-pending {
            background-color: #fef9c3;
            color: #854d0e;
            border: 1px solid #fef08a;
          }
          .header-divider {
            border: none;
            border-top: 2px double #0f172a;
            margin: 4px 0 6px 0;
          }
          .metadata-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
          }
          .metadata-table td {
            padding: 2px 0;
            vertical-align: top;
            font-size: 12px;
          }
          .metadata-table td:first-child, .metadata-table td:nth-child(4) {
            color: #475569;
            font-weight: 500;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
          }
          .items-table th {
            color: #000000 !important;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            padding: 4px 6px;
            border-bottom: 1.5px solid #000000;
            border-top: 1.5px solid #000000;
          }
          .items-table td {
            padding: 4px 6px;
            font-size: 13.2px;
            border-bottom: none;
            color: #000000 !important;
          }
          .items-table tr:last-child td {
            border-bottom: 1.5px solid #000000;
          }
          .items-table tr.empty-row td {
            height: 15px;
            padding: 2px 6px;
          }

          .text-center {
            text-align: center;
          }
          .text-right {
            text-align: right;
          }
          .reason-section {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 6px 10px;
            font-size: 11.4px;
            line-height: 1.35;
          }
          .footer-divider {
            border: none;
            border-top: 1px solid #cbd5e1;
            margin: 6px 0 4px 0;
          }
          .no-print {
            display: flex;
            justify-content: center;
            gap: 12px;
            margin-top: 20px;
            padding-top: 12px;
            border-top: 1px dashed #e2e8f0;
            page-break-inside: avoid;
          }
          .btn {
            padding: 8px 20px;
            font-size: 14.4px;
            font-weight: 600;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-family: inherit;
            text-decoration: none;
          }
          .btn-primary {
            background-color: #0f172a;
            color: white;
          }
          .btn-primary:hover {
            background-color: #1e293b;
          }
          .btn-secondary {
            background-color: #f1f5f9;
            color: #475569;
            border: 1px solid #cbd5e1;
          }
          .btn-secondary:hover {
            background-color: #e2e8f0;
          }
        </style>
      </head>
      <body>
        <div class="print-wrapper">
          ${getInvoiceContentHtml()}
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
          window.onafterprint = function() {
            setTimeout(function() {
              if (window.frameElement) window.frameElement.remove();
            }, 500);
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  const handleDelete = () => {
    if (!trx) return;
    if (!confirm(`Hapus transaksi ${formatInvoiceNumber(trx.id)}? Tindakan ini tidak bisa dibatalkan.`)) return;

    deleteTransaction.mutate({ id: trx.id }, {
      onSuccess: () => {
        toast({ title: "Transaksi dihapus", description: "Data transaksi berhasil dihapus." });
        onDeleted();
        onClose();
      },
      onError: (error: any) => {
        toast({
          title: "Gagal menghapus transaksi",
          description: error?.message || "Periksa izin delete pada Supabase.",
          variant: "destructive"
        });
      }
    });
  };

  const getPaymentLabel = (method?: string) => {
    switch (method) {
      case 'cash': return 'Tunai';
      case 'qris': return 'QRIS';
      case 'transfer':
      case 'e_wallet':
        return 'Transfer';
      case 'debit_card': return 'E-wallet';
      case 'credit_card': return 'Kredit';
      default: return method?.replace('_', ' ') || '-';
    }
  };

  return (
    <Dialog open={!!trx} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-slate-50">
        {!trx ? (
          <div className="py-12 flex flex-col justify-center items-center gap-3 text-slate-500">
            <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-xs font-medium">Memuat detail struk...</p>
          </div>
        ) : (
          <div className="flex flex-col h-full max-h-[85vh]">
            <div className="p-4 border-b border-slate-200 bg-white flex flex-col justify-center items-center shrink-0">
              <DialogTitle className="font-bold text-lg">Detail Transaksi</DialogTitle>
              <DialogDescription className="sr-only">Rincian struk transaksi lengkap</DialogDescription>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto bg-white m-4 rounded-xl shadow-sm border border-slate-200 printable-receipt [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="mb-4 sm:mb-6 pb-4 sm:pb-6">
                <div className="text-center mb-4">
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">{displayedStoreName}</h2>
                  <p className="text-xs text-slate-500 mt-1">{displayedAddress}</p>
                  {displayedPhone && <p className="text-xs text-slate-400 mt-0.5">{displayedPhone}</p>}
                </div>
                <div className="flex justify-between items-start">
                  <div className="text-left">
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">
                      {new Date(trx.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(trx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm text-slate-600 font-medium font-mono">{formatInvoiceNumber(trx.id)}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{trx.cashier_name}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4 sm:mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-slate-500">Status</span>
                  {trx.payment_status === 'partial' ? (
                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-medium">CICILAN</Badge>
                  ) : trx.payment_status === 'unpaid' ? (
                    <Badge variant="destructive" className="font-medium">TEMPO</Badge>
                  ) : (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium">LUNAS</Badge>
                  )}
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-500">Pelanggan</span>
                  <span className="font-medium text-right">{trx.customers?.name || "-"}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-500">Metode Pembayaran</span>
                  <span className="font-medium">{getPaymentLabel(trx.payment_method)}</span>
                </div>
              </div>

              <div className="py-3 sm:py-4 space-y-3 sm:space-y-4 font-mono text-xs sm:text-sm">
                {trx.transaction_items?.map((item: any) => {
                  const baseQty = item.quantity || 0;
                  const qty = item.unit_qty !== undefined && item.unit_qty !== null ? item.unit_qty : baseQty;
                  
                  const itemNetPrice = item.price || 0;
                  const conversionFactor = qty > 0 ? (baseQty / qty) : 1;
                  const displayNetPrice = itemNetPrice * conversionFactor;
                  const totalItemNetPrice = displayNetPrice * qty;

                  return (
                    <div key={item.id} className="flex justify-between items-start gap-2 break-inside-avoid">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 break-words">{item.product_name}</p>
                        <p className="text-slate-700 mt-0.5 text-xs">
                          {qty} {item.unit_name || 'pcs'} x {formatRupiah(displayNetPrice)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 whitespace-nowrap">{formatRupiah(totalItemNetPrice)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-dashed border-slate-300 dark:border-slate-600 pt-3 mt-3 space-y-1 font-mono text-sm">
                {(() => {
                  const netSubtotal = trx.subtotal || 0;
                  const globalDiscount = trx.discount || 0;

                  return (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                        <span className="text-slate-800 dark:text-slate-200">{formatRupiah(netSubtotal)}</span>
                      </div>
                      {globalDiscount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Diskon Transaksi</span>
                          <span className="text-slate-800 dark:text-slate-200">{formatRupiah(globalDiscount)}</span>
                        </div>
                      )}
                    </>
                  );
                })()}

                {trx.tax && trx.tax > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Pajak</span>
                    <span className="text-slate-800 dark:text-slate-200">{formatRupiah(trx.tax)}</span>
                  </div>
                ) : null}

                <div className="flex justify-between font-bold text-base pt-1 pb-3">
                  <span className="text-slate-700 dark:text-slate-200">Grand Total</span>
                  <span className="text-slate-900 dark:text-slate-100">{formatRupiah((trx.subtotal || 0) + (trx.tax || 0) - (trx.discount || 0))}</span>
                </div>
              </div>



              {trx.payment_status === 'partial' && (
                <div className="space-y-2 py-4 sm:py-6 font-mono text-xs sm:text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Cicilan Dibayar ({getPaymentLabel(trx.payment_method)})</span>
                    <span>{formatRupiah(trx.amount_paid || 0)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Sisa Tagihan</span>
                    <span className="text-red-600">{formatRupiah(trx.remaining_balance || 0)}</span>
                  </div>
                </div>
              )}

              {trx.payment_status === 'unpaid' && (
                <div className="space-y-2 py-4 sm:py-6 font-mono text-xs sm:text-sm">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Tagihan (Tempo Penuh)</span>
                    <span className="text-red-600">{formatRupiah(trx.remaining_balance || 0)}</span>
                  </div>
                  {trx.due_date && (
                    <div className="flex justify-between text-slate-600 mt-1">
                      <span>Jatuh Tempo</span>
                      <span>{new Date(trx.due_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>
              )}



              {storeInfo.showFooter && (
                <div className="mt-6 sm:mt-8 text-center text-slate-400 text-xs space-y-1">
                  {displayedFooter1 && <p>{displayedFooter1}</p>}
                  {displayedFooter2 && <p>{displayedFooter2}</p>}
                  {displayedFooter3 && <p>{displayedFooter3}</p>}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-white flex justify-between items-center gap-2 shrink-0 overflow-x-auto">
              <div className="flex-1 flex gap-2">
                {isAdmin ? (
                  <>
                    {!(Capacitor.getPlatform() === 'android') && (
                      <Button variant="outline" onClick={handlePrintInvoice}>
                        <Printer className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Cetak Faktur</span>
                        <span className="sm:hidden">Faktur</span>
                      </Button>
                    )}
                    <Button variant="outline" onClick={handlePrintReceipt} disabled={isPrinting}>
                      <Printer className="w-4 h-4 mr-2" />
                      {isPrinting ? (
                        <span className="hidden sm:inline">Mencetak...</span>
                      ) : (
                        <span className="hidden sm:inline">Cetak Struk</span>
                      )}
                      {isPrinting ? (
                        <span className="sm:hidden">Proses</span>
                      ) : (
                        <span className="sm:hidden">Struk</span>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={handlePrintReceipt} disabled={isPrinting}>
                    <Printer className="w-4 h-4 mr-2" />
                    {isPrinting ? (
                      <span className="hidden sm:inline">Mencetak...</span>
                    ) : (
                      <span className="hidden sm:inline">Cetak Struk</span>
                    )}
                    {isPrinting ? (
                      <span className="sm:hidden">Proses</span>
                    ) : (
                      <span className="sm:hidden">Struk</span>
                    )}
                  </Button>
                )}
              </div>
              {isAdmin && (
                <div className="flex items-center gap-1">
                  <Link href={`/pos?edit=${trx.id}`}>
                    <Button size="icon" variant="ghost" className="text-slate-500 hover:text-primary hover:bg-primary/10" title="Edit Transaksi">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button size="icon" variant="ghost" className="text-slate-500 hover:text-red-600 hover:bg-red-50" onClick={handleDelete} disabled={deleteTransaction.isPending} title="Hapus Transaksi">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function TransactionsPage() {
  const [paymentMethod, setPaymentMethod] = useState<string>("all");
  const [paymentStatus, setPaymentStatus] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [outletFilter, setOutletFilter] = useState<string>("all");
  const [cashierFilter, setCashierFilter] = useState<string>("all");
  const [cashiers, setCashiers] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);

  const { user } = useAuth();
  const isAdminSuper = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const { data: outlets } = useListOutlets();

  const { data: transactions, isLoading, refetch } = useListTransactions({
    paymentMethod: paymentMethod === "all" ? undefined : paymentMethod,
    paymentStatus: paymentStatus === "all" ? undefined : paymentStatus,
    outletFilter: outletFilter === "all" ? undefined : outletFilter,
    cashierFilter: cashierFilter === "all" ? undefined : cashierFilter,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    limit: ITEMS_PER_PAGE,
    offset: (page - 1) * ITEMS_PER_PAGE
  });

  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const viewId = searchParams.get('view');

  const { data: viewTransaction } = useGetTransaction(viewId ? parseInt(viewId) : undefined);

  useEffect(() => {
    if (viewTransaction && !selectedTransaction) {
      setSelectedTransaction(viewTransaction);
      // Remove query param without reloading to prevent re-opening on close
      window.history.replaceState({}, '', '/transactions');
    }
  }, [viewTransaction]);

  useEffect(() => {
    if (isAdminSuper) {
      const fetchCashiers = async () => {
        const { data, error } = await supabase
          .from("transactions")
          .select("cashier_name")
          .not("cashier_name", "is", null);

        if (!error && data) {
          const uniqueCashiers = [...new Set(data.map(t => t.cashier_name))].filter(Boolean) as string[];
          setCashiers(uniqueCashiers);
        }
      };
      fetchCashiers();
    }
  }, [isAdminSuper]);

  const handlePrevious = () => {
    if (page > 1) setPage(p => p - 1);
  };

  const handleNext = () => {
    if ((transactions?.length || 0) >= ITEMS_PER_PAGE) {
      setPage(p => p + 1);
    }
  };

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
    setPage(1);
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="w-4 h-4 text-emerald-600" />;
      case 'qris': return <QrCode className="w-4 h-4 text-blue-600" />;
      case 'transfer': return <CreditCard className="w-4 h-4 text-purple-600" />;
      default: return <CreditCard className="w-4 h-4 text-slate-600" />;
    }
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Tunai';
      case 'debit_card': return 'E-wallet';
      case 'transfer': return 'Transfer';
      case 'qris': return 'QRIS';
      default: return method;
    }
  };

  const calculateTotal = (trx: any) => {
    const subtotal = trx.subtotal || 0;
    const tax = trx.tax || 0;
    const discount = trx.discount || 0;
    return subtotal + tax - discount;
  };

  const getPaymentStatusBadge = (status: string) => {
    if (status === 'partial') return <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-medium">Cicilan</Badge>;
    if (status === 'unpaid') return <Badge variant="destructive" className="font-medium">Tempo</Badge>;
    return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium">Lunas</Badge>;
  };

  return (
    <Sidebar>
      <div className="flex-1 flex flex-col h-full bg-slate-50">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex flex-row items-center justify-between gap-4 w-full">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <History className="w-6 h-6 text-primary animate-pulse shrink-0" />
              <span className="truncate">Riwayat Transaksi</span>
            </h1>

            {/* Filter Section (Popover) */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="shrink-0 w-9 h-9 sm:w-auto sm:h-9 rounded-full sm:rounded-md p-0 sm:px-4 flex items-center justify-center sm:gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Filter Transaksi</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[340px] max-w-[95vw] sm:w-[400px] p-4 sm:rounded-2xl shadow-xl">
                <div className="space-y-4">
                  <div className="font-semibold text-sm mb-2">Filter Data</div>

                  {/* Date Filters */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500">Rentang Tanggal</label>
                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                      <div className="relative w-full h-9">
                        <Input
                          type="text"
                          placeholder="Tanggal Mulai"
                          value={startDate ? startDate.split('-').reverse().join('-') : ""}
                          readOnly
                          className="absolute inset-0 h-9 w-full rounded-md text-sm text-center bg-transparent focus:ring-0 cursor-pointer"
                        />
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e: any) => { setStartDate(e.target.value); setPage(1); }}
                          onClick={(e: any) => {
                            try { e.target.showPicker?.(); } catch (err) { }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          title="Tanggal Mulai"
                        />
                      </div>
                      <span className="text-slate-400 text-sm hidden sm:block">-</span>
                      <div className="relative w-full h-9">
                        <Input
                          type="text"
                          placeholder="Tanggal Akhir"
                          value={endDate ? endDate.split('-').reverse().join('-') : ""}
                          readOnly
                          className="absolute inset-0 h-9 w-full rounded-md text-sm text-center bg-transparent focus:ring-0 cursor-pointer"
                        />
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e: any) => { setEndDate(e.target.value); setPage(1); }}
                          onClick={(e: any) => {
                            try { e.target.showPicker?.(); } catch (err) { }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          title="Tanggal Akhir"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Only show for admin super */}
                  {isAdminSuper && (
                    <>
                      {/* Cashier Filter */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500">Sales</label>
                        <Select value={cashierFilter} onValueChange={(v) => { setCashierFilter(v); setPage(1); }}>
                          <SelectTrigger className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                            <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                            <SelectValue placeholder="Semua Sales" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Sales</SelectItem>
                            {cashiers.map((cashier) => (
                              <SelectItem key={cashier} value={cashier}>
                                {cashier}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {/* Payment Method Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500">Metode Pembayaran</label>
                    <Select value={paymentMethod} onValueChange={handlePaymentMethodChange}>
                      <SelectTrigger className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                        <CreditCard className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                        <SelectValue placeholder="Semua Metode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Metode</SelectItem>
                        <SelectItem value="cash">Tunai</SelectItem>
                        <SelectItem value="qris">QRIS</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                        <SelectItem value="debit_card">E-wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment Status Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500">Status Pembayaran</label>
                    <Select value={paymentStatus} onValueChange={(v) => { setPaymentStatus(v); setPage(1); }}>
                      <SelectTrigger className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                        <History className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                        <SelectValue placeholder="Semua Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="paid">Lunas</SelectItem>
                        <SelectItem value="partial">Cicilan</SelectItem>
                        <SelectItem value="unpaid">Tempo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="p-4 sm:p-6 flex-1 overflow-x-hidden pb-20">

          {/* Mobile Card List */}
          <div className="flex flex-col gap-3 lg:hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-500">
                <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-xs font-medium">Memuat...</p>
              </div>
            ) : transactions?.length === 0 ? (
              <div className="text-center py-10 text-slate-500">Tidak ada transaksi ditemukan</div>
            ) : (
              <>
                {transactions?.map(trx => {
                  const total = calculateTotal(trx);
                  const customerName = trx.customers?.name || "Umum";

                  return (
                    <div
                      key={trx.id}
                      onClick={() => setSelectedTransaction(trx)}
                      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-primary/20 hover:shadow-md active:bg-primary/5 transition-all duration-200"
                    >
                      {/* Row 1: Invoice + Total */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                            {formatInvoiceNumber(trx.id)}
                            {trx.is_edited && (
                              <Badge variant="outline" className="w-5 h-5 p-0 flex items-center justify-center rounded-full border-blue-500 text-blue-600 bg-blue-50 text-[10px]" title="Transaksi telah diedit">R</Badge>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {formatTransactionHistoryDate(trx.created_at)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary text-base whitespace-nowrap">
                            {formatRupiah(total)}
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Customer + Cashier + Payment */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-slate-500">
                            <span className="font-medium text-slate-700">{customerName}</span>
                          </span>
                          <span className="text-xs text-slate-400">
                            {trx.cashier_name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {getPaymentStatusBadge(trx.payment_status)}
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-700 whitespace-nowrap">
                            {getPaymentIcon(trx.payment_method)}
                            {getPaymentLabel(trx.payment_method)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Mobile/Tablet Pagination */}
                <div className="flex items-center justify-between px-2 py-3 border-t border-slate-200 mt-2">
                  <div className="text-sm text-slate-500">Halaman {page}</div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevious}
                      disabled={page === 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNext}
                      disabled={transactions.length < ITEMS_PER_PAGE}
                      className="flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead>ID / Waktu</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead className="text-center">Sales</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>Metode Pembayaran</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12">
                        <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                          <p className="text-xs font-medium">Memuat...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : transactions?.map(trx => {
                    const total = calculateTotal(trx);

                    return (
                      <TableRow
                        key={trx.id}
                        className="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:shadow-sm relative hover:z-10 transition-all duration-200 cursor-pointer"
                        onClick={() => setSelectedTransaction(trx)}
                      >
                        <TableCell>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {formatInvoiceNumber(trx.id)}
                            {trx.is_edited && (
                              <Badge variant="outline" className="w-5 h-5 p-0 flex items-center justify-center rounded-full border-blue-500 text-blue-600 bg-blue-50 text-[10px]" title="Transaksi telah diedit">R</Badge>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">{formatTransactionHistoryDate(trx.created_at)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {trx.customers?.name || "Umum"}
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-slate-600">{trx.cashier_name}</TableCell>
                        <TableCell className="text-center">
                          {getPaymentStatusBadge(trx.payment_status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 w-max rounded text-sm font-medium">
                            {getPaymentIcon(trx.payment_method)}
                            {getPaymentLabel(trx.payment_method)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          {formatRupiah(total)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {transactions?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        Tidak ada transaksi ditemukan
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {!isLoading && transactions && transactions.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
                <div className="text-sm text-slate-500">
                  Halaman {page}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={page === 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    disabled={transactions.length < ITEMS_PER_PAGE}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Detail Pop-up */}
      {selectedTransaction && (
        <TransactionReceiptDialog
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onDeleted={() => {
            setSelectedTransaction(null);
            refetch();
          }}
        />
      )}
    </Sidebar>
  );
}
