// src/pages/LaporanPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaFilePdf, FaPrint } from 'react-icons/fa';
import { FiDollarSign, FiAlertTriangle } from 'react-icons/fi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const LaporanPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tableRef = useRef();

  // Sorting state
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' atau 'desc'

  // Konversi string angka (IDR) ke number
  const parseAmount = raw => {
    if (typeof raw === 'number') return raw;
    let s = String(raw).trim();
    s = s.replace(/[^0-9.,-]/g, '');
    if (s.includes(',')) {
      s = s.replace(/\./g, '').replace(/,/g, '.');
    }
    const num = parseFloat(s);
    return isNaN(num) ? 0 : num;
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const [pemasukanRes, pengeluaranRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_BACKEND}/api/pemasukan`),
          axios.get(`${process.env.REACT_APP_BACKEND}/api/pengeluaran`)
        ]);

        const pemasukanList = pemasukanRes.data?.data || [];
        const pengeluaranList = pengeluaranRes.data?.data || [];

        const combined = [
          ...pemasukanList.map(item => ({
            id: item.pemasukan_id,
            type: 'pemasukan',
            date: item.tgl_bayar || item.createdAt,
            amount: parseAmount(item.jumlah_bayar),
            description: item.keterangan || '-'
          })),
          ...pengeluaranList.map(item => ({
            id: item.pengeluaran_id,
            type: 'pengeluaran',
            date: item.tgl_pengeluaran || item.createdAt,
            amount: parseAmount(item.jumlah),
            description: item.deskripsi || '-'
          }))
        ];

        // Default sort by date descending
        combined.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTransactions(combined);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data transaksi');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const formatDate = dateString => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = value =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value || 0);

  const exportToPdf = async () => {
    if (!tableRef.current) {
      alert('Tabel laporan belum siap untuk diekspor.');
      return;
    }
    try {
      const canvas = await html2canvas(tableRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Laporan_Keuangan.pdf');
    } catch (err) {
      console.error(err);
      alert('Gagal membuat PDF: ' + err.message);
    }
  };

  if (loading) return <div className="text-center mt-5">Memuat data...</div>;
  if (error) return <div className="alert alert-danger mt-5">{error}</div>;

  // Sorting handlers
  const handleSort = field => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortedData = () => {
    if (!sortField) return [...transactions];
    return [...transactions].sort((a, b) => {
      let aVal, bVal;
      switch (sortField) {
        case 'date':
          aVal = new Date(a.date).getTime();
          bVal = new Date(b.date).getTime();
          if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
          return 0;

        case 'type':
          aVal = a.type;
          bVal = b.type;
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });

        case 'description':
          aVal = a.description || '';
          bVal = b.description || '';
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal, 'id-ID', { sensitivity: 'base' })
            : bVal.localeCompare(aVal, 'id-ID', { sensitivity: 'base' });

        case 'amount':
          aVal = a.amount;
          bVal = b.amount;
          if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
          return 0;

        default:
          return 0;
      }
    });
  };

  const renderSortIndicator = field => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  const sortedData = getSortedData();

  const totalPemasukan = sortedData
    .filter(t => t.type === 'pemasukan')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPengeluaran = sortedData
    .filter(t => t.type === 'pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0);

  const saldoAkhir = totalPemasukan - totalPengeluaran;

  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h3 className="mb-0">Laporan Keuangan</h3>
          <div>
            <button onClick={exportToPdf} className="btn btn-danger me-2">
              <FaFilePdf className="me-2" /> Export PDF
            </button>
            <button onClick={() => window.print()} className="btn btn-secondary">
              <FaPrint className="me-2" /> Cetak
            </button>
          </div>
        </div>
        <div className="card-body">
          <div
            className="table-responsive"
            ref={tableRef}
            style={{ backgroundColor: 'white' }}
          >
            <table className="table table-striped table-hover table-bordered">
              <thead className="table-dark">
                <tr>
                  <th className="text-center">No</th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('date')}
                  >
                    Tanggal{renderSortIndicator('date')}
                  </th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('type')}
                  >
                    Jenis{renderSortIndicator('type')}
                  </th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('description')}
                  >
                    Deskripsi{renderSortIndicator('description')}
                  </th>
                  <th
                    className="text-end"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('amount')}
                  >
                    Nominal{renderSortIndicator('amount')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      Tidak ada data transaksi
                    </td>
                  </tr>
                ) : (
                  sortedData.map((t, i) => (
                    <tr
                      key={t.id || i}
                      className={
                        t.type === 'pemasukan' ? 'table-success' : 'table-danger'
                      }
                    >
                      <td className="text-center">{i + 1}</td>
                      <td>{formatDate(t.date)}</td>
                      <td>
                        {t.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                      </td>
                      <td>{t.description}</td>
                      <td className="text-end">{formatCurrency(t.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {sortedData.length > 0 && (
                <tfoot className="table-secondary">
                  <tr>
                    <th colSpan="4" className="text-end">
                      Total Pemasukan
                    </th>
                    <th className="text-end">{formatCurrency(totalPemasukan)}</th>
                  </tr>
                  <tr>
                    <th colSpan="4" className="text-end">
                      Total Pengeluaran
                    </th>
                    <th className="text-end">{formatCurrency(totalPengeluaran)}</th>
                  </tr>
                  <tr>
                    <th colSpan="4" className="text-end">
                      Saldo Akhir
                    </th>
                    <th className="text-end">{formatCurrency(saldoAkhir)}</th>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanPage;
