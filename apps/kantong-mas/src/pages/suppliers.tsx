import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Plus, Search, Truck, Filter, SlidersHorizontal, FileText, Download, CreditCard, ArrowRightLeft, Check, ChevronsUpDown, ChevronLeft, ChevronRight, Trash2, Edit, CalendarRange, RefreshCcw, AlertTriangle, Activity, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import * as XLSX from "xlsx-js-style";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { 
  useListProducts, 
  useCreateProduct, 
  useUpdateProduct,
  getListProductsQueryKey,
  useListSupplierTransactions,
  useCreateSupplierTransaction,
  useUpdateSupplierTransaction,
  useDeleteSupplierTransaction,
  useListSupplierReturns,
  useCreateSupplierReturn,
  useUpdateSupplierReturn,
  useDeleteSupplierReturn
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tempStatusFilter, setTempStatusFilter] = useState("all");
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'transactions' | 'returns' | 'transfer' | 'mutations' | 'tagihan'>('transactions');
  const { data: dbReturns = [] } = useListSupplierReturns();
  const supplierReturns = dbReturns.map(r => ({
    id: r.id,
    invoiceId: r.transaction_id,
    supplierName: r.supplier_name,
    date: r.date,
    status: r.status,
    totalRefund: r.total_refund,
    items: r.items,
    reason: (r as any).reason,
    notes: (r as any).notes
  }));
  const createRet = useCreateSupplierReturn();
  const updateRet = useUpdateSupplierReturn();
  const deleteRet = useDeleteSupplierReturn();
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [returnSearchInvoice, setReturnSearchInvoice] = useState("");
  const [returnTransaction, setReturnTransaction] = useState<any>(null);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [editingReturnId, setEditingReturnId] = useState<string | null>(null);
  const [returnItems, setReturnItems] = useState<Record<string, number>>({});
  const [returnReason, setReturnReason] = useState("");
  const [returnNotes, setReturnNotes] = useState("");

  const { toast } = useToast();
  const [productOpen, setProductOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, statusFilter, startDate, endDate]);

  useEffect(() => {
    if (isFilterOpen) {
      setTempStatusFilter(statusFilter);
      setTempStartDate(startDate);
      setTempEndDate(endDate);
    }
  }, [isFilterOpen, statusFilter, startDate, endDate]);

  const handleApplyFilter = () => {
    setStatusFilter(tempStatusFilter);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setIsFilterOpen(false);
  };

  const handleResetFilter = () => {
    setTempStatusFilter("all");
    setTempStartDate("");
    setTempEndDate("");
  };
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  // Fetch products for dropdown
  const { data: products } = useListProducts();

  const [formData, setFormData] = useState({
    noFaktur: "",
    tanggal: "",
    supplierName: "",
    discount: "",
    tax: "",
    totalAmount: "",
    paymentType: "Lunas",
    paymentMethod: "Tunai",
    dueDate: "",
    downPayment: ""
  });

  // Multiple items state
  const [purchasedItems, setPurchasedItems] = useState<any[]>([]);
  const [currentItem, setCurrentItem] = useState({
    productId: "",
    productName: "",
    quantity: "1",
    price: ""
  });
  const [searchItemText, setSearchItemText] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTanggalCalendarOpen, setIsTanggalCalendarOpen] = useState(false);

  const [paymentDialogState, setPaymentDialogState] = useState<{ isOpen: boolean, trxId: string | null, sisaTagihan: number, nominalBayar: string }>({
    isOpen: false,
    trxId: null,
    sisaTagihan: 0,
    nominalBayar: ''
  });

  const [transferTransaction, setTransferTransaction] = useState<any>(null);
  
  const { data: dbTransactions = [], totalCount = 0 } = useListSupplierTransactions({
    limit: ITEMS_PER_PAGE,
    offset: (currentPage - 1) * ITEMS_PER_PAGE
  });
  const transactions = dbTransactions.map(t => ({
    id: t.id,
    supplierName: t.supplier_name,
    date: t.created_at || t.date,
    totalAmount: t.total_amount,
    status: t.status,
    paymentMethod: t.payment_method,
    items: t.items ? t.items.length : 0,
    discount: t.discount,
    tax: t.tax,
    purchasedItems: t.items,
    dueDate: t.due_date,
    downPayment: t.down_payment,
    isTransferred: t.is_transferred
  }));
  const createTx = useCreateSupplierTransaction();
  const updateTx = useUpdateSupplierTransaction();
  const deleteTx = useDeleteSupplierTransaction();

  const formatWaktu = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const datePart = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const timePart = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
    return `${datePart.toLowerCase()} - ${timePart}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (val: string | number) => {
    if (!val) return "";
    const numericString = val.toString().replace(/[^0-9]/g, "");
    if (!numericString) return "";
    return new Intl.NumberFormat('id-ID').format(Number(numericString));
  };

  const calculateTotal = (items: any[], discountStr: string, taxStr: string) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const discount = Number(discountStr) || 0;
    const tax = Number(taxStr) || 0;
    const total = subtotal - discount + tax;
    return total > 0 ? total : 0;
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDiscountChange = (val: string) => {
    handleInputChange('discount', val);
    setFormData(prev => ({ ...prev, totalAmount: calculateTotal(purchasedItems, val, prev.tax).toString() }));
  };

  const handleTaxChange = (val: string) => {
    handleInputChange('tax', val);
    setFormData(prev => ({ ...prev, totalAmount: calculateTotal(purchasedItems, prev.discount, val).toString() }));
  };

  const handleCurrentItemChange = (field: string, value: string) => {
    setCurrentItem(prev => ({ ...prev, [field]: value }));
  };

  const handleAddItem = () => {
    if (!currentItem.productName) {
      toast({ title: "Error", description: "Pilih atau ketik nama produk terlebih dahulu.", variant: "destructive" });
      return;
    }
    if (!currentItem.quantity || Number(currentItem.quantity) <= 0) {
      toast({ title: "Error", description: "Kuantitas minimal 1.", variant: "destructive" });
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      productId: currentItem.productId || 'new',
      productName: currentItem.productName,
      quantity: Number(currentItem.quantity),
      price: Number(currentItem.price) || 0
    };

    const updatedItems = [...purchasedItems, newItem];
    setPurchasedItems(updatedItems);

    // Auto calculate total
    const newTotal = calculateTotal(updatedItems, formData.discount, formData.tax);
    setFormData(prev => ({ ...prev, totalAmount: newTotal.toString() }));

    // Reset current item input
    setCurrentItem({
      productId: "",
      productName: "",
      quantity: "1",
      price: ""
    });
    setSearchItemText("");
  };

  const handleRemoveItem = (id: string) => {
    const updatedItems = purchasedItems.filter(item => item.id !== id);
    setPurchasedItems(updatedItems);
    // Auto calculate total
    const newTotal = calculateTotal(updatedItems, formData.discount, formData.tax);
    setFormData(prev => ({ ...prev, totalAmount: newTotal.toString() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (purchasedItems.length === 0) {
      toast({ title: "Error", description: "Tambahkan minimal 1 produk barang.", variant: "destructive" });
      return;
    }

    try {
      // Loop over items to create new products in the database
      for (const item of purchasedItems) {
        if (item.productId === 'new') {
          await new Promise<void>((resolve, reject) => {
            createProduct.mutate({
              data: {
                name: item.productName,
                price: item.price > 0 ? item.price : 0, // Set default selling price
                categoryId: null,
                allowedOutlets: ["all"],
                imageUrl: "",
                isActive: true,
                stockQuantity: item.quantity // Initialize stock with purchased quantity
              }
            }, {
              onSuccess: () => resolve(),
              onError: (err: any) => reject(err)
            });
          });
        }
      }
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
    } catch (err) {
      console.error("Gagal menyimpan produk baru", err);
      toast({ title: "Peringatan", description: "Transaksi tersimpan, tapi gagal menambahkan beberapa produk ke master data.", variant: "destructive" });
    }

    const dbTx = {
      invoice_id: formData.noFaktur || `INV-${new Date().getTime().toString().slice(-6)}`,
      supplier_name: formData.supplierName || "Suplier Baru",
      date: formData.tanggal || new Date().toISOString().split('T')[0],
      total_amount: Number(formData.totalAmount),
      subtotal: purchasedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0),
      status: formData.paymentType,
      payment_method: formData.paymentMethod,
      discount: formData.discount ? Number(formData.discount.toString().replace(/[^0-9]/g, '')) : 0,
      tax: formData.tax ? Number(formData.tax.toString().replace(/[^0-9]/g, '')) : 0,
      items: purchasedItems,
      due_date: formData.paymentType !== "Lunas" ? formData.dueDate || null : null,
      down_payment: formData.paymentType === "Cicilan" && formData.downPayment ? Number(formData.downPayment.toString().replace(/[^0-9]/g, '')) : 0,
      is_transferred: false
    };

    try {
      if (editingTransactionId) {
        await updateTx.mutateAsync({ id: editingTransactionId, data: dbTx });
        setEditingTransactionId(null);
      } else {
        const newId = formData.noFaktur || `INV-${new Date().getTime().toString().slice(-6)}`;
        await createTx.mutateAsync({ data: { ...dbTx, id: newId } });
      }
    } catch (err) {
      toast({ title: "Gagal", description: "Gagal menyimpan transaksi ke database", variant: "destructive" });
      return;
    }

    setIsAddDialogOpen(false);

    // Reset form
    setFormData({
      noFaktur: "",
      tanggal: "",
      supplierName: "",
      discount: "",
      tax: "",
      totalAmount: "",
      paymentType: "Lunas",
      paymentMethod: "Tunai",
      dueDate: "",
      downPayment: ""
    });
    setPurchasedItems([]);

    toast({
      title: "Berhasil",
      description: editingTransactionId ? "Data pembelian berhasil diperbarui" : "Data pembelian dan barang berhasil ditambahkan",
    });
  };

  const handleDeleteTransaction = async (id: string) => {
    if (confirm("Hapus faktur ini?")) {
      try {
        await deleteTx.mutateAsync({ id });
        toast({ title: "Sukses", description: "Faktur dihapus" });
      } catch (err) {
        toast({ title: "Gagal", description: "Gagal menghapus faktur", variant: "destructive" });
      }
    }
  };

  const handlePayDebt = (trx: any) => {
    const sisa = trx.status === 'Selesai' || trx.status === 'Lunas' ? 0 : Math.max(0, trx.totalAmount - (trx.downPayment || 0));
    setPaymentDialogState({
      isOpen: true,
      trxId: trx.id,
      sisaTagihan: sisa,
      nominalBayar: ''
    });
  };

  const submitPayment = async () => {
    const bayar = Number(paymentDialogState.nominalBayar || 0);
    if (bayar <= 0) {
      toast({ title: "Error", description: "Nominal pembayaran harus lebih dari 0", variant: "destructive" });
      return;
    }

    const t = transactions.find(t => t.id === paymentDialogState.trxId);
    if (t) {
      const currentDP = t.status === 'Cicilan' ? (t.downPayment || 0) : 0;
      const newDP = currentDP + bayar;
      const sisa = Math.max(0, t.totalAmount - newDP);

      try {
        await updateTx.mutateAsync({
          id: t.id,
          data: {
            down_payment: newDP,
            status: sisa <= 0 ? 'Selesai' : 'Cicilan'
          }
        });
        toast({ title: "Berhasil", description: "Pembayaran berhasil disimpan." });
        setPaymentDialogState(prev => ({ ...prev, isOpen: false }));
      } catch (err) {
        toast({ title: "Gagal", description: "Gagal menyimpan pembayaran", variant: "destructive" });
      }
    }
  };

  const handlePrintPurchaseInvoice = (trx: any, isReturn: boolean = false, returnData: any = null) => {
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

    const storeName = localStorage.getItem('storeName') || 'KANTONG-MAS';
    const storeAddress = localStorage.getItem('storeAddress') || 'Jl. Condongcatur No.123 Yk';
    const storePhone = localStorage.getItem('storePhone') || '081234567890';
    const bankName = localStorage.getItem('storeBankName') || 'BCA';
    const bankAccount = localStorage.getItem('storeBankAccount') || '4451377137';
    const bankAccountName = localStorage.getItem('storeBankAccountName') || 'AULIA USAHA';
    const showFooter = localStorage.getItem('showFooter') !== 'false';
    const footerMessage = showFooter ? (localStorage.getItem('footerMessage') || '') : '';
    const footerMessage2 = showFooter ? (localStorage.getItem('footerMessage2') || '') : '';
    const footerMessage3 = showFooter ? (localStorage.getItem('footerMessage3') || '') : '';

    const fmtRp = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

    const itemsSource = (isReturn && returnData) ? returnData.items : trx.purchasedItems;

    let itemsHtml = itemsSource?.map((item: any, index: number) => {
      const productName = item.productName || 'Unknown';
      const qty = (isReturn && returnData) ? (item.returnQuantity || 0) : (item.quantity || 0);
      const unitPrice = item.price || 0;
      const subtotal = qty * unitPrice;
      return `
        <tr>
          <td style="text-align: center;">${index + 1}</td>
          <td>${productName}</td>
          <td style="text-align: center;">${qty}</td>
          <td style="text-align: right;">${fmtRp(unitPrice)}</td>
          <td style="text-align: right;">${fmtRp(subtotal)}</td>
        </tr>`;
    }).join('') || '';

    const itemsCount = itemsSource?.length || 0;
    if (itemsCount < 8) {
      for (let i = itemsCount; i < 8; i++) {
        itemsHtml += `
          <tr class="empty-row">
            <td style="text-align: center;">${i + 1}</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
          </tr>`;
      }
    }

    let invoiceDate = '-';
    if (trx.date) {
      const dateObj = new Date(trx.date);
      invoiceDate = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    let dueDateStr = '-';
    if (trx.dueDate) {
      dueDateStr = new Date(trx.dueDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    const subtotalBarang = trx.purchasedItems?.length > 0
      ? trx.purchasedItems.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0)
      : (trx.totalAmount + (trx.discount || 0) - (trx.tax || 0));

    const finalTotal = (isReturn && returnData) ? returnData.totalRefund : trx.totalAmount;

    const statusLabel = isReturn ? (returnData?.status === 'Diproses' ? 'PENGAJUAN' : (returnData?.status?.toUpperCase() || 'RETUR')) : (trx.status === 'Lunas' || trx.status === 'Selesai' ? (trx.originalStatus ? trx.originalStatus.toUpperCase() : 'LUNAS') : (trx.status === 'Cicilan' ? 'CICILAN' : 'TEMPO PENUH'));
    const statusBadgeClass = isReturn ? 'badge-completed' : (trx.status === 'Lunas' || trx.status === 'Selesai' ? 'badge-completed' : 'badge-pending');

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
                  <h1 class="invoice-title">${isReturn ? 'FAKTUR RETUR' : (activeTab === 'tagihan' ? 'FAKTUR PEMBAYARAN' : 'FAKTUR PEMBELIAN')}</h1>
                  <div style="font-size: 12px; font-weight: 700; margin-top: 4px; display: inline-flex; gap: 6px; justify-content: flex-end; align-items: center; width: 100%;">
                    <span class="invoice-status-badge ${statusBadgeClass}">${statusLabel}</span>
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
                      <td style="width: 1%; white-space: nowrap; padding: 2px 0; color: #475569; font-weight: 500;">Suplier</td>
                      <td style="width: 1%; white-space: nowrap; padding: 2px 8px 2px 4px; color: #475569;">:</td>
                      <td style="padding: 2px 0; font-weight: 600; color: #0f172a;">${trx.supplierName || '-'}</td>
                    </tr>
                    ${trx.status !== 'Lunas' && trx.dueDate ? `<tr>
                      <td style="width: 1%; white-space: nowrap; padding: 2px 0; color: #475569; font-weight: 500;">Jatuh Tempo</td>
                      <td style="width: 1%; white-space: nowrap; padding: 2px 8px 2px 4px; color: #475569;">:</td>
                      <td style="padding: 2px 0; font-weight: 600; color: #dc2626;">${dueDateStr}</td>
                    </tr>` : ''}
                  </table>
                </td>
                <td style="width: 2%;"></td>
                <td style="width: 28%; vertical-align: top;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <tr>
                      <td style="width: 1%; white-space: nowrap; padding: 2px 0; color: #475569; font-weight: 500;">No. Faktur</td>
                      <td style="width: 1%; white-space: nowrap; padding: 2px 8px 2px 4px; color: #475569;">:</td>
                      <td style="padding: 2px 0; font-weight: 600; color: #0f172a; white-space: nowrap;">${trx.id}</td>
                    </tr>
                    <tr>
                      <td style="width: 1%; white-space: nowrap; padding: 2px 0; color: #475569; font-weight: 500;">Tanggal</td>
                      <td style="width: 1%; white-space: nowrap; padding: 2px 8px 2px 4px; color: #475569;">:</td>
                      <td style="padding: 2px 0; white-space: nowrap;">${invoiceDate}</td>
                    </tr>
                    <tr>
                      <td style="width: 1%; white-space: nowrap; padding: 2px 0; color: #475569; font-weight: 500;">Status</td>
                      <td style="width: 1%; white-space: nowrap; padding: 2px 8px 2px 4px; color: #475569;">:</td>
                      <td style="padding: 2px 0; white-space: nowrap;">${isReturn ? (returnData?.status === 'Diproses' ? 'Pengajuan' : (returnData?.status || '-')) : trx.status}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 5%; text-align: center;">No</th>
                  <th style="width: 44%; text-align: left;">Nama Produk / Item</th>
                  <th style="width: 15%; text-align: center;">Qty</th>
                  <th style="width: 15%; text-align: right;">Harga Satuan</th>
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
                    ${isReturn ? `
                      Alasan Retur : <strong>${returnData?.reason || '-'}</strong><br>
                      Status : <strong>${returnData?.status === 'Diproses' ? 'Pengajuan' : (returnData?.status || '-')}</strong>
                    ` : (activeTab === 'tagihan' ? `
                      Pengajuan : <strong>Pelunasan</strong><br>
                      Status : <strong>${trx.status}</strong>
                    ` : `
                      Status : <strong>${trx.status}</strong>
                    `)}
                  </div>
                </td>
                <td style="width: 45%; vertical-align: top; text-align: right;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 11.4px; line-height: 1.4; float: right;">
                    ${(!isReturn && trx.tax && trx.tax > 0) ? `
                    <tr>
                      <td style="color: #475569; font-weight: 500; text-align: left; padding: 2px 0;">PPN/Pajak</td>
                      <td style="text-align: right; color: #0f172a; font-weight: 600; padding: 2px 0;">${fmtRp(trx.tax)}</td>
                    </tr>` : ''}
                    ${(!isReturn && trx.discount && trx.discount > 0) ? `
                    <tr>
                      <td style="color: #ea580c; font-weight: 500; text-align: left; padding: 2px 0;">Diskon</td>
                      <td style="text-align: right; color: #ea580c; font-weight: 600; padding: 2px 0;">-${fmtRp(trx.discount)}</td>
                    </tr>` : ''}
                    <tr>
                      <td style="color: #0f172a; font-weight: 800; border-top: 1.5px solid #0f172a; padding-top: 4px; text-align: left; font-size: 15.6px;">${isReturn ? 'TOTAL REFUND' : 'TOTAL'}</td>
                      <td style="text-align: right; color: #0f172a; font-weight: 800; border-top: 1.5px solid #0f172a; padding-top: 4px; font-size: 15.6px;">
                        ${fmtRp(finalTotal)}
                      </td>
                    </tr>
                    ${(!isReturn && (trx.status === 'Selesai' || trx.status === 'Lunas')) ? `
                    <tr>
                      <td style="color: #475569; font-weight: 500; text-align: left; padding: 2px 0;">Sudah Dibayarkan</td>
                      <td style="text-align: right; color: #0f172a; font-weight: 600; padding: 2px 0;">${fmtRp(trx.previousDownPayment || (trx.totalAmount - (trx.lastPaymentAmount || trx.totalAmount)))}</td>
                    </tr>
                    <tr>
                      <td style="color: #10b981; font-weight: 700; text-align: left; padding: 2px 0;">Pembayaran Saat Ini</td>
                      <td style="text-align: right; color: #10b981; font-weight: 800; padding: 2px 0;">${fmtRp(trx.lastPaymentAmount || trx.totalAmount)}</td>
                    </tr>` : (!isReturn ? `
                    <tr>
                      <td style="color: #475569; font-weight: 500; text-align: left; padding: 2px 0;">Total Dibayar</td>
                      <td style="text-align: right; color: #0f172a; font-weight: 600; padding: 2px 0;">${fmtRp(trx.status === 'Tempo Penuh' ? 0 : (trx.downPayment || 0))}</td>
                    </tr>
                    <tr>
                      <td style="color: #ea580c; font-weight: 800; border-top: 1.5px solid #0f172a; padding-top: 4px; text-align: left; font-size: 15.6px;">${activeTab === 'tagihan' ? 'Kekurangan Pembayaran' : 'Sisa Tagihan'}</td>
                      <td style="text-align: right; color: #ea580c; font-weight: 800; border-top: 1.5px solid #0f172a; padding-top: 4px; font-size: 15.6px;">${fmtRp(Math.max(0, trx.totalAmount - (trx.status === 'Tempo Penuh' ? 0 : (trx.downPayment || 0))))}</td>
                    </tr>` : '')}
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
              Pembayaran Transfer melalui Bank: <strong>${bankName} ${bankAccount}</strong> a/n <strong>${bankAccountName}</strong>
            </div>
            <div class="footer-divider"></div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="text-align: center; font-size: 10.2px; color: #64748b;">
                  ${footerMessage || 'Terima Kasih Sudah Melakukan Order'}
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
        <title>${isReturn ? 'Faktur Retur' : (activeTab === 'tagihan' ? 'Faktur Pembayaran' : 'Faktur Pembelian')} - ${trx.id}</title>
        <style>
          @font-face {
            font-family: 'GoogleSansFlex';
            src: url('${import.meta.env.BASE_URL}GoogleSansFlex_9pt-Regular.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
          }
          @page {
            size: auto;
            margin: 0mm;
          }
          @media print {
            body { margin: 0; padding: 5mm 8mm; }
            .no-print { display: none !important; }
            .invoice-copy { border: none !important; }
          }
          * {
            box-sizing: border-box;
            color: #000000 !important;
            font-family: 'GoogleSansFlex', Arial, Helvetica, sans-serif !important;
            font-weight: bold !important;
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
            border: none;
            padding: 0;
            background-color: #ffffff;
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
            background-color: #fee2e2;
            color: #991b1b;
            border: 1px solid #fecaca;
          }
          .badge-partial {
            background-color: #fef9c3;
            color: #854d0e;
            border: 1px solid #fef08a;
          }
          .header-divider {
            border: none;
            border-top: 2px double #0f172a;
            margin: 4px 0 6px 0;
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
          .footer-divider {
            border: none;
            border-top: 1px solid #cbd5e1;
            margin: 6px 0 4px 0;
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

  const handleEditTransaction = (trx: any) => {
    setFormData({
      noFaktur: trx.id,
      tanggal: trx.date,
      supplierName: trx.supplierName,
      discount: trx.discount?.toString() || "",
      tax: trx.tax?.toString() || "",
      totalAmount: trx.totalAmount?.toString() || "0",
      paymentType: trx.status,
      paymentMethod: trx.paymentMethod || "Tunai",
      dueDate: trx.dueDate || "",
      downPayment: trx.downPayment?.toString() || ""
    });
    setPurchasedItems(trx.purchasedItems || []);
    setEditingTransactionId(trx.id);
    setIsAddDialogOpen(true);
  };

  const handleExecuteTransfer = async () => {
    if (!transferTransaction) return;

    try {
      if (transferTransaction.purchasedItems) {
        for (const item of transferTransaction.purchasedItems) {
          const product = products?.find((p: any) => p.id.toString() === item.productId);
          if (product) {
            const newStock = (product.stock_quantity || 0) + (item.quantity || 0);
            await new Promise((resolve, reject) => {
              updateProduct.mutate(
                { 
                  id: product.id, 
                  data: { 
                    name: product.name,
                    price: product.price,
                    isActive: product.isActive !== false && product.isActive !== "false" && product.is_active !== false && product.is_active !== "false",
                    categoryId: product.category_id,
                    imageUrl: product.image_url,
                    allowedOutlets: product.allowed_outlets,
                    hpp: product.hpp,
                    stockQuantity: newStock 
                  } 
                },
                { onSuccess: resolve, onError: reject }
              );
            });
          }
        }
      }

      await updateTx.mutateAsync({
        id: transferTransaction.id,
        data: { is_transferred: true }
      });
      
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      
      toast({
        title: "Transfer Berhasil",
        description: `Stok dari faktur ${transferTransaction.id} berhasil ditambahkan ke gudang utama.`
      });
      setTransferTransaction(null);
    } catch (err) {
      toast({ title: "Gagal", description: "Gagal melakukan transfer", variant: "destructive" });
    }
  };

  const handleSearchReturnInvoice = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!returnSearchInvoice) return;
    const found = transactions.find(t => t.id === returnSearchInvoice);
    if (found) {
      setReturnTransaction(found);
      setReturnItems({});
      setReturnReason("");
      setReturnNotes("");
    } else {
      toast({ title: "Tidak ditemukan", description: "Faktur pembelian tidak ditemukan.", variant: "destructive" });
    }
  };

  const handleReturnQtyChange = (itemId: string, value: string, maxLimit: number) => {
    const val = parseInt(value) || 0;
    setReturnItems(prev => ({
      ...prev,
      [itemId]: Math.min(maxLimit, Math.max(0, val))
    }));
  };

  const handleSubmitReturn = async () => {
    if (!returnTransaction) return;

    const itemsToReturn = returnTransaction.purchasedItems
      .filter((item: any) => (returnItems[item.id] || 0) > 0)
      .map((item: any) => {
        const qty = returnItems[item.id] || 0;
        return {
          ...item,
          returnQuantity: qty,
          returnSubtotal: qty * item.price
        };
      });

    if (itemsToReturn.length === 0) {
      toast({ title: "Peringatan", description: "Pilih minimal 1 barang untuk diretur.", variant: "destructive" });
      return;
    }

    if (!returnReason) {
      toast({ title: "Peringatan", description: "Pilih alasan retur.", variant: "destructive" });
      return;
    }

    const totalRefundAmount = itemsToReturn.reduce((sum: number, item: any) => sum + item.returnSubtotal, 0);

    const generateReturnId = () => {
      let maxNum = 0;
      supplierReturns.forEach(ret => {
        const match = ret.id.match(/INV-ID(\d+)/);
        if (match) {
          const num = parseInt(match[1]);
          if (num > maxNum) maxNum = num;
        }
      });
      return `INV-ID${String(maxNum + 1).padStart(5, '0')}`;
    };

    const dbRet = {
      transaction_id: returnTransaction.id,
      supplier_name: returnTransaction.supplierName,
      date: editingReturnId ? (supplierReturns.find(r => r.id === editingReturnId)?.date || new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
      reason: returnReason,
      notes: returnNotes,
      items: itemsToReturn,
      total_refund: totalRefundAmount,
      status: editingReturnId ? (supplierReturns.find(r => r.id === editingReturnId)?.status || 'Diproses') : 'Diproses'
    };

    try {
      if (editingReturnId) {
        await updateRet.mutateAsync({ id: editingReturnId, data: dbRet });
      } else {
        await createRet.mutateAsync({ data: { ...dbRet, id: generateReturnId() } });
      }
      setIsReturnDialogOpen(false);
      setReturnTransaction(null);
      setReturnSearchInvoice("");
      setEditingReturnId(null);
      toast({ title: "Sukses", description: editingReturnId ? "Retur suplier diperbarui." : "Retur suplier berhasil dicatat." });
    } catch (err) {
      toast({ title: "Gagal", description: "Gagal menyimpan data retur", variant: "destructive" });
    }
  };

  const handleDeleteReturn = async (id: string) => {
    if (confirm("Hapus riwayat retur ini?")) {
      try {
        await deleteRet.mutateAsync({ id });
        toast({ title: "Sukses", description: "Riwayat retur dihapus" });
      } catch (err) {
        toast({ title: "Gagal", description: "Gagal menghapus riwayat retur", variant: "destructive" });
      }
    }
  };

  const handleCompleteReturn = async (id: string) => {
    if (confirm("Tandai proses retur ini sebagai selesai? Stok akan dikurangi sesuai jumlah retur.")) {
      try {
        const ret = supplierReturns.find(r => r.id === id);
        if (ret && ret.items) {
          for (const item of ret.items) {
            const product = products?.find((p: any) => p.id.toString() === item.productId);
            if (product) {
              const newStock = Math.max(0, (product.stock_quantity || 0) - (item.returnQuantity || 0));
              await new Promise((resolve, reject) => {
                updateProduct.mutate(
                  { 
                    id: product.id, 
                    data: { 
                      name: product.name,
                      price: product.price,
                      isActive: product.isActive !== false && product.isActive !== "false" && product.is_active !== false && product.is_active !== "false",
                      categoryId: product.category_id,
                      imageUrl: product.image_url,
                      allowedOutlets: product.allowed_outlets,
                      hpp: product.hpp,
                      stockQuantity: newStock 
                    } 
                  },
                  { onSuccess: resolve, onError: reject }
                );
              });
            }
          }
        }
        
        await updateRet.mutateAsync({ id, data: { status: 'Selesai' } });
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        toast({ title: "Selesai", description: "Retur suplier selesai dan stok gudang berhasil dikurangi." });
      } catch (err) {
        console.error("Error processing return:", err);
        toast({ title: "Gagal", description: "Terjadi kesalahan saat memproses retur atau stok", variant: "destructive" });
      }
    }
  };

  const handleEditReturn = (ret: any) => {
    const found = transactions.find(t => t.id === ret.invoiceId);
    if (found) {
      setReturnTransaction(found);
      setReturnSearchInvoice(ret.invoiceId);

      const newReturnItems: Record<string, number> = {};
      ret.items.forEach((item: any) => {
        newReturnItems[item.id] = item.returnQuantity;
      });
      setReturnItems(newReturnItems);
      setReturnReason(ret.reason);
      setReturnNotes(ret.notes || "");
      setEditingReturnId(ret.id);
      setIsReturnDialogOpen(true);
    } else {
      toast({ title: "Error", description: "Data faktur asli tidak ditemukan, tidak bisa diedit.", variant: "destructive" });
    }
  };

  const debts = [...transactions].filter(t => t.status === "Tempo Penuh" || t.status === "Cicilan").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const displayedData = transactions.filter(t => {
    const searchMatch = t.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase());
    if (!searchMatch) return false;

    if (statusFilter !== "all") {
      if (statusFilter === "Selesai") {
        if (t.status !== "Selesai" && t.status !== "Lunas") return false;
      } else if (t.status !== statusFilter) {
        return false;
      }
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const itemDate = new Date(t.date);
      if (itemDate < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      const itemDate = new Date(t.date);
      if (itemDate > end) return false;
    }

    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const sortedReturns = [...supplierReturns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const transferData = [...transactions].filter(t => t.purchasedItems && t.purchasedItems.length > 0).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const allMutations: any[] = [];
  
  transactions.forEach(t => {
    allMutations.push({
      id: t.id,
      date: t.date,
      type: 'Pembelian' as const,
      supplierName: t.supplierName,
      referenceId: t.id,
      amount: t.totalAmount,
      status: t.status
    });
    
    if (t.purchasedItems && t.purchasedItems.length > 0) {
      allMutations.push({
        id: t.id + '-trf',
        date: t.date,
        type: 'Transfer Stok' as const,
        supplierName: t.supplierName,
        referenceId: t.id,
        amount: t.totalAmount,
        status: 'Selesai'
      });
    }
  });

  supplierReturns.forEach(r => {
    allMutations.push({
      id: r.id,
      date: r.date,
      type: 'Retur' as const,
      supplierName: r.supplierName,
      referenceId: r.invoiceId,
      amount: r.totalRefund,
      status: 'Refunded'
    });
  });

  const mutationsData = allMutations
    .map((mut, idx) => ({ ...mut, _originalIndex: idx }))
    .sort((a, b) => {
      const timeDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (timeDiff !== 0) return timeDiff;
      return b._originalIndex - a._originalIndex;
    });

  const PaginationControls = ({ dataLength, itemName }: { dataLength: number, itemName?: string }) => {
    const totalPages = Math.ceil(
      activeTab === 'transactions' ? totalCount / ITEMS_PER_PAGE :
      dataLength / ITEMS_PER_PAGE
    );
    if (dataLength === 0) return null;
    
    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 mt-2 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="text-sm text-slate-500">
          Halaman {currentPage} dari {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  const totalPembelianAmount = transactions.reduce((acc: number, curr: any) => acc + curr.totalAmount, 0);
  const totalTagihanAmount = debts.reduce((acc: number, curr: any) => acc + Math.max(0, curr.totalAmount - (curr.downPayment || 0)), 0);
  const totalTransaksiCount = transactions.length;
  const totalRefundAmount = supplierReturns.reduce((acc: number, curr: any) => acc + (curr.totalRefund || 0), 0);

  const animatedTotalPembelian = useCountUp(totalPembelianAmount, { duration: 1200 });
  const animatedTotalTagihan = useCountUp(totalTagihanAmount, { duration: 1400 });
  const animatedTotalTransaksi = useCountUp(totalTransaksiCount, { duration: 1000 });
  const animatedTotalRefund = useCountUp(totalRefundAmount, { duration: 1600 });

  const handleExportExcel = () => {
    if (!displayedData || displayedData.length === 0) {
      toast({ title: "Error", description: "Tidak ada data transaksi untuk diekspor", variant: "destructive" });
      return;
    }

    const excelData = displayedData.map((trx: any) => ({
      "No Faktur": trx.id,
      "Tanggal": new Date(trx.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      "Suplier": trx.supplierName,
      "Jumlah Item": trx.items || 0,
      "Total Pembelian (Rp)": trx.totalAmount || 0,
      "Status": trx.status,
      "Metode Bayar": trx.paymentMethod || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    const colWidths = [
      { wch: 25 }, // No Faktur
      { wch: 15 }, // Tanggal
      { wch: 35 }, // Suplier
      { wch: 15 }, // Jumlah Item
      { wch: 25 }, // Total Pembelian (Rp)
      { wch: 15 }, // Status
      { wch: 20 }, // Metode Bayar
    ];
    worksheet['!cols'] = colWidths;

    const range = XLSX.utils.decode_range(worksheet['!ref'] || "A1:G1");
    
    const alignments = [
      "left",   // 0: No Faktur
      "center", // 1: Tanggal
      "left",   // 2: Suplier
      "center", // 3: Jumlah Item
      "right",  // 4: Total Pembelian
      "center", // 5: Status
      "center"  // 6: Metode Bayar
    ];

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ c: C, r: R });
        if (!worksheet[address]) continue;
        
        let cellStyle: any = {
          alignment: { horizontal: alignments[C] || "left", vertical: "center" }
        };

        if (R === 0) {
          cellStyle.font = { bold: true, color: { rgb: "FFFFFF" } };
          cellStyle.fill = { fgColor: { rgb: "3B82F6" } };
        } else {
          if (worksheet[address].t === 'n') {
            worksheet[address].z = '#,##0';
          }
        }

        worksheet[address].s = cellStyle;
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pembelian");

    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Data_Pembelian_${dateStr}.xlsx`;
    
    try {
      try {
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        
        const fallbackShare = () => {
          const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
          const file = new File([blob], fileName, { type: blob.type });
  
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({
              files: [file],
              title: 'Data Pembelian',
            }).then(() => {
              toast({ title: "Berhasil", description: "File Excel berhasil dibagikan" });
            }).catch((err) => {
              console.error("Error sharing:", err);
              XLSX.writeFile(workbook, fileName);
              toast({ title: "Berhasil", description: "File Excel berhasil diunduh" });
            });
          } else {
            XLSX.writeFile(workbook, fileName);
            toast({ title: "Berhasil", description: "File Excel berhasil diunduh" });
          }
        };

        if ((window as any).Capacitor && (window as any).Capacitor.isNativePlatform()) {
          import('@capacitor/filesystem').then(async ({ Filesystem, Directory }) => {
            try {
              const { Share } = await import('@capacitor/share');
              const uint8Array = new Uint8Array(excelBuffer);
              let binary = '';
              const chunkSize = 8192;
              for (let i = 0; i < uint8Array.length; i += chunkSize) {
                const chunk = uint8Array.subarray(i, i + chunkSize);
                binary += String.fromCharCode.apply(null, chunk as any);
              }
              const base64Data = btoa(binary);
              const result = await Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: Directory.Cache
              });
              await Share.share({
                title: 'Data Pembelian',
                text: 'Berikut adalah data pembelian',
                url: result.uri,
                dialogTitle: 'Bagikan Data'
              });
              toast({ title: "Berhasil", description: "Data siap dibagikan." });
            } catch (err) {
              console.error("Capacitor Share Error:", err);
              fallbackShare();
            }
          }).catch(err => {
            console.error("Capacitor Import Error:", err);
            fallbackShare();
          });
        } else {
          fallbackShare();
        }
      } catch (err) {
        console.error("Share error:", err);
        XLSX.writeFile(workbook, fileName);
        toast({ title: "Berhasil", description: "File Excel berhasil diunduh" });
      }
    } catch (err) {
      console.error("Share error:", err);
      XLSX.writeFile(workbook, fileName);
      toast({ title: "Berhasil", description: "File Excel berhasil diunduh" });
    }
  };

  return (
    <Sidebar>
      <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Truck className="w-6 h-6 text-primary animate-pulse" />
            Pembelian ke Suplier
          </h1>
          <div className="flex flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={handleExportExcel} className="flex-1 sm:flex-initial w-full sm:w-auto text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                setEditingTransactionId(null);
                setFormData({
                  noFaktur: "",
                  tanggal: "",
                  supplierName: "",
                  discount: "",
                  tax: "",
                  totalAmount: "0",
                  paymentType: "Lunas",
                  paymentMethod: "Tunai",
                  dueDate: "",
                  downPayment: ""
                });
                setPurchasedItems([]);
                setIsAddDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Input Pembelian Baru
            </Button>

            {/* Dialog Add Purchase */}
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              if (!open) setEditingTransactionId(null);
              setIsAddDialogOpen(open);
            }}>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto scrollbar-hide">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                      <Truck className="w-5 h-5 text-primary" />
                      {editingTransactionId ? "Edit Pembelian" : "Input Pembelian Baru"}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                      {editingTransactionId ? "Formulir edit pembelian suplier" : "Formulir input pembelian suplier baru"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">

                    {/* General Info */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                      <div className="space-y-2">
                        <Label htmlFor="noFaktur" className="text-sm font-semibold text-slate-600 dark:text-slate-300">No Faktur / Referensi</Label>
                        <Input
                          id="noFaktur"
                          placeholder="INV-XXX"
                          value={formData.noFaktur}
                          onChange={(e) => handleInputChange('noFaktur', e.target.value)}
                          className="bg-white dark:bg-slate-950"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tanggal" className="text-sm font-semibold text-slate-600 dark:text-slate-300">Tanggal</Label>
                        <Popover open={isTanggalCalendarOpen} onOpenChange={setIsTanggalCalendarOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={`w-full justify-start text-left font-normal bg-white dark:bg-slate-950 ${!formData.tanggal ? "text-slate-500" : ""}`}
                            >
                              {formData.tanggal ? new Date(formData.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "Pilih Tanggal"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.tanggal ? new Date(formData.tanggal) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  const offset = date.getTimezoneOffset()
                                  const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000))
                                  handleInputChange('tanggal', adjustedDate.toISOString().split('T')[0])
                                } else {
                                  handleInputChange('tanggal', '')
                                }
                                setIsTanggalCalendarOpen(false);
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="supplier" className="text-sm font-semibold text-slate-600 dark:text-slate-300">Nama Suplier</Label>
                        <Input
                          id="supplier"
                          placeholder="Masukkan Nama Suplier"
                          value={formData.supplierName}
                          onChange={(e) => handleInputChange('supplierName', e.target.value)}
                          className="bg-white dark:bg-slate-950"
                          required
                        />
                      </div>
                    </div>

                    {/* Items Section */}
                    <div className="space-y-4 border rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="font-semibold text-sm">Daftar Barang</h3>
                        <span className="text-[10px] font-medium bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800 w-fit">
                          Masukkan Qty untuk satuan terkecil
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 items-end bg-white p-3 rounded-md border border-slate-200 dark:border-slate-800 dark:bg-slate-950">
                        <div className="space-y-2 w-full sm:flex-[2]">
                          <Label className="text-xs font-semibold text-slate-500">Produk</Label>
                          <Popover open={productOpen} onOpenChange={setProductOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={productOpen}
                                className="w-full justify-between font-normal bg-white dark:bg-slate-900 border-slate-300"
                              >
                                {currentItem.productName ? (
                                  <span className="truncate text-slate-900 dark:text-white font-medium">{currentItem.productName}</span>
                                ) : (
                                  <span className="text-muted-foreground">Pilih/Ketik produk...</span>
                                )}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0" align="start">
                              <Command>
                                <CommandInput
                                  placeholder="Cari atau ketik nama produk..."
                                  value={searchItemText}
                                  onValueChange={setSearchItemText}
                                />
                                <CommandList className="max-h-[200px] overflow-y-auto scrollbar-hide overscroll-contain">
                                  <CommandEmpty className="p-0">
                                    {!searchItemText ? (
                                      <div className="py-6 text-center text-sm text-muted-foreground">
                                        Produk tidak ditemukan.
                                      </div>
                                    ) : (
                                      <div
                                        className="relative flex cursor-default select-none items-center rounded-sm px-2 py-3 text-sm outline-none hover:bg-accent hover:text-accent-foreground m-1"
                                        onClick={() => {
                                          handleCurrentItemChange('productId', 'new');
                                          handleCurrentItemChange('productName', searchItemText);
                                          setProductOpen(false);
                                        }}
                                      >
                                        <Plus className="mr-2 h-4 w-4 text-primary" />
                                        <span className="text-primary font-medium">Tambah "{searchItemText}" (Baru)</span>
                                      </div>
                                    )}
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {products?.map((product: any) => (
                                      <CommandItem
                                        key={product.id}
                                        value={product.name}
                                        onSelect={() => {
                                          handleCurrentItemChange('productId', product.id.toString());
                                          handleCurrentItemChange('productName', product.name);
                                          setProductOpen(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            currentItem.productId === product.id.toString() ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {product.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="flex flex-row gap-3 w-full sm:flex-[2]">
                          <div className="space-y-2 flex-[1.5]">
                            <Label className="text-xs font-semibold text-slate-500 text-center w-full inline-block">Qty</Label>
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="1"
                              className="font-medium text-center"
                              value={formatNumber(currentItem.quantity)}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                handleCurrentItemChange('quantity', val);
                              }}
                            />
                          </div>
                          <div className="space-y-2 flex-[2]">
                            <Label className="text-xs font-semibold text-slate-500">Harga Satuan</Label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-slate-500 font-medium text-sm">Rp</span>
                              </div>
                              <Input
                                type="text"
                                inputMode="numeric"
                                placeholder="0"
                                className="pl-9 font-medium"
                                value={formatNumber(currentItem.price)}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9]/g, '');
                                  handleCurrentItemChange('price', val);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="w-full sm:w-auto">
                          <Button type="button" onClick={handleAddItem} className="w-full sm:w-10 px-0 shadow-sm" size="icon" title="Tambah Barang">
                            <Plus className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>

                      {/* Items List */}
                      {purchasedItems.length > 0 && (
                        <div className="border border-slate-200 dark:border-slate-700 rounded-md mt-4 overflow-hidden bg-white shadow-sm">
                          <Table>
                            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                              <TableRow>
                                <TableHead className="font-semibold">Produk</TableHead>
                                <TableHead className="text-center font-semibold">Qty</TableHead>
                                <TableHead className="text-right font-semibold">Harga</TableHead>
                                <TableHead className="text-right font-semibold">Subtotal</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {purchasedItems.map((item) => (
                                <TableRow key={item.id} className="hover:bg-slate-50/50">
                                  <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                                    {item.productName}
                                    {item.productId === 'new' && <Badge variant="outline" className="ml-2 text-[10px] h-5 bg-blue-50 text-blue-600 border-blue-200">Baru</Badge>}
                                  </TableCell>
                                  <TableCell className="text-center font-medium">{formatNumber(item.quantity)}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                  <TableCell className="text-right font-bold text-slate-900 dark:text-white">{formatCurrency(item.price * item.quantity)}</TableCell>
                                  <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)} className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>

                    {/* Payment Info */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">

                      {/* Optional Additions */}
                      <div className="col-span-2 flex flex-col sm:flex-row gap-4">
                        <div className="space-y-2 flex-1 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                          <Label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Diskon Pembelian (Opsional)</Label>
                          <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-slate-500 font-medium text-sm">Rp</span>
                            </div>
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="0"
                              className="pl-9"
                              value={formatNumber(formData.discount)}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                handleDiscountChange(val);
                              }}
                            />
                          </div>
                        </div>
                        <div className="space-y-2 flex-1 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                          <Label className="text-sm font-semibold text-slate-600 dark:text-slate-300">PPN / Pajak (Opsional)</Label>
                          <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-slate-500 font-medium text-sm">Rp</span>
                            </div>
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="0"
                              className="pl-9"
                              value={formatNumber(formData.tax)}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                handleTaxChange(val);
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                        {/* Kolom Kiri */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Tipe Pembayaran</Label>
                            <Select
                              value={formData.paymentType}
                              onValueChange={(val) => handleInputChange('paymentType', val)}
                            >
                              <SelectTrigger className="bg-white dark:bg-slate-950">
                                <SelectValue placeholder="Pilih Tipe" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Lunas">Lunas</SelectItem>
                                <SelectItem value="Cicilan">Cicilan</SelectItem>
                                <SelectItem value="Tempo Penuh">Tempo Penuh</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {formData.paymentType === "Cicilan" && (
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Nominal DP / Cicilan</Label>
                              <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <span className="text-slate-500 font-medium text-sm">Rp</span>
                                </div>
                                <Input
                                  type="text"
                                  inputMode="numeric"
                                  placeholder="0"
                                  className="pl-9 bg-white dark:bg-slate-950"
                                  value={formatNumber(formData.downPayment)}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    handleInputChange('downPayment', val);
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Kolom Kanan */}
                        <div className="space-y-4">
                          {formData.paymentType !== "Lunas" && (
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Tanggal Jatuh Tempo</Label>
                              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={`w-full justify-between text-left font-medium h-10 px-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 ${!formData.dueDate ? "text-slate-400" : "text-slate-900 dark:text-slate-100"}`}
                                  >
                                    {formData.dueDate ? (
                                      new Date(formData.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                    ) : (
                                      <span>Pilih Tanggal</span>
                                    )}
                                    <CalendarRange className="w-4 h-4 text-slate-400" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={formData.dueDate ? new Date(formData.dueDate) : undefined}
                                    onSelect={(date) => {
                                      if (date) {
                                        const year = date.getFullYear();
                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                        const day = String(date.getDate()).padStart(2, '0');
                                        handleInputChange('dueDate', `${year}-${month}-${day}`);
                                      } else {
                                        handleInputChange('dueDate', "");
                                      }
                                      setIsCalendarOpen(false);
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Metode Pembayaran</Label>
                            <Select
                              value={formData.paymentMethod}
                              onValueChange={(val) => handleInputChange('paymentMethod', val)}
                            >
                              <SelectTrigger className="bg-white dark:bg-slate-950">
                                <SelectValue placeholder="Pilih Metode" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Tunai">Uang Tunai</SelectItem>
                                <SelectItem value="Transfer Bank">Transfer Bank</SelectItem>
                                <SelectItem value="QRIS">QRIS</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 col-span-2 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                        <Label htmlFor="totalAmount" className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total Nominal Faktur</Label>
                        <div className="relative mt-1">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-slate-500 font-bold text-lg">Rp</span>
                          </div>
                          <Input
                            id="totalAmount"
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            value={formatNumber(formData.totalAmount)}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              handleInputChange('totalAmount', val);
                            }}
                            className="font-bold text-xl pl-12 h-12 border-slate-300 shadow-sm"
                            required
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-2 flex items-center">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></span>
                          Total otomatis terhitung dari daftar barang
                        </p>
                        {formData.paymentType !== 'Lunas' && (
                          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                            {formData.paymentType === 'Cicilan' && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-slate-600 dark:text-slate-400">Cicilan</span>
                                <span className="font-bold text-blue-600 dark:text-blue-400">
                                  {formatCurrency(formData.downPayment ? Number(formData.downPayment.toString().replace(/[^0-9]/g, '')) : 0)}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-medium text-slate-600 dark:text-slate-400">Sisa Tagihan (Hutang)</span>
                              <span className="font-bold text-red-500 text-lg">
                                {formatCurrency(
                                  Math.max(0, Number(formData.totalAmount.toString().replace(/[^0-9]/g, '')) - (formData.paymentType === 'Cicilan' && formData.downPayment ? Number(formData.downPayment.toString().replace(/[^0-9]/g, '')) : 0))
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button type="submit">
                      Simpan Data
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs Switcher */}
        <div className="px-4 sm:px-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-between sm:justify-start sm:gap-6 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-3 text-sm font-semibold border-b-2 transition-all relative flex items-center justify-center gap-2 flex-1 sm:flex-none ${activeTab === 'transactions'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <FileText className="w-5 h-5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Riwayat Pembelian</span>
          </button>
          <button
            onClick={() => setActiveTab('tagihan')}
            className={`py-3 text-sm font-semibold border-b-2 transition-all relative flex items-center justify-center gap-2 flex-1 sm:flex-none ${activeTab === 'tagihan'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <CreditCard className="w-5 h-5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Tagihan</span>
            {debts.filter((d: any) => d.status !== 'Selesai').length > 0 && (
              <span className="hidden lg:flex bg-red-500 text-white items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-[10px] font-bold">
                {debts.filter((d: any) => d.status !== 'Selesai').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('returns')}
            className={`py-3 text-sm font-semibold border-b-2 transition-all relative flex items-center justify-center gap-2 flex-1 sm:flex-none ${activeTab === 'returns'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <RefreshCcw className="w-5 h-5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Retur Barang</span>
            {sortedReturns.filter((r: any) => r.status !== 'Selesai').length > 0 && (
              <span className="hidden lg:flex bg-primary text-primary-foreground items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-[10px] font-bold">
                {sortedReturns.filter((r: any) => r.status !== 'Selesai').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('transfer')}
            className={`py-3 text-sm font-semibold border-b-2 transition-all relative flex items-center justify-center gap-2 flex-1 sm:flex-none ${activeTab === 'transfer'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <ArrowRightLeft className="w-5 h-5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Transfer Stok</span>
          </button>
          <button
            onClick={() => setActiveTab('mutations')}
            className={`py-3 text-sm font-semibold border-b-2 transition-all relative flex items-center justify-center gap-2 flex-1 sm:flex-none ${activeTab === 'mutations'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <Activity className="w-5 h-5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Mutasi</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 pb-24 md:pb-6">
          <div className="flex flex-col gap-4 max-w-full">

            {activeTab === 'transfer' && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Daftar Faktur Pembelian (Siap Transfer)</h3>
                    <p className="hidden md:block text-sm text-slate-500">Pilih faktur untuk memasukkan barang yang dibeli ke dalam stok gudang utama.</p>
                  </div>
                </div>
                {/* Mobile View */}
                <div className="md:hidden flex flex-col gap-3 p-4 mb-4">
                  {transferData.length > 0 ? (
                    transferData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((trx) => (
                      <div 
                        key={trx.id} 
                        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm relative cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedTransaction(trx)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="inline-block font-mono text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              {trx.id}
                            </p>
                            <p className="font-semibold text-slate-900 dark:text-white mt-1">
                              {trx.supplierName}
                            </p>
                          </div>
                          <Badge className={trx.isTransferred ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-yellow-500 hover:bg-yellow-600 text-white"}>
                            {trx.isTransferred ? "Selesai" : "Menunggu"}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {trx.purchasedItems.length} <span className="font-normal text-slate-500">Produk</span>
                          </p>
                        </div>
                        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleEditTransaction(trx); }} className="h-9 px-3 text-slate-500">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteTransaction(trx.id); }} className="h-9 px-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <FileText className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-base font-medium text-slate-900 dark:text-white">Tidak Ada Data</p>
                      <p className="text-sm mt-1 text-center px-4">Belum ada faktur pembelian dengan detail barang.</p>
                    </div>
                  )}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-slate-200 dark:border-b-slate-700 bg-slate-50/50 dark:bg-slate-800/20">
                        <TableHead className="font-semibold whitespace-nowrap">No Faktur</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">Suplier</TableHead>
                        <TableHead className="font-semibold text-center whitespace-nowrap">Jumlah Barang</TableHead>
                        <TableHead className="font-semibold text-center whitespace-nowrap">Status Transfer</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transferData.length > 0 ? (
                        transferData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((trx) => (
                          <TableRow key={trx.id} onClick={() => setSelectedTransaction(trx)} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b-slate-100 dark:border-b-slate-800 cursor-pointer">
                            <TableCell className="font-medium">{trx.id}</TableCell>
                            <TableCell>{trx.supplierName}</TableCell>
                            <TableCell className="text-center">{trx.purchasedItems.length} Produk</TableCell>
                            <TableCell className="text-center">
                              {trx.isTransferred ? (
                                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Selesai</Badge>
                              ) : (
                                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Menunggu</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">

                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEditTransaction(trx); }} className="h-8 w-8 text-slate-500 hover:text-primary">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteTransaction(trx.id); }} className="h-8 w-8 text-red-500 hover:text-red-600 dark:hover:text-red-400">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                            Belum ada faktur pembelian dengan detail barang.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                  <PaginationControls dataLength={transferData.length} itemName="faktur" />
                </div>
              </div>
            )}

            {activeTab === 'returns' && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Riwayat Retur Suplier</h3>
                    <p className="hidden lg:block text-sm text-slate-500">Daftar pengembalian barang ke suplier.</p>
                  </div>
                  <Button onClick={() => setIsReturnDialogOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" /> Buat Retur Baru
                  </Button>
                </div>
                {/* Mobile View */}
                <div className="md:hidden flex flex-col gap-3 p-4 mb-4">
                  {supplierReturns.length > 0 ? (
                    [...supplierReturns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((ret: any) => (
                      <div 
                        key={ret.id} 
                        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm relative cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedReturn(ret)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="inline-block font-mono text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              {ret.id}
                            </p>
                            <p className="font-semibold text-slate-900 dark:text-white mt-1">
                              {ret.supplierName}
                            </p>
                          </div>
                          {ret.status === 'Selesai' ? (
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Selesai</Badge>
                          ) : (
                            <Badge className="bg-orange-500 hover:bg-orange-600 text-white">Diproses</Badge>
                          )}
                        </div>
                        <div className="flex justify-between text-sm mb-3">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Faktur Beli</p>
                            <p className="font-mono text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-1.5 py-0.5 rounded inline-block border border-slate-100 dark:border-slate-800">
                              {ret.invoiceId}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Tanggal</p>
                            <p className="font-medium text-slate-700 dark:text-slate-300">
                              {new Date(ret.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500 mb-1">Total Refund</p>
                            <p className="font-bold text-orange-600 dark:text-orange-400 text-base">{formatCurrency(ret.totalRefund)}</p>
                          </div>
                        </div>
                        <div className="flex justify-end items-center gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                          {(!ret.status || ret.status !== 'Selesai') && (
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleCompleteReturn(ret.id); }} className="h-8 text-xs px-3 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50">
                              <Check className="w-3.5 h-3.5 mr-1.5" /> Selesai
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleEditReturn(ret); }} className="h-8 text-xs px-3">
                            <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteReturn(ret.id); }} className="h-8 text-xs px-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Hapus
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <FileText className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-base font-medium text-slate-900 dark:text-white">Tidak Ada Data</p>
                      <p className="text-sm mt-1 text-center px-4">Belum ada riwayat retur suplier.</p>
                    </div>
                  )}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-slate-200 dark:border-b-slate-700 bg-slate-50/50 dark:bg-slate-800/20">
                        <TableHead className="font-semibold whitespace-nowrap">Tanggal</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">ID Retur</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">No Faktur Beli</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">Suplier</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Total Refund</TableHead>
                        <TableHead className="font-semibold text-center whitespace-nowrap">Status</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplierReturns.length > 0 ? (
                        [...supplierReturns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((ret: any) => (
                          <TableRow key={ret.id} onClick={() => setSelectedReturn(ret)} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b-slate-100 dark:border-b-slate-800 cursor-pointer">
                            <TableCell className="font-medium whitespace-nowrap">
                              {new Date(ret.date).toLocaleDateString('id-ID', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </TableCell>
                            <TableCell className="font-medium text-primary">{ret.id}</TableCell>
                            <TableCell>{ret.invoiceId}</TableCell>
                            <TableCell>{ret.supplierName}</TableCell>
                            <TableCell className="text-right font-bold text-orange-600 dark:text-orange-400">{formatCurrency(ret.totalRefund)}</TableCell>
                            <TableCell className="text-center">
                              {ret.status === 'Selesai' ? (
                                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Selesai</Badge>
                              ) : (
                                <Badge className="bg-orange-500 hover:bg-orange-600 text-white">Diproses</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                {(!ret.status || ret.status !== 'Selesai') && (
                                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleCompleteReturn(ret.id); }} className="h-8 w-8 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" title="Tandai Selesai">
                                    <div className="bg-emerald-500 text-white rounded-full p-0.5 flex items-center justify-center">
                                      <Check className="w-4 h-4" strokeWidth={2.5} />
                                    </div>
                                  </Button>
                                )}
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEditReturn(ret); }} className="h-8 w-8 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteReturn(ret.id); }} className="h-8 w-8 text-red-500 hover:text-red-600 dark:hover:text-red-400">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                            Belum ada riwayat retur suplier.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                  <PaginationControls dataLength={supplierReturns.length} itemName="retur" />
                </div>
              </div>
            )}

            {activeTab === 'mutations' && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Buku Besar / Mutasi Suplier</h3>
                    <p className="hidden md:block text-sm text-slate-500">Log kronologis semua aktivitas pembelian dan retur.</p>
                  </div>
                </div>
                {/* Mobile View */}
                <div className="md:hidden flex flex-col gap-3 p-4 mb-4">
                  {mutationsData.length > 0 ? (
                    mutationsData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((mut: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm relative hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="inline-block font-mono text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              {mut.referenceId}
                            </p>
                            <p className="font-semibold text-slate-900 dark:text-white mt-1">
                              {mut.supplierName}
                            </p>
                          </div>
                          <Badge className={mut.type === 'Pembelian' ? 'bg-blue-500 hover:bg-blue-600 text-white' : mut.type === 'Transfer Stok' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}>
                            {mut.type}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm mb-3">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Status</p>
                            <Badge variant="outline" className={mut.status === 'Lunas' || mut.status === 'Selesai' ? 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50' : (mut.status === 'Cicilan' ? 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50' : (mut.status === 'Tempo Penuh' ? 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50' : 'text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/50'))}>
                              {mut.status}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Tanggal</p>
                            <p className="font-medium text-slate-700 dark:text-slate-300">
                              {new Date(mut.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500 mb-1">Nominal</p>
                            <p className={`font-bold text-base ${mut.type === 'Pembelian' ? 'text-blue-600 dark:text-blue-400' : mut.type === 'Transfer Stok' ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'}`}>
                              {mut.type === 'Pembelian' ? '+' : mut.type === 'Transfer Stok' ? '' : '-'}{formatCurrency(mut.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <FileText className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-base font-medium text-slate-900 dark:text-white">Tidak Ada Data</p>
                      <p className="text-sm mt-1 text-center px-4">Belum ada riwayat mutasi aktivitas suplier.</p>
                    </div>
                  )}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-slate-200 dark:border-b-slate-700 bg-slate-50/50 dark:bg-slate-800/20">
                        <TableHead className="font-semibold whitespace-nowrap">Tanggal</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">Tipe</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">ID Referensi</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">Suplier</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Nominal (Rp)</TableHead>
                        <TableHead className="font-semibold text-center whitespace-nowrap">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mutationsData.length > 0 ? (
                        mutationsData.map((mut: any, idx: number) => (
                          <TableRow key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b-slate-100 dark:border-b-slate-800">
                            <TableCell className="font-medium whitespace-nowrap">
                              {new Date(mut.date).toLocaleDateString('id-ID', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </TableCell>
                            <TableCell>
                              <Badge className={mut.type === 'Pembelian' ? 'bg-blue-500 hover:bg-blue-600 text-white' : mut.type === 'Transfer Stok' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}>
                                {mut.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-slate-600 dark:text-slate-400">{mut.referenceId}</TableCell>
                            <TableCell>{mut.supplierName}</TableCell>
                            <TableCell className={`text-right font-bold ${mut.type === 'Pembelian' ? 'text-blue-600 dark:text-blue-400' : mut.type === 'Transfer Stok' ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'}`}>
                              {mut.type === 'Pembelian' ? '+' : mut.type === 'Transfer Stok' ? '' : '-'}{formatCurrency(mut.amount)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className={mut.status === 'Lunas' || mut.status === 'Selesai' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : (mut.status === 'Cicilan' ? 'bg-blue-500 hover:bg-blue-600 text-white' : (mut.status === 'Tempo Penuh' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'))}>
                                {mut.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                            Belum ada riwayat mutasi aktivitas suplier.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                  <PaginationControls dataLength={mutationsData.length} itemName="mutasi" />
                </div>
              </div>
            )}

            {activeTab === 'tagihan' && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Daftar Tagihan Suplier</h3>
                    <p className="hidden lg:block text-sm text-slate-500">Faktur pembelian yang belum lunas (berstatus Tempo/Cicilan).</p>
                  </div>
                </div>
                {/* Mobile View */}
                <div className="md:hidden space-y-4 p-4 mb-4">
                  {debts.length > 0 ? (
                    debts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((trx: any) => {
                      const sisaTagihan = trx.status === 'Selesai' || trx.status === 'Lunas' ? 0 : Math.max(0, trx.totalAmount - (trx.downPayment || 0));
                      const isOverdue = trx.dueDate && new Date(trx.dueDate) < new Date();
                      return (
                        <div 
                          key={trx.id} 
                          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm relative cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedTransaction(trx)}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="inline-block font-mono text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                {trx.id}
                              </p>
                              <p className="font-semibold text-slate-900 dark:text-white mt-1">
                                {trx.supplierName}
                              </p>
                            </div>
                            <Badge className={trx.status === 'Selesai' ? "bg-emerald-500 hover:bg-emerald-600 text-white" : trx.status === 'Cicilan' ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}>
                              {trx.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-sm mb-3">
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Total Faktur</p>
                              <p className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(trx.totalAmount)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-500 mb-1">Jatuh Tempo</p>
                              {trx.dueDate ? (
                                <p className={isOverdue ? "font-semibold text-red-600 dark:text-red-400" : "font-medium text-slate-700 dark:text-slate-300"}>
                                  {new Date(trx.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              ) : (
                                <p className="font-medium text-slate-400">-</p>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                            <div>
                              <p className="text-xs text-slate-500 mb-0.5">Sisa Tagihan</p>
                              <p className="font-bold text-red-600 dark:text-red-400 text-base">{formatCurrency(sisaTagihan)}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="icon" onClick={(e) => { e.stopPropagation(); handleEditTransaction(trx); }} className="h-8 w-8 text-slate-500 hover:text-primary">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteTransaction(trx.id); }} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handlePayDebt(trx); }}
                                className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs border-0 shadow-sm shadow-emerald-600/20"
                              >
                                <Check className="w-3.5 h-3.5 mr-1" /> Lunasi
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <FileText className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-base font-medium text-slate-900 dark:text-white">Tidak Ada Tagihan</p>
                      <p className="text-sm mt-1 text-center px-4">Tidak ada tagihan yang belum lunas.</p>
                    </div>
                  )}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-slate-200 dark:border-b-slate-700 bg-slate-50/50 dark:bg-slate-800/20">
                        <TableHead className="font-semibold whitespace-nowrap">No Faktur</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">Suplier</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">Jatuh Tempo</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Total Faktur</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Sisa Tagihan</TableHead>
                        <TableHead className="font-semibold text-center whitespace-nowrap">Status</TableHead>
                        <TableHead className="font-semibold text-right whitespace-nowrap">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {debts.length > 0 ? (
                        debts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((trx: any) => {
                          const sisaTagihan = trx.status === 'Selesai' || trx.status === 'Lunas' ? 0 : Math.max(0, trx.totalAmount - (trx.downPayment || 0));
                          const isOverdue = trx.dueDate && new Date(trx.dueDate) < new Date();
                          return (
                            <TableRow key={trx.id} onClick={() => setSelectedTransaction(trx)} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b-slate-100 dark:border-b-slate-800 cursor-pointer">
                              <TableCell className="font-medium text-primary">{trx.id}</TableCell>
                              <TableCell>{trx.supplierName}</TableCell>
                              <TableCell>
                                {trx.dueDate ? (
                                  <span className={isOverdue ? "text-red-600 font-semibold" : ""}>
                                    {new Date(trx.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right text-slate-500">{formatCurrency(trx.totalAmount)}</TableCell>
                              <TableCell className="text-right font-bold text-red-600 dark:text-red-400">{formatCurrency(sisaTagihan)}</TableCell>
                              <TableCell className="text-center">
                                <Badge className={trx.status === 'Selesai' ? "bg-emerald-500 hover:bg-emerald-600 text-white" : trx.status === 'Cicilan' ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}>
                                  {trx.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => { e.stopPropagation(); handlePayDebt(trx); }}
                                    className="h-8 w-8 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                    title="Lunasi"
                                  >
                                    <div className="bg-emerald-500 text-white rounded-full p-0.5 flex items-center justify-center">
                                      <Check className="w-4 h-4" strokeWidth={2.5} />
                                    </div>
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEditTransaction(trx); }} className="h-8 w-8 text-slate-500 hover:text-primary" title="Edit Tagihan">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteTransaction(trx.id); }} className="h-8 w-8 text-red-500 hover:text-red-600 dark:hover:text-red-400" title="Hapus Tagihan">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                            Tidak ada tagihan yang belum lunas.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                  <PaginationControls dataLength={debts.length} itemName="tagihan" />
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 items-stretch">
                  <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg h-full">
                    <div className="p-4 sm:p-5 h-full flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-blue-100 text-xs sm:text-sm font-medium">Total Pembelian</p>
                          <p className="text-lg sm:text-lg md:text-xl font-bold text-white leading-tight mt-1 truncate">
                            {formatCurrency(animatedTotalPembelian.value)}
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                          <Truck className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <p className="text-xs mt-3 text-blue-200">Akumulasi Total Semua Pembelian</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 border-0 shadow-lg h-full">
                    <div className="p-4 sm:p-5 h-full flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-rose-100 text-xs sm:text-sm font-medium">Total Tagihan</p>
                          <p className="text-lg sm:text-lg md:text-xl font-bold text-white leading-tight mt-1 truncate">
                            {formatCurrency(animatedTotalTagihan.value)}
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <p className="text-xs mt-3 text-rose-200">Akumulasi Total Semua Tagihan</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 shadow-lg h-full">
                    <div className="p-4 sm:p-5 h-full flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-emerald-100 text-xs sm:text-sm font-medium">Total Transaksi</p>
                          <p className="text-lg sm:text-lg md:text-xl font-bold text-white leading-tight mt-1 truncate">
                            {animatedTotalTransaksi.value} <span className="text-sm font-normal text-emerald-200">faktur</span>
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <p className="text-xs mt-3 text-emerald-200">Akumulasi Total Semua Transaksi</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 border-0 shadow-lg h-full">
                    <div className="p-4 sm:p-5 h-full flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-amber-100 text-xs sm:text-sm font-medium">Total Refund</p>
                          <p className="text-lg sm:text-lg md:text-xl font-bold text-white leading-tight mt-1 truncate">
                            {formatCurrency(animatedTotalRefund.value)}
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                          <RefreshCcw className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <p className="text-xs mt-3 text-amber-200">Akumulasi Nilai Semua Retur</p>
                    </div>
                  </div>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Cari suplier atau no faktur..."
                      className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 items-center shrink-0">
                    <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="relative bg-white dark:bg-slate-800 dark:border-slate-700 shrink-0 h-9 px-3 sm:px-4 border flex items-center justify-center gap-2 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <SlidersHorizontal className="w-4 h-4 text-primary" />
                          <span className="font-medium text-xs sm:text-sm">Filter</span>
                          {(statusFilter !== "all" || startDate !== "" || endDate !== "") && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full" />
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-[340px] max-w-[95vw] p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2 font-semibold text-sm mb-4 border-b pb-2 text-slate-800 dark:text-slate-200">
                          <SlidersHorizontal className="w-4 h-4 text-primary" />
                          Filter Pembelian
                        </div>

                        <div className="space-y-4">
                          {/* Date Filters */}
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-500">Rentang Tanggal</Label>
                            <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                              <div className="relative w-full h-9">
                                <Input
                                  type="text"
                                  placeholder="Mulai"
                                  value={tempStartDate ? tempStartDate.split('-').reverse().join('-') : ""}
                                  readOnly
                                  className="absolute inset-0 h-9 w-full rounded-md text-sm text-center bg-transparent focus:ring-0 cursor-pointer"
                                />
                                <input
                                  type="date"
                                  value={tempStartDate}
                                  onChange={(e) => setTempStartDate(e.target.value)}
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
                                  placeholder="Akhir"
                                  value={tempEndDate ? tempEndDate.split('-').reverse().join('-') : ""}
                                  readOnly
                                  className="absolute inset-0 h-9 w-full rounded-md text-sm text-center bg-transparent focus:ring-0 cursor-pointer"
                                />
                                <input
                                  type="date"
                                  value={tempEndDate}
                                  onChange={(e) => setTempEndDate(e.target.value)}
                                  onClick={(e: any) => {
                                    try { e.target.showPicker?.(); } catch (err) { }
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  title="Tanggal Akhir"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Status Filter */}
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-500">Status</Label>
                            <Select value={tempStatusFilter} onValueChange={setTempStatusFilter}>
                              <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="Semua Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="Selesai">Selesai</SelectItem>
                                <SelectItem value="Cicilan">Cicilan</SelectItem>
                                <SelectItem value="Tempo Penuh">Tempo Penuh</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end mt-6">
                          <Button variant="outline" onClick={handleResetFilter} className="h-9 text-xs w-full">
                            Atur Ulang
                          </Button>
                          <Button onClick={handleApplyFilter} className="h-9 px-4 text-xs w-full">
                            Terapkan
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Mobile View */}
                <div className="md:hidden flex flex-col gap-3 mb-4">
                  {displayedData.length > 0 ? (
                    displayedData.map((trx) => (
                      <div 
                        key={trx.id} 
                        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm relative cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedTransaction(trx)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="inline-block font-mono text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              {trx.id}
                            </p>
                            <p className="font-semibold text-slate-900 dark:text-white mt-1">
                              {trx.supplierName}
                            </p>
                          </div>
                          <Badge className={trx.status === 'Lunas' || trx.status === 'Selesai' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : (trx.status === 'Cicilan' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white')}>
                            {trx.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm mb-3">
                          <div>
                            <p className="text-xs text-slate-500">Waktu</p>
                            <p className="font-medium text-slate-700 dark:text-slate-300">
                              {formatWaktu(trx.date)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Total Pembelian</p>
                            <p className="font-bold text-slate-900 dark:text-slate-100 text-base">{formatCurrency(trx.totalAmount)}</p>
                          </div>
                        </div>
                        <div className="flex justify-end items-center gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleEditTransaction(trx); }} className="h-8 text-xs px-3">
                            <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteTransaction(trx.id); }} className="h-8 text-xs px-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Hapus
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <FileText className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-base font-medium text-slate-900 dark:text-white">Tidak Ada Riwayat</p>
                      <p className="text-sm mt-1 text-center px-4">Belum ada riwayat pembelian atau data tidak ditemukan.</p>
                    </div>
                  )}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm mb-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                        <TableRow className="border-b-slate-200 dark:border-b-slate-700">
                          <TableHead className="font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Waktu</TableHead>
                          <TableHead className="font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">No Faktur</TableHead>
                          <TableHead className="font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Suplier</TableHead>
                          <TableHead className="font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Total Pembelian</TableHead>
                          <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-center whitespace-nowrap">Status</TableHead>
                          <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-right whitespace-nowrap">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayedData.map((trx) => (
                          <TableRow
                            key={trx.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b-slate-100 dark:border-b-slate-800 cursor-pointer"
                            onClick={() => setSelectedTransaction(trx)}
                          >
                            <TableCell className="whitespace-nowrap">
                              {formatWaktu(trx.date)}
                            </TableCell>
                            <TableCell className="font-medium whitespace-nowrap">{trx.id}</TableCell>
                            <TableCell className="min-w-[150px]">
                              <div className="font-medium">{trx.supplierName}</div>
                            </TableCell>
                            <TableCell className="font-medium whitespace-nowrap">{formatCurrency(trx.totalAmount)}</TableCell>
                            <TableCell className="text-center whitespace-nowrap">
                              <Badge
                                className={trx.status === 'Lunas' || trx.status === 'Selesai' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : (trx.status === 'Cicilan' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white')}
                              >
                                {trx.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEditTransaction(trx); }} className="h-8 w-8 sm:h-9 sm:w-9 text-slate-500 hover:text-primary">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteTransaction(trx.id); }} className="h-8 w-8 sm:h-9 sm:w-9 text-red-500 hover:text-red-600 dark:hover:text-red-400">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {displayedData.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                              Belum ada riwayat pembelian atau tidak ditemukan.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                <PaginationControls dataLength={displayedData.length} itemName="transaksi" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Detail Dialog */}
      <Dialog open={!!selectedTransaction} onOpenChange={(open) => !open && setSelectedTransaction(null)}>
        <DialogContent hideCloseIcon className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto scrollbar-hide">
          {selectedTransaction && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Detail Faktur Pembelian</span>
                  <Badge
                    variant={selectedTransaction.status === 'Lunas' ? 'default' : (selectedTransaction.status === 'Cicilan' ? 'secondary' : 'destructive')}
                    className={selectedTransaction.status === 'Lunas' ? 'bg-emerald-500 hover:bg-emerald-600 text-white absolute right-6 top-6' : (selectedTransaction.status === 'Cicilan' ? 'bg-blue-500 hover:bg-blue-600 text-white absolute right-6 top-6' : 'absolute right-6 top-6')}
                  >
                    {selectedTransaction.status}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                {/* General Info */}
                <div className="flex justify-between gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">No Faktur</p>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{selectedTransaction.id}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedTransaction.id);
                            toast({ title: "Disalin", description: "Nomor faktur berhasil disalin" });
                          }}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Nama Suplier</p>
                      <p className="font-semibold">{selectedTransaction.supplierName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Metode Pembayaran</p>
                      <p className="font-semibold">{selectedTransaction.paymentMethod}</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-right">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Tanggal Pembelian</p>
                      <p className="font-semibold">{new Date(selectedTransaction.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    {selectedTransaction.status !== 'Lunas' && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Tanggal Jatuh Tempo</p>
                        <p className="font-semibold text-red-600 dark:text-red-400">
                          {selectedTransaction.dueDate
                            ? new Date(selectedTransaction.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                            : "Belum ditentukan"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                      <TableRow>
                        <TableHead>Produk</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Harga</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTransaction.purchasedItems?.map((item: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell className="text-center">{formatNumber(item.quantity)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(item.quantity * item.price)}</TableCell>
                        </TableRow>
                      ))}
                      {(!selectedTransaction.purchasedItems || selectedTransaction.purchasedItems.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-slate-500">
                            Detail barang tidak tersedia (Data Dummy Lama)
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Totals */}
                <div className="flex flex-col gap-2 w-full max-w-sm ml-auto bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal Barang :</span>
                    <span className="font-medium">
                      {formatCurrency(
                        selectedTransaction.purchasedItems?.length > 0
                          ? selectedTransaction.purchasedItems.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0)
                          : (selectedTransaction.totalAmount + (selectedTransaction.discount || 0) - (selectedTransaction.tax || 0))
                      )}
                    </span>
                  </div>

                  {(selectedTransaction.discount > 0) && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span>Diskon :</span>
                      <span>-{formatCurrency(selectedTransaction.discount)}</span>
                    </div>
                  )}

                  {(selectedTransaction.tax > 0) && (
                    <div className="flex justify-between text-sm text-red-600 dark:text-red-400">
                      <span>PPN/Pajak :</span>
                      <span>+{formatCurrency(selectedTransaction.tax)}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Total :</span>
                    <span className="text-primary">{formatCurrency(selectedTransaction.totalAmount)}</span>
                  </div>
                  {selectedTransaction.status === 'Cicilan' && selectedTransaction.downPayment > 0 && (
                    <div className="flex justify-between text-sm text-blue-600 dark:blue-400">
                      <span>Cicilan (Dibayar) :</span>
                      <span>{formatCurrency(selectedTransaction.downPayment)}</span>
                    </div>
                  )}
                  {selectedTransaction.status !== 'Lunas' && selectedTransaction.status !== 'Selesai' && (
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span>Sisa Tagihan :</span>
                      <span className="text-red-500">{formatCurrency(Math.max(0, selectedTransaction.totalAmount - (selectedTransaction.status === 'Cicilan' ? (selectedTransaction.downPayment || 0) : 0)))}</span>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="mt-6">
                <div className="flex w-full justify-between sm:justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedTransaction(null)}>Tutup</Button>
                  <div className="flex gap-2">
                    {activeTab === 'transfer' ? (
                      <Button 
                        className="gap-2" 
                        variant={selectedTransaction.isTransferred ? "outline" : "default"}
                        onClick={() => {
                          setTransferTransaction(selectedTransaction);
                          setSelectedTransaction(null);
                        }}
                      >
                        {selectedTransaction.isTransferred ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-500" /> Lihat Transfer
                          </>
                        ) : (
                          <>
                            <ArrowRightLeft className="w-4 h-4" /> Proses Transfer
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button className="gap-2" onClick={() => handlePrintPurchaseInvoice(selectedTransaction)}>
                        <FileText className="w-4 h-4" /> Cetak Faktur
                      </Button>
                    )}
                  </div>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      {/* Stock Transfer Dialog */}
      <Dialog open={!!transferTransaction} onOpenChange={(open) => !open && setTransferTransaction(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto scrollbar-hide">
          {transferTransaction && (
            <>
              <DialogHeader>
                <DialogTitle>Transfer Stok Gudang</DialogTitle>
                <DialogDescription>
                  Review barang dari faktur <span className="font-semibold text-slate-800 dark:text-slate-200">{transferTransaction.id}</span> sebelum ditambahkan ke stok utama.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-md text-sm mb-4 border border-blue-100 dark:border-blue-800/50 flex items-start gap-2">
                  <ArrowRightLeft className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>Barang di bawah ini akan di tambahkan ke stok gudang secara otomatis.</p>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                      <TableRow>
                        <TableHead>Produk (SKU)</TableHead>
                        <TableHead className="text-center">Kuantitas Masuk</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transferTransaction.purchasedItems?.map((item: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">
                            {item.productName}
                            {item.productId === 'new' && <Badge variant="outline" className="ml-2 text-[10px] h-5">Produk Baru</Badge>}
                          </TableCell>
                          <TableCell className="text-center font-bold text-lg text-emerald-600 dark:text-emerald-400">
                            +{formatNumber(item.quantity)}
                          </TableCell>
                          <TableCell className="text-center">
                            {transferTransaction.isTransferred ? (
                              <span className="text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 text-xs font-medium"><Check className="w-3 h-3" /> Masuk Gudang</span>
                            ) : (
                              <span className="text-slate-500 text-xs font-medium">Siap ditransfer</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setTransferTransaction(null)}>Tutup</Button>
                {!transferTransaction.isTransferred && (
                  <Button onClick={handleExecuteTransfer} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                    <Check className="w-4 h-4" /> Konfirmasi Transfer Stok
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      {/* Return Dialog */}
      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle>Buat Retur Suplier</DialogTitle>
            <DialogDescription>
              Cari faktur pembelian lalu tentukan barang yang ingin dikembalikan ke suplier.
            </DialogDescription>
          </DialogHeader>

          {!returnTransaction ? (
            <div className="py-6 space-y-4">
              <form onSubmit={handleSearchReturnInvoice} className="flex gap-2">
                <Input
                  placeholder="Masukkan No Faktur Pembelian (contoh: INV-123456)..."
                  value={returnSearchInvoice}
                  onChange={e => setReturnSearchInvoice(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">Cari</Button>
              </form>
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 text-center text-slate-500 flex flex-col items-center justify-center">
                <Search className="w-8 h-8 text-slate-300 mb-2" />
                <p>Silakan cari faktur pembelian terlebih dahulu</p>
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-xs text-slate-500">No Faktur</p>
                  <p className="font-semibold">{returnTransaction.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Suplier</p>
                  <p className="font-semibold">{returnTransaction.supplierName}</p>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                    <TableRow>
                      <TableHead>Produk</TableHead>
                      <TableHead className="text-center w-[120px]">Qty Beli</TableHead>
                      <TableHead className="text-center w-[150px]">Qty Retur</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {returnTransaction.purchasedItems?.map((item: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {item.productName}
                          <div className="text-xs text-slate-500 mt-1">{formatCurrency(item.price)} / item</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-slate-100">{formatNumber(item.quantity)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max={item.quantity}
                            value={returnItems[item.id] || ""}
                            onChange={e => handleReturnQtyChange(item.id, e.target.value, item.quantity)}
                            className="text-center"
                            placeholder="0"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Alasan Retur</Label>
                  <Select value={returnReason} onValueChange={setReturnReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih alasan retur..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Barang Rusak/Cacat">Barang Rusak/Cacat</SelectItem>
                      <SelectItem value="Barang Kadaluarsa">Barang Kadaluarsa</SelectItem>
                      <SelectItem value="Salah Kirim Barang">Salah Kirim Barang</SelectItem>
                      <SelectItem value="Kualitas Tidak Sesuai">Kualitas Tidak Sesuai</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Catatan (Opsional)</Label>
                  <Input
                    placeholder="Tambahkan catatan retur..."
                    value={returnNotes}
                    onChange={e => setReturnNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-950/20 text-orange-800 dark:text-orange-400 p-4 rounded-lg border border-orange-200 dark:border-orange-900/50 mt-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Total Refund Estimasi</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(
                        returnTransaction.purchasedItems?.reduce((sum: number, item: any) => sum + ((returnItems[item.id] || 0) * item.price), 0) || 0
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => {
              setIsReturnDialogOpen(false);
              setReturnTransaction(null);
              setReturnSearchInvoice("");
              setEditingReturnId(null);
            }}>Batal</Button>
            {returnTransaction && (
              <Button onClick={handleSubmitReturn} className="gap-2">
                <Check className="w-4 h-4" /> {editingReturnId ? 'Simpan Perubahan' : 'Proses Retur'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Return Detail Dialog */}
      <Dialog open={!!selectedReturn} onOpenChange={(open) => !open && setSelectedReturn(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto scrollbar-hide">
          {selectedReturn && (
            <>
              <DialogHeader>
                <DialogTitle>Detail Retur Suplier</DialogTitle>
                <DialogDescription>
                  Informasi detail untuk retur <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedReturn.id}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Tanggal Retur</p>
                    <p className="font-medium">{new Date(selectedReturn.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-xs text-slate-500">Suplier</p>
                    <p className="font-medium">{selectedReturn.supplierName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">No Faktur Pembelian</p>
                    <p className="font-medium text-primary">{selectedReturn.invoiceId}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-xs text-slate-500">Alasan Retur</p>
                    <p className="font-medium text-orange-600 dark:text-orange-400">{selectedReturn.reason}</p>
                  </div>
                </div>

                {selectedReturn.notes && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-md text-sm border border-slate-200 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Catatan:</span> {selectedReturn.notes}
                  </div>
                )}

                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                      <TableRow>
                        <TableHead>Produk</TableHead>
                        <TableHead className="text-center w-[120px]">Qty Retur</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedReturn.items?.map((item: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">
                            {item.productName}
                            <div className="text-xs text-slate-500 mt-1">{formatCurrency(item.price)} / item</div>
                          </TableCell>
                          <TableCell className="text-center font-bold text-orange-600 dark:text-orange-400">
                            {item.returnQuantity}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.returnSubtotal)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-between items-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900/50">
                  <span className="font-bold text-orange-800 dark:text-orange-400">Total Refund</span>
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{formatCurrency(selectedReturn.totalRefund)}</span>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <div className="flex w-full justify-between sm:justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedReturn(null)}>Tutup</Button>
                  <Button className="gap-2" onClick={() => { const trx = transactions.find((t: any) => t.id === selectedReturn.invoiceId); if (trx) handlePrintPurchaseInvoice(trx, true, selectedReturn); }}>
                    <FileText className="w-4 h-4" /> Cetak Faktur
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Nominal Pembayaran Tagihan */}
      <Dialog open={paymentDialogState.isOpen} onOpenChange={(open) => setPaymentDialogState(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Bayar Tagihan</DialogTitle>
            <DialogDescription className="flex flex-col">
              <span>Masukkan nominal pembayaran untuk faktur</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1">{paymentDialogState.trxId}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="font-medium text-slate-600 dark:text-slate-400">Sisa Tagihan</span>
              <span className="font-bold text-red-600 dark:text-red-400">{formatCurrency(paymentDialogState.sisaTagihan)}</span>
            </div>
            <div className="space-y-2">
              <Label>Nominal Pembayaran</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 font-medium text-sm">Rp</span>
                </div>
                <Input
                  className="pl-9 bg-white dark:bg-slate-950"
                  placeholder="0"
                  value={formatNumber(paymentDialogState.nominalBayar)}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setPaymentDialogState(prev => ({ ...prev, nominalBayar: val }));
                  }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogState(prev => ({ ...prev, isOpen: false }))}>Batal</Button>
            <Button onClick={submitPayment}>Simpan Pembayaran</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </Sidebar>
  );
}
