import { useState } from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FiUser } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const payload = { name: formData.name, phone: formData.phone };
      if (formData.password) payload.password = formData.password;

      const { data } = await api.put('/auth/profile', payload);
      updateUser(data.data);
      toast.success('Profile updated successfully');
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 className="cc-section-title">My Profile</h4>
      <Row>
        <Col lg={7}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: 64, height: 64, backgroundColor: 'var(--cc-primary)', color: '#fff' }}
                >
                  <FiUser size={28} />
                </div>
                <div>
                  <h5 className="mb-0 fw-bold">{user?.name}</h5>
                  <span className="text-muted small text-capitalize">{user?.role}</span>
                </div>
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control name="name" value={formData.name} onChange={handleChange} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control value={user?.email || ''} disabled readOnly />
                  <Form.Text className="text-muted">Email address cannot be changed.</Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control name="phone" value={formData.phone} onChange={handleChange} />
                </Form.Group>

                <hr className="my-4" />
                <p className="text-muted small mb-3">Leave the password fields blank to keep your current password.</p>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button type="submit" className="btn-cc-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
