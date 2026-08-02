import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiPlusCircle,
  FiUser,
  FiList,
  FiCheckSquare,
  FiUsers,
  FiPackage,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const studentLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: <FiGrid /> },
  { to: '/report-lost', label: 'Report Lost Item', icon: <FiPlusCircle /> },
  { to: '/report-found', label: 'Report Found Item', icon: <FiPlusCircle /> },
  { to: '/my-reports', label: 'My Reports', icon: <FiList /> },
  { to: '/my-claims', label: 'My Claims', icon: <FiCheckSquare /> },
  { to: '/profile', label: 'My Profile', icon: <FiUser /> },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <FiGrid /> },
  { to: '/admin/users', label: 'Manage Users', icon: <FiUsers /> },
  { to: '/admin/items', label: 'Manage Items', icon: <FiPackage /> },
  { to: '/admin/claims', label: 'Manage Claims', icon: <FiCheckSquare /> },
  { to: '/profile', label: 'My Profile', icon: <FiUser /> },
];

const Sidebar = () => {
  const { isAdmin } = useAuth();
  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <div className="cc-sidebar">
      <Nav className="flex-column">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {link.icon} {link.label}
          </NavLink>
        ))}
      </Nav>
    </div>
  );
};

export default Sidebar;
