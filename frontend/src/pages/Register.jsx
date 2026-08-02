import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PiBinocularsFill } from 'react-icons/pi';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      toast.success('Registration successful! Welcome to CampusConnect.');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cc-auth-wrapper">
      <div className="cc-auth-card">
        <div className="text-center mb-4">
          <PiBinocularsFill size={36} color="var(--cc-primary)" />
          <h4 className="fw-bold mt-2">Create Your Account</h4>
          <p className="text-muted small">Join CampusConnect to report and claim lost items</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
          </Form.Group>
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
          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control name="phone" value={formData.phone} onChange={handleChange} placeholder="9876543210" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="At least 6 characters"
            />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Button type="submit" className="btn-cc-primary w-100" size="lg" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </Button>
        </Form>

        <p className="text-center text-muted mt-4 mb-0">
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--cc-primary)' }} className="fw-semibold">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
