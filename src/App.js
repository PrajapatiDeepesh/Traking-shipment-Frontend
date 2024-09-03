import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Nav } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import JsBarcode from 'jsbarcode';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import axios from 'axios';
import { FaSearch, FaBell, FaCheckCircle, FaShippingFast, FaHome, FaUser, FaInfoCircle, FaEnvelope, FaCog } from 'react-icons/fa';

function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    senderName: '',
    senderAddress: '',
    receiverName: '',
    receiverAddress: '',
    shipmentDetails: '',
    trackId: uuidv4(),
  });

  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current && formData.trackId) {
      JsBarcode(barcodeRef.current, formData.trackId, {
        format: 'CODE128',
        displayValue: true,
        width: 2,
        height: 40,
        margin: 10,
      });
    }
  }, [formData.trackId, step]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (validateForm()) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleEdit = (stepNumber) => {
    setStep(stepNumber);
  };

  const validateForm = () => {
    if (step === 1 && (!formData.senderName || !formData.senderAddress)) {
      alert('Please fill in both Sender Name and Sender Address');
      return false;
    }
    if (step === 2 && (!formData.receiverName || !formData.receiverAddress)) {
      alert('Please fill in both Receiver Name and Receiver Address');
      return false;
    }
    if (step === 3 && !formData.shipmentDetails) {
      alert('Please fill in Shipment Details');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.post('http://localhost:5000/api/shipments', formData);
        alert('Form submitted successfully!');
        console.log('Saved shipment:', response.data);
      } catch (err) {
        alert('Error submitting form!');
        console.error('Error:', err);
      }
    }
  };

  const handleDownloadBarcode = (format) => {
    if (barcodeRef.current) {
      if (format === 'png') {
        toPng(barcodeRef.current).then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'barcode.png';
          link.href = dataUrl;
          link.click();
        });
      } else if (format === 'pdf') {
        toPng(barcodeRef.current).then((dataUrl) => {
          const pdf = new jsPDF();
          pdf.addImage(dataUrl, 'PNG', 10, 10, 180, 60);
          pdf.save('barcode.pdf');
        });
      }
    }
  };

  return (
    <div>
      {/* Custom Navbar */}
      <div className="custom-navbar d-flex align-items-center justify-content-between p-2 bg-dark text-white">
        <div className="navbar-icons d-flex align-items-center">
          <FaSearch className="navbar-icon mx-2" style={{ cursor: 'pointer' }} />
          <FaBell className="navbar-icon mx-2" style={{ cursor: 'pointer' }} />
          <FaCheckCircle className="navbar-icon active-icon mx-2" style={{ cursor: 'pointer' }} />
        </div>
        <FaShippingFast className="navbar-icon shipment-icon" style={{ fontSize: '1.5rem', cursor: 'pointer' }} />
      </div>

      <Container fluid>
        <Row>
          {/* Left Sidebar */}
          <Col md={2} className="bg-light">
            <Nav className="flex-column">
              <Nav.Link href="#home" className="sidebar-item">
                <FaHome style={{ color: '#007bff', marginRight: '10px' }} />
                Home
              </Nav.Link>
              <Nav.Link href="#profile" className="sidebar-item">
                <FaUser style={{ color: '#28a745', marginRight: '10px' }} />
                Profile
              </Nav.Link>
              <Nav.Link href="#about" className="sidebar-item">
                <FaInfoCircle style={{ color: '#17a2b8', marginRight: '10px' }} />
                About
              </Nav.Link>
              <Nav.Link href="#contact" className="sidebar-item">
                <FaEnvelope style={{ color: '#ffc107', marginRight: '10px' }} />
                Contact
              </Nav.Link>
              <Nav.Link href="#settings" className="sidebar-item">
                <FaCog style={{ color: '#dc3545', marginRight: '10px' }} />
                Settings
              </Nav.Link>
            </Nav>
          </Col>

          {/* Center Form */}
          <Col md={8}>
            <h2>Shipment Form</h2>
            <Form onSubmit={handleSubmit}>
              {step === 1 && (
                <>
                  <Form.Group controlId="senderName">
                    <Form.Label>Sender Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="senderName"
                      value={formData.senderName}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="senderAddress">
                    <Form.Label>Sender Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="senderAddress"
                      value={formData.senderAddress}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Button variant="primary" onClick={handleNext}>
                    Next
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <Form.Group controlId="receiverName">
                    <Form.Label>Receiver Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="receiverName"
                      value={formData.receiverName}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="receiverAddress">
                    <Form.Label>Receiver Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="receiverAddress"
                      value={formData.receiverAddress}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Button variant="secondary" onClick={handlePrev}>
                    Previous
                  </Button>
                  <Button variant="primary" onClick={handleNext}>
                    Next
                  </Button>
                  <Button variant="warning" onClick={() => handleEdit(1)}>
                    Edit Sender Info
                  </Button>
                </>
              )}

              {step === 3 && (
                <>
                  <Form.Group controlId="shipmentDetails">
                    <Form.Label>Shipment Details</Form.Label>
                    <Form.Control
                      type="text"
                      name="shipmentDetails"
                      value={formData.shipmentDetails}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Button variant="secondary" onClick={handlePrev}>
                    Previous
                  </Button>
                  <Button variant="primary" onClick={handleNext}>
                    Next
                  </Button>
                  <Button variant="warning" onClick={() => handleEdit(2)}>
                    Edit Receiver Info
                  </Button>
                </>
              )}

              {step === 4 && (
                <>
                  <Form.Group controlId="trackId">
                    <Form.Label>Tracking ID</Form.Label>
                    <Form.Control
                      type="text"
                      name="trackId"
                      value={formData.trackId}
                      readOnly
                    />
                  </Form.Group>
                  <div>
                    <svg ref={barcodeRef}></svg>
                  </div>
                  <Button variant="secondary" onClick={handlePrev}>
                    Previous
                  </Button>
                  <Button variant="primary" type="submit">
                    Submit
                  </Button>
                  <Button variant="success" onClick={() => handleDownloadBarcode('png')}>
                    Download Barcode as PNG
                  </Button>
                  <Button variant="success" onClick={() => handleDownloadBarcode('pdf')}>
                    Download Barcode as PDF
                  </Button>
                  <Button variant="warning" onClick={() => handleEdit(3)}>
                    Edit Shipment Info
                  </Button>
                </>
              )}
            </Form>
          </Col>

          {/* Right Progress Sidebar */}
          <Col md={2} className="bg-light d-flex flex-column align-items-center justify-content-center">
            <div style={{ width: '100%', marginTop: '20px', position: 'relative', textAlign: 'center' }}>
              <div className="vertical-line" style={{
                position: 'absolute',
                top: '40px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '2px',
                height: 'calc(100% - 80px)',
                backgroundColor: '#007bff',
                zIndex: 0,
              }}></div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div className={`circle ${step >= 1 ? 'active' : ''}`} style={circleStyle(step >= 1)}>
                  1
                </div>
                <div className="label mt-2">Sender</div>
              </div>
              <div style={{ position: 'relative', zIndex: 1, marginTop: '20px' }}>
                <div className={`circle ${step >= 2 ? 'active' : ''}`} style={circleStyle(step >= 2)}>
                  2
                </div>
                <div className="label mt-2">Receiver</div>
              </div>
              <div style={{ position: 'relative', zIndex: 1, marginTop: '20px' }}>
                <div className={`circle ${step >= 3 ? 'active' : ''}`} style={circleStyle(step >= 3)}>
                  3
                </div>
                <div className="label mt-2">Shipment</div>
              </div>
              <div style={{ position: 'relative', zIndex: 1, marginTop: '20px' }}>
                <div className={`circle ${step >= 4 ? 'active' : ''}`} style={circleStyle(step >= 4)}>
                  4
                </div>
                <div className="label mt-2">Tracking ID</div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

const circleStyle = (isActive) => ({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: isActive ? '#007bff' : '#ddd',
  color: isActive ? '#fff' : '#555',
  lineHeight: '40px',
  textAlign: 'center',
  fontSize: '1.2rem',
  margin: '0 auto',
});

export default App;
