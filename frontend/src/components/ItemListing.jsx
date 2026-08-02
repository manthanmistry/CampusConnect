import { useEffect, useState, useCallback } from 'react';
import { Row, Col, Form, InputGroup, Button } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import api from '../services/api';
import ItemCard from '../components/ItemCard';
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

const ItemListing = ({ status, title }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState('');
  const [claimStatus, setClaimStatus] = useState('');
  const [location, setLocation] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { status };
      if (search) params.search = search;
      if (category) params.category = category;
      if (claimStatus) params.claimStatus = claimStatus;
      if (location) params.location = location;

      const { data } = await api.get('/items', { params });
      setItems(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [status, search, category, claimStatus, location]);

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, category, claimStatus, location]);

  useEffect(() => {
    const delay = setTimeout(() => fetchItems(), 400);
    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setClaimStatus('');
    setLocation('');
    setSearchParams({});
  };

  return (
    <div className="py-4" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem' }}>
      <h4 className="cc-section-title">{title}</h4>

      <div className="cc-filter-bar">
        <Row className="g-2">
          <Col md={4}>
            <InputGroup>
              <InputGroup.Text className="bg-white">
                <FiSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search by item, category, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={3} sm={6}>
            <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3} sm={6}>
            <Form.Select value={claimStatus} onChange={(e) => setClaimStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Claimed">Claimed</option>
              <option value="Returned">Returned</option>
            </Form.Select>
          </Col>
          <Col md={2} sm={6}>
            <Form.Control
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </Col>
        </Row>
        {(search || category || claimStatus || location) && (
          <Button variant="link" size="sm" className="mt-2 p-0 text-decoration-none" onClick={clearFilters}>
            <FiX /> Clear all filters
          </Button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <div className="cc-empty-state">No {status.toLowerCase()} items match your search.</div>
      ) : (
        <Row className="g-4">
          {items.map((item) => (
            <Col key={item._id} sm={6} md={4} lg={3}>
              <ItemCard item={item} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default ItemListing;
