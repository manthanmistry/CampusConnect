import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import PublicLayout from './components/PublicLayout';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import LostItems from './pages/LostItems';
import FoundItems from './pages/FoundItems';
import ItemDetails from './pages/ItemDetails';
import NotFound from './pages/NotFound';
import Chat from './pages/Chat';

import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ReportLost from './pages/ReportLost';
import ReportFound from './pages/ReportFound';
import EditItem from './pages/EditItem';
import MyReports from './pages/MyReports';
import MyClaims from './pages/MyClaims';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageItems from './pages/admin/ManageItems';
import ManageClaims from './pages/admin/ManageClaims';

function App() {
return (
<> <Routes>

    <Route element={<PublicLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/lost-items" element={<LostItems />} />
      <Route path="/found-items" element={<FoundItems />} />
      <Route path="/items/:id" element={<ItemDetails />} />
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/report-lost" element={<ReportLost />} />
        <Route path="/report-found" element={<ReportFound />} />
        <Route path="/items/:id/edit" element={<EditItem />} />
        <Route path="/my-reports" element={<MyReports />} />
        <Route path="/my-claims" element={<MyClaims />} />
        <Route path="/chat" element={<Chat />} />
      </Route>
    </Route>

    <Route element={<AdminRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/items" element={<ManageItems />} />
        <Route path="/admin/claims" element={<ManageClaims />} />
      </Route>
    </Route>

    <Route path="*" element={<NotFound />} />

  </Routes>

  <ToastContainer
    position="top-right"
    autoClose={3000}
    hideProgressBar
  />
</>

);
}

export default App;
