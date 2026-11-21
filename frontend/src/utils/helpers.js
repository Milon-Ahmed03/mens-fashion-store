// ছোট ছোট সাহায্যকারী ফাংশন

export const money = (n) => `৳${Number(n || 0).toLocaleString('en-US')}`;

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

export const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

// ছবি লোড না হলে এই ছবি দেখাবে
export const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750"><rect width="600" height="750" fill="#f3f4f6"/><text x="50%" y="50%" fill="#9ca3af" font-family="Arial" font-size="28" text-anchor="middle" dominant-baseline="middle">No Image</text></svg>'
  );

export const onImgError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = PLACEHOLDER;
};

export const discountPercent = (p) =>
  p.discountPrice > 0 && p.price > 0 ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0;

export const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
export const ALL_STATUSES = [...ORDER_STATUSES, 'cancelled', 'returned'];

export const SIZES = ['S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36'];

// Array of Object থেকে CSV ফাইল ডাউনলোড (Excel-এ বাংলা ঠিক দেখানোর জন্য BOM যোগ করা)
export const exportCSV = (filename, rows) => {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
