import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PiBinocularsFill } from 'react-icons/pi';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      const redirectTo = location.state?.from?.pathname || (user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cc-auth-wrapper">
      <div className="cc-auth-card">
        <div className="text-center mb-4">
          <PiBinocularsFill size={36} color="var(--cc-primary)" />
          <h4 className="fw-bold mt-2">Welcome Back</h4>
          <p className="text-muted small">Login to CampusConnect</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@campus.edu"
            />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Your password"
            />
          </Form.Group>
          <Button type="submit" className="btn-cc-primary w-100" size="lg" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Form>

        <p className="text-center text-muted mt-4 mb-0">
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--cc-primary)' }} className="fw-semibold">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
