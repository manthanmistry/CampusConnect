import { useState } from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUploadCloud } from 'react-icons/fi';
import api from '../services/api';

const CATEGORIES = [
  'Electronics',
  'Documents',
  'Accessories',
  'Clothing',
  'Books',
  'Keys',
  'Bags',
  'ID Cards',
  'Wallets',
  'Other',
];

const ReportItemForm = ({ status }) => {
  const isLost = status === 'Lost';
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    date: '',
    color: '',
    brand: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      data.append('status', status);
      if (imageFile) data.append('image', imageFile);

      await api.post('/items', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(`${status} item reported successfully!`);
      navigate('/my-reports');
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to report ${status.toLowerCase()} item`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 className="cc-section-title">Report {status} Item</h4>
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Item Title</Form.Label>
                  <Form.Control
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder={isLost ? 'e.g. Black Dell Laptop' : 'e.g. Found a blue water bottle'}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select name="category" value={formData.category} onChange={handleChange} required>
                    <option value="">Select a category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Provide detailed description including any distinguishing features"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{isLost ? 'Location Lost' : 'Location Found'}</Form.Label>
                  <Form.Control
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Central Library"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{isLost ? 'Date Lost' : 'Date Found'}</Form.Label>
                  <Form.Control type="date" name="date" value={formData.date} onChange={handleChange} required />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Color (optional)</Form.Label>
                  <Form.Control name="color" value={formData.color} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Brand (optional)</Form.Label>
                  <Form.Control name="brand" value={formData.brand} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>Item Image</Form.Label>
              <div className="border rounded-3 p-3 text-center" style={{ borderStyle: 'dashed' }}>
                {preview ? (
                  <img src={preview} alt="Preview" style={{ maxHeight: 180, borderRadius: 8 }} />
                ) : (
                  <div className="text-muted py-3">
                    <FiUploadCloud size={28} />
                    <p className="mb-0 mt-2 small">Upload a clear photo of the item (JPEG, PNG, WEBP - max 5MB)</p>
                  </div>
                )}
                <Form.Control type="file" accept="image/*" onChange={handleImageChange} className="mt-2" />
              </div>
            </Form.Group>

            <Button type="submit" className={isLost ? 'btn-cc-primary' : 'btn-cc-accent'} size="lg" disabled={loading}>
              {loading ? 'Submitting...' : `Submit ${status} Report`}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ReportItemForm;
