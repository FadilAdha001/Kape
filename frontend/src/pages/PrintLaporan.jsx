import React, { forwardRef } from 'react';

const PrintLaporan = forwardRef(({ transactions, formatDate, formatCurrency }, ref) => {
    const totalPemasukan = transactions
        .filter(t => t.type === 'pemasukan')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalPengeluaran = transactions
        .filter(t => t.type === 'pengeluaran')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

    const saldoAkhir = totalPemasukan - totalPengeluaran;

    return (
        <div ref={ref} className="p-4">
            <h2 className="text-center mb-4">Laporan Keuangan</h2>
            <table className="table table-bordered table-sm">
                <thead className="table-dark">
                    <tr>
                        <th className="text-center">No</th>
                        <th>Tanggal</th>
                        <th>Jenis</th>
                        <th>Deskripsi</th>
                        <th>Nominal</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="text-center">Tidak ada data transaksi</td>
                        </tr>
                    ) : (
                        transactions.map((item, index) => (
                            <tr
                                key={item.id || `temp-${index}`}
                                className={item.type === 'pemasukan' ? 'table-success' : 'table-danger'}
                            >
                                <td className="text-center">{index + 1}</td>
                                <td>{formatDate(item.date)}</td>
                                <td>{item.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}</td>
                                <td>{item.description}</td>
                                <td className="text-end">{formatCurrency(item.amount)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
                {transactions.length > 0 && (
                    <tfoot className="table-secondary">
                        <tr>
                            <th colSpan="4" className="text-end">Total Pemasukan</th>
                            <th className="text-end">{formatCurrency(totalPemasukan)}</th>
                        </tr>
                        <tr>
                            <th colSpan="4" className="text-end">Total Pengeluaran</th>
                            <th className="text-end">{formatCurrency(totalPengeluaran)}</th>
                        </tr>
                        <tr>
                            <th colSpan="4" className="text-end">Saldo Akhir</th>
                            <th className="text-end">{formatCurrency(saldoAkhir)}</th>
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    );
});

export default PrintLaporan;
