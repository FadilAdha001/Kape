// components/Sidebar.jsx
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiFileText,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiTrash2,
  FiBarChart2,
  FiUser,
  FiBookOpen,
  FiChevronDown
} from 'react-icons/fi';
import { useApp } from './AppContext';

/**
 * 1) Struktur menu dibagi per “grup”. Setiap grup punya:
 *    - label: Nama grup yang akan ditampilkan
 *    - icon: Ikon di samping nama grup
 *    - roles: jika array kosong → semua role boleh lihat, 
 *             kalau tidak kosong → hanya role tertentu
 *    - items: daftar objek menu (label, to, icon, end, roles).
 */
const groupedMenuConfig = [
  {
    label: 'Umum',
    icon: FiHome,
    roles: [], // semua role
    items: [
      {
        label: 'Dashboard',
        to: '/dashboard',
        icon: FiHome,
        end: true,
        roles: [] // semua role
      },
    ]
  },
  {
    label: 'Transaksi & Tagihan',
    icon: FiFileText,
    roles: ['admin', 'siswa', 'orang_tua'], // admin + siswa/orangtua bisa lihat grup ini
    items: [
      {
        label: 'Tagihan',
        to: '/list-tagihan',
        icon: FiFileText,
        end: true,
        roles: ['siswa', 'orang_tua']
      },
      {
        label: 'Kelola Biaya',
        to: '/kelola-biaya',
        icon: FiDollarSign,
        end: false,
        roles: ['admin']
      },
      {
        label: 'Kelola Tagihan Siswa',
        to: '/kelola-tagihan',
        icon: FiFileText,
        end: false,
        roles: ['admin']
      },
      {
        label: 'Kelola Pemasukan',
        to: '/kelola-pemasukan',
        icon: FiDollarSign,
        end: false,
        roles: ['admin']
      },
      {
        label: 'Kelola Pengeluaran',
        to: '/kelola-pengeluaran',
        icon: FiTrash2,
        end: false,
        roles: ['admin']
      }
    ]
  },
  {
    label: 'Manajemen',
    icon: FiUsers,
    roles: ['admin', 'orang_tua', 'guru'], // role yang boleh lihat grup ini
    items: [
      {
        label: 'Kelola Guru',
        to: '/kelola-karyawan',
        icon: FiUsers,
        end: false,
        roles: ['admin']
      },
      {
        label: 'Kelola Orang Tua',
        to: '/kelola-orangtua',
        icon: FiUser,
        end: false,
        roles: ['admin']
      },
      {
        label: 'Kelola Siswa',
        to: '/kelola-siswa',
        icon: FiUser,
        end: false,
        roles: ['admin', 'orang_tua', 'guru']
      },
      {
        label: 'Data Gaji',
        to: '/gaji',
        icon: FiDollarSign,
        end: false,
        roles: ['admin', 'guru']
      },
      {
        label: 'Kelola Kelas',
        to: '/kelola-kelas',
        icon: FiBookOpen,
        end: false,
        roles: ['admin', 'guru']
      },
      {
        label: 'Kelola Akun',
        to: '/kelola-akun',
        icon: FiSettings,
        end: false,
        roles: ['admin']
      }
    ]
  },
  {
    label: 'Laporan',
    icon: FiBarChart2,
    roles: ['admin', 'kepsek'], // hanya admin & kepsek yang lihat
    items: [
      {
        label: 'Kelola Laporan',
        to: '/kelola-laporan',
        icon: FiBarChart2,
        end: false,
        roles: ['admin', 'kepsek']
      }
    ]
  }
];

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, isLoading, logout } = useApp();
  const navigate = useNavigate();

  // 2) State untuk track grup mana yang sedang di‐expand.
  const [openGroups, setOpenGroups] = useState({});

  // 3) Jika masih mem‐fetch user atau user===null, redirect/return null
  useEffect(() => {
    if (isLoading) return;
    if (!user) navigate('/');
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return null;
  }

  // 4) Filter setiap grup berdasarkan role user
  const visibleGroups = groupedMenuConfig
    .map(group => {
      // Pertama, cek apakah grup dapat diakses oleh user melalui roles grup
      if (group.roles.length > 0 && !group.roles.includes(user.role)) {
        return null;
      }

      // Filter item di dalam grup sesuai role user
      const visibleItems = group.items.filter(item =>
        item.roles.length === 0 || item.roles.includes(user.role)
      );

      // Jika tertinggal setidaknya satu item, grup akan ditampilkan
      if (visibleItems.length === 0) {
        return null;
      }

      return {
        ...group,
        items: visibleItems
      };
    })
    .filter(Boolean); // hilangkan grup null

  // 5) Toggle fungsi (ketika header grup diklik)
  const toggleGroup = (groupLabel) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupLabel]: !prev[groupLabel]
    }));
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      logout();
    }
  };

  return (
    <nav
      className="bg-dark text-white position-fixed h-100 shadow"
      style={{
        width: isCollapsed ? '75px' : '250px',
        transition: 'width 0.3s'
      }}
    >
      <div className="p-3 d-flex flex-column h-100 justify-content-between">
        <div>
          {/* Header Sidebar: judul + tombol collapse */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            {!isCollapsed && (
              <h5 className="text-white mb-0">
                <span className="text-primary">Welcome </span> {user.username}
              </h5>
            )}
            <button
              className="btn btn-sm btn-outline-light ms-auto"
              onClick={() => setIsCollapsed(prev => !prev)}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
          </div>

          {/* 6) Render setiap grup */}
          <ul className="nav flex-column gap-2">
            {visibleGroups.map(group => {
              // Cek apakah grup saat ini sedang terbuka
              const isOpen = !!openGroups[group.label];

              return (
                <li key={group.label}>
                  {/* Header grup */}
                  <button
                    type="button"
                    className="btn btn-sm w-100 text-white text-start d-flex align-items-center"
                    onClick={() => toggleGroup(group.label)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      padding: '0.5rem 0',
                      cursor: 'pointer'
                    }}
                  >
                    <group.icon className="me-2" size={18} />
                    {!isCollapsed && (
                      <>
                        <span className="flex-grow-1">{group.label}</span>
                        {isOpen ? (
                          <FiChevronDown size={16} />
                        ) : (
                          <FiChevronRight size={16} />
                        )}
                      </>
                    )}
                  </button>

                  {/* Submenu (hanya render jika grup terbuka) */}
                  {isOpen && !isCollapsed && (
                    <ul className="nav flex-column ms-4">
                      {group.items.map(item => (
                        <li className="nav-item" key={item.to}>
                          <NavLink
                            to={item.to}
                            end={item.end || false}
                            className={({ isActive }) =>
                              `nav-link d-flex align-items-center ${
                                isActive ? 'bg-primary text-white' : 'text-white'
                              }`
                            }
                            style={{
                              borderRadius: '0.25rem',
                              padding: '0.3rem 0.5rem'
                            }}
                          >
                            <item.icon className="me-2" size={16} />
                            {item.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Jika sidebar collapse, kita tidak render submenu apapun */}
                  {isCollapsed && <hr className="border-secondary" />}
                </li>
              );
            })}

            {/* Logout di bagian paling bawah */}
            <li className="mt-4 border-top pt-3">
              <button
                type="button"
                onClick={handleLogout}
                className="nav-link text-white d-flex align-items-center bg-transparent border-0 text-start w-100"
                style={{ cursor: 'pointer', padding: '0.5rem 0' }}
              >
                <FiLogOut className="me-2" size={18} />
                {!isCollapsed && 'Logout'}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
