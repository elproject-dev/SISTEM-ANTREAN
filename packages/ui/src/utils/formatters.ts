export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatAntreanNumber = (num: number, prefix: string = 'A'): string => {
  return `${prefix}-${num.toString().padStart(3, '0')}`;
};
