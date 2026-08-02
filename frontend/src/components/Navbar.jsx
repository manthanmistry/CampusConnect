import { Navbar as BsNavbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiUser, FiLogOut } from 'react-icons/fi';
import { PiBinocularsFill } from 'react-icons/pi';
import { useAuth } from '../context/AuthContext';

const AppNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BsNavbar expand="lg" className="cc-navbar" variant="dark" sticky="top">
      <Container fluid>
        <BsNavbar.Brand as={Link} to="/">
          <PiBinocularsFill size={24} />
          CampusConnect
        </BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="main-navbar" />
        <BsNavbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" active={location.pathname === '/'}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/lost-items" active={location.pathname === '/lost-items'}>
              Lost Items
            </Nav.Link>
            <Nav.Link as={Link} to="/found-items" active={location.pathname === '/found-items'}>
              Found Items
            </Nav.Link>
            {user && (
              <Nav.Link as={Link} to="/dashboard" active={location.pathname === '/dashboard'}>
                Dashboard
              </Nav.Link>
            )}
          </Nav>
          <Nav>
            {user ? (
              <NavDropdown
                title={
                  <span className="text-white">
                    <FiUser className="me-1" /> {user.name?.split(' ')[0]}
                  </span>
                }
                align="end"
              >
                <NavDropdown.Item as={Link} to="/profile">
                  My Profile
                </NavDropdown.Item>
                {user.role === 'admin' ? (
                  <NavDropdown.Item as={Link} to="/admin/dashboard">
                    Admin Dashboard
                  </NavDropdown.Item>
                ) : (
                  <>
                    <NavDropdown.Item as={Link} to="/my-reports">
                      My Reports
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/my-claims">
                      My Claims
                    </NavDropdown.Item>
                  </>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <FiLogOut className="me-1" /> Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="fw-bold">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default AppNavbar;
