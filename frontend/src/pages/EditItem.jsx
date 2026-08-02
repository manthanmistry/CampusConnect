import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FiUploadCloud } from 'react-icons/fi';
import api, { getImageUrl } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

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

const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data } = await api.get(`/items/${id}`);
        const item = data.data;
        setFormData({
          title: item.title,
          description: item.description,
          category: item.category,
          status: item.status,
          location: item.location,
          date: item.date ? item.date.substring(0, 10) : '',
          color: item.color || '',
          brand: item.brand || '',
        });
        if (item.image) setPreview(getImageUrl(item.image));
      } catch (error) {
        toast.error('Failed to load item');
        navigate('/my-reports');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      if (imageFile) data.append('image', imageFile);

      await api.put(`/items/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Report updated successfully');
      navigate(`/items/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update report');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) return <LoadingSpinner />;

  return (
    <div>
      <h4 className="cc-section-title">Edit Report</h4>
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Item Title</Form.Label>
                  <Form.Control name="title" value={formData.title} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select name="category" value={formData.category} onChange={handleChange} required>
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
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select name="status" value={formData.status} onChange={handleChange} required>
                    <option value="Lost">Lost</option>
                    <option value="Found">Found</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control name="location" value={formData.location} onChange={handleChange} required />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control type="date" name="date" value={formData.date} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Color</Form.Label>
                  <Form.Control name="color" value={formData.color} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Brand</Form.Label>
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
                    <p className="mb-0 mt-2 small">Upload a new photo to replace the current one</p>
                  </div>
                )}
                <Form.Control type="file" accept="image/*" onChange={handleImageChange} className="mt-2" />
              </div>
            </Form.Group>

            <Button type="submit" className="btn-cc-primary" size="lg" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default EditItem;
