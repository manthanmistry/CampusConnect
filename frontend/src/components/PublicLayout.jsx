import { Outlet } from 'react-router-dom';
import AppNavbar from './Navbar';
import Footer from './Footer';

const PublicLayout = () => {
  return (
    <>
      <AppNavbar />
      <Outlet />
      <Footer />
    </>
  );
};

export default PublicLayout;
