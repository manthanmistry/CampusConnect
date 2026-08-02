import { Outlet } from 'react-router-dom';
import AppNavbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  return (
    <>
      <AppNavbar />
      <div className="cc-layout">
        <Sidebar />
        <div className="cc-main-content">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
