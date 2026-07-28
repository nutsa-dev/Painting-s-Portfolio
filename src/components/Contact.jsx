import React, { useState } from 'react';
import { Instagram, Send, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 4000);
  };

  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        <p className="section-desc">
          Reach out for collaborations, commissions, or just to say hello.<br />
          I’d love to hear from you!
        </p>

        {submitted ? (
          <div style={{
            background: 'var(--bg-card)',
            padding: '2.5rem',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1rem',
            color: 'var(--accent-color)',
            marginBottom: '3rem'
          }}>
            <CheckCircle size={32} />
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ fontSize: '1.2rem', margin: 0 }}>Message Sent Successfully</h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Thank you for reaching out! I will respond to your inquiry shortly.
              </p>
            </div>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Your Email</label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                rows="5"
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              ></textarea>
            </div>

            <button type="submit" className="submit-btn">
              <Send size={16} style={{ marginRight: '8px' }} /> Send Message
            </button>
          </form>
        )}

        <div className="social-links">
          <a
            href="https://www.instagram.com/nutsakurdadze/"
            target="_blank"
            rel="noopener noreferrer"
            className="instagram-btn"
          >
            <Instagram size={20} /> Follow on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
