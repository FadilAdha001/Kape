import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';

const AdminLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="d-flex" style={{ minHeight: '100vh' }}>
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <div
                className="flex-grow-1 p-4"
                style={{ marginLeft: isCollapsed ? '75px' : '250px', transition: 'margin-left 0.3s' }}
            >
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;

