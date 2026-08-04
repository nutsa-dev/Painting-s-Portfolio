import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Plus,
  Trash2,
  Edit3,
  Check,
  LogOut,
  UserPlus,
  LogIn,
  GripVertical,
  Columns,
  Move,
  ArrowDownUp,
  AlertCircle,
  CheckCircle2,
  Upload
} from 'lucide-react';
import {
  checkAdminAuth,
  loginAdmin,
  logoutAdmin,
  registerAdminCredentials,
  savePainting,
  deletePainting,
  savePaintingsOrder,
  addCategory,
  deleteCategory,
  saveAboutMe
} from '../utils/storage';
import { parseArtworkDimensions, getRelativeScaleStyle } from './Gallery';

export default function AdminModal({
  isOpen,
  onClose,
  paintings,
  categories,
  aboutData,
  onRefreshData
}) {
  // ─── ALL HOOKS MUST BE DECLARED BEFORE ANY EARLY RETURN ───────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(checkAdminAuth());
  const [isRegistering, setIsRegistering] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  // 'kanban' | 'order' | 'paintings' | 'categories' | 'about'
  const [activeTab, setActiveTab] = useState('kanban');

  // Kanban Drag & Drop State
  const [draggedPainting, setDraggedPainting] = useState(null);
  const [dragOverCategory, setDragOverCategory] = useState(null);

  // Gallery Order Drag & Drop State
  const [draggedOrderIndex, setDraggedOrderIndex] = useState(null);
  const [dragOverOrderIndex, setDragOverOrderIndex] = useState(null);

  // Artwork Form State
  const [editingId, setEditingId] = useState(null);
  const [artForm, setArtForm] = useState({
    title: '',
    medium: '',
    size: '',
    category: '',
    imageUrl: ''
  });
  const [sizeNotice, setSizeNotice] = useState('');

  // New Category State
  const [newCatInput, setNewCatInput] = useState('');

  // About Form State — paragraphs is an array matching AboutMe.jsx's expected shape
  const [aboutForm, setAboutForm] = useState(() => {
    const data = aboutData || {};
    // Normalise: support both old {p1,p2,p3} schema and correct {paragraphs[]} schema
    if (Array.isArray(data.paragraphs)) {
      return { photoUrl: data.photoUrl || '', paragraphs: [...data.paragraphs] };
    }
    // Legacy migration: p1/p2/p3 → paragraphs array
    const legacy = [data.p1, data.p2, data.p3].filter(Boolean);
    return {
      photoUrl: data.photoUrl || '',
      paragraphs: legacy.length > 0 ? legacy : ['', '', '']
    };
  });

  // Keep aboutForm in sync when aboutData prop changes (e.g. after refresh)
  useEffect(() => {
    if (!aboutData) return;
    if (Array.isArray(aboutData.paragraphs)) {
      setAboutForm({ photoUrl: aboutData.photoUrl || '', paragraphs: [...aboutData.paragraphs] });
    } else {
      const legacy = [aboutData.p1, aboutData.p2, aboutData.p3].filter(Boolean);
      setAboutForm({
        photoUrl: aboutData.photoUrl || '',
        paragraphs: legacy.length > 0 ? legacy : ['', '', '']
      });
    }
  }, [aboutData]);

  // Initialise artForm category when categories become available
  useEffect(() => {
    setArtForm(prev => ({
      ...prev,
      category: prev.category || categories[0] || ''
    }));
  }, [categories]);

  // ─── EARLY RETURN AFTER ALL HOOKS ─────────────────────────────────────────
  if (!isOpen) return null;

  // ─── KANBAN BOARD DRAG & DROP HANDLERS ───────────────────────────────────
  const handleDragStart = (e, painting) => {
    setDraggedPainting(painting);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', painting.id);
  };

  const handleDragOver = (e, categoryName) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCategory !== categoryName) {
      setDragOverCategory(categoryName);
    }
  };

  const handleDragLeave = (categoryName) => {
    if (dragOverCategory === categoryName) {
      setDragOverCategory(null);
    }
  };

  const handleDrop = (e, targetCategory) => {
    e.preventDefault();
    setDragOverCategory(null);
    if (draggedPainting && draggedPainting.category !== targetCategory) {
      savePainting({ ...draggedPainting, category: targetCategory });
      setDraggedPainting(null);
      if (onRefreshData) onRefreshData();
    }
  };

  // ─── GALLERY ORDER RE-SEQUENCE DRAG & DROP HANDLERS ──────────────────────
  const handleOrderDragStart = (e, index) => {
    setDraggedOrderIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleOrderDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverOrderIndex !== index) {
      setDragOverOrderIndex(index);
    }
  };

  const handleOrderDragLeave = (index) => {
    if (dragOverOrderIndex === index) {
      setDragOverOrderIndex(null);
    }
  };

  const handleOrderDrop = (e, dropIndex) => {
    e.preventDefault();
    setDragOverOrderIndex(null);
    setDraggedOrderIndex(null);
    if (draggedOrderIndex !== null && draggedOrderIndex !== dropIndex) {
      const updatedList = [...paintings];
      const [movedItem] = updatedList.splice(draggedOrderIndex, 1);
      updatedList.splice(dropIndex, 0, movedItem);
      savePaintingsOrder(updatedList);
      if (onRefreshData) onRefreshData();
    }
  };

  // ─── AUTH HANDLERS ────────────────────────────────────────────────────────
  const handleLogin = (e) => {
    e.preventDefault();
    if (isRegistering) {
      if (!emailInput || !passwordInput) return;
      registerAdminCredentials(emailInput, passwordInput);
      setIsAuthenticated(true);
      setLoginError(false);
      setEmailInput('');
      setPasswordInput('');
    } else {
      if (loginAdmin(emailInput, passwordInput)) {
        setIsAuthenticated(true);
        setLoginError(false);
        setEmailInput('');
        setPasswordInput('');
      } else {
        setLoginError(true);
      }
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
  };

  // ─── ARTWORK FORM HANDLERS ────────────────────────────────────────────────
  const handleSizeChange = (val) => {
    setArtForm(prev => ({ ...prev, size: val }));
    if (val.trim() && !parseArtworkDimensions(val)) {
      setSizeNotice('Format: [Width] × [Height] cm  (e.g. 60 × 80 cm)');
    } else {
      setSizeNotice('');
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setArtForm(prev => ({ ...prev, imageUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveArtwork = (e) => {
    e.preventDefault();
    if (!artForm.title.trim() || !artForm.imageUrl.trim()) return;

    savePainting({ id: editingId || undefined, ...artForm });
    if (onRefreshData) onRefreshData();
    resetArtForm();
  };

  const resetArtForm = () => {
    setEditingId(null);
    setSizeNotice('');
    setArtForm({
      title: '',
      medium: '',
      size: '',
      category: categories[0] || '',
      imageUrl: ''
    });
  };

  // Edit — also jumps to paintings tab
  const handleEditClick = (art) => {
    setEditingId(art.id);
    setArtForm({
      title: art.title || '',
      medium: art.medium || '',
      size: art.size || '',
      category: art.category || categories[0] || '',
      imageUrl: art.imageUrl || ''
    });
    setActiveTab('paintings');
  };

  const handleDeleteArt = (id) => {
    if (window.confirm('Are you sure you want to delete this artwork?')) {
      deletePainting(id);
      if (onRefreshData) onRefreshData();
    }
  };

  // ─── CATEGORY HANDLERS ────────────────────────────────────────────────────
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatInput.trim()) return;
    addCategory(newCatInput.trim());
    setNewCatInput('');
    if (onRefreshData) onRefreshData();
  };

  const handleDeleteCat = (catName) => {
    if (window.confirm(`Delete category "${catName}"?\nAll paintings in this category will lose their category assignment.`)) {
      deleteCategory(catName);
      if (onRefreshData) onRefreshData();
    }
  };

  // ─── ABOUT ME HANDLER ─────────────────────────────────────────────────────
  const handleSaveAbout = (e) => {
    e.preventDefault();
    // aboutForm.paragraphs is an array — matches AboutMe.jsx expectation
    saveAboutMe({
      photoUrl: aboutForm.photoUrl,
      paragraphs: aboutForm.paragraphs.filter(p => p.trim() !== '')
    });
    if (onRefreshData) onRefreshData();
    alert('About Me saved successfully!');
  };

  const handleParagraphChange = (index, value) => {
    const updated = [...aboutForm.paragraphs];
    updated[index] = value;
    setAboutForm(prev => ({ ...prev, paragraphs: updated }));
  };

  const addParagraph = () => {
    setAboutForm(prev => ({ ...prev, paragraphs: [...prev.paragraphs, ''] }));
  };

  const removeParagraph = (index) => {
    if (aboutForm.paragraphs.length <= 1) return;
    const updated = aboutForm.paragraphs.filter((_, i) => i !== index);
    setAboutForm(prev => ({ ...prev, paragraphs: updated }));
  };

  // ─── HELPERS ──────────────────────────────────────────────────────────────
  const parsedDims = artForm.size ? parseArtworkDimensions(artForm.size) : null;
  const imageUrlSafe = artForm.imageUrl || '';

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="admin-header">
          <h2 className="admin-title">
            <Lock size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Admin CMS Dashboard
          </h2>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="tab-btn"
                title="Logout"
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <LogOut size={16} /> Logout
              </button>
            )}
            <button className="icon-btn" onClick={onClose} aria-label="Close Admin Modal">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── AUTH GATE ── */}
        {!isAuthenticated ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <button
                type="button"
                className={`tab-btn ${!isRegistering ? 'active' : ''}`}
                onClick={() => { setIsRegistering(false); setLoginError(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <LogIn size={16} /> Sign In
              </button>
              <button
                type="button"
                className={`tab-btn ${isRegistering ? 'active' : ''}`}
                onClick={() => { setIsRegistering(true); setLoginError(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <UserPlus size={16} /> Register
              </button>
            </div>

            <h3 style={{ marginBottom: '0.5rem' }}>
              {isRegistering ? 'Register Admin Account' : 'Sign In to Admin CMS'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
              {isRegistering
                ? 'Create your admin credentials to manage portfolio content.'
                : 'Enter your email and password to access the management dashboard.'}
            </p>

            <form
              onSubmit={handleLogin}
              style={{ maxWidth: '360px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <input
                type="email"
                placeholder="Email Address"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                style={{
                  padding: '0.8rem 1rem', borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '1rem'
                }}
              />
              <input
                type="password"
                placeholder={isRegistering ? 'Create Password' : 'Password'}
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={{
                  padding: '0.8rem 1rem', borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '1rem'
                }}
              />

              {loginError && !isRegistering && (
                <p style={{ color: '#E53E3E', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={14} /> Incorrect email or password.
                </p>
              )}

              <button
                type="submit"
                style={{
                  background: 'var(--accent-color)', color: '#fff', border: 'none',
                  padding: '0.85rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '1rem'
                }}
              >
                {isRegistering ? 'Complete Registration' : 'Sign In'}
              </button>
            </form>
          </div>

        ) : (
          /* ── AUTHENTICATED DASHBOARD ── */
          <div>
            {/* Tab Nav */}
            <div className="admin-tabs">
              <button
                className={`tab-btn ${activeTab === 'kanban' ? 'active' : ''}`}
                onClick={() => setActiveTab('kanban')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Columns size={16} /> Category Kanban
              </button>

              <button
                className={`tab-btn ${activeTab === 'order' ? 'active' : ''}`}
                onClick={() => setActiveTab('order')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <ArrowDownUp size={16} /> Gallery Order ({paintings.length})
              </button>

              <button
                className={`tab-btn ${activeTab === 'paintings' ? 'active' : ''}`}
                onClick={() => setActiveTab('paintings')}
              >
                {editingId ? '✏️ Editing…' : `Manage Paintings (${paintings.length})`}
              </button>

              <button
                className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
                onClick={() => setActiveTab('categories')}
              >
                Categories ({categories.length})
              </button>

              <button
                className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
                onClick={() => setActiveTab('about')}
              >
                About Me
              </button>
            </div>

            {/* ── TAB 0: KANBAN ── */}
            {activeTab === 'kanban' && (
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Columns size={18} /> Category Kanban Board
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0 0 1rem' }}>
                  Drag painting cards between columns to re-assign their category in real time.
                </p>

                <div className="kanban-board-container">
                  {categories.map((cat) => {
                    const catPaintings = paintings.filter(p => p.category === cat);
                    const isOver = dragOverCategory === cat;

                    return (
                      <div
                        key={cat}
                        className={`kanban-column ${isOver ? 'drag-over' : ''}`}
                        onDragOver={(e) => handleDragOver(e, cat)}
                        onDragLeave={() => handleDragLeave(cat)}
                        onDrop={(e) => handleDrop(e, cat)}
                      >
                        <div className="kanban-column-header">
                          <h4>
                            <Move size={14} style={{ color: 'var(--accent-color)' }} />
                            {cat}
                          </h4>
                          <span className="kanban-count-badge">{catPaintings.length}</span>
                        </div>

                        <div className="kanban-cards-wrapper">
                          {catPaintings.length === 0 ? (
                            <div className="kanban-empty-drop">
                              Drop paintings here to assign to "{cat}"
                            </div>
                          ) : (
                            catPaintings.map((art) => (
                              <div
                                key={art.id}
                                className="kanban-card"
                                draggable
                                onDragStart={(e) => handleDragStart(e, art)}
                                title="Drag to move to another category"
                              >
                                <div className="kanban-drag-handle">
                                  <GripVertical size={16} />
                                </div>
                                <img src={art.imageUrl} alt={art.title} className="kanban-card-thumb" />
                                <div className="kanban-card-details">
                                  <div className="kanban-card-title">{art.title}</div>
                                  <div className="kanban-card-meta">{art.medium} • {art.size}</div>
                                </div>
                                <div className="art-actions">
                                  <button
                                    className="icon-btn"
                                    onClick={() => handleEditClick(art)}
                                    title="Edit Artwork"
                                    type="button"
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                  <button
                                    className="icon-btn"
                                    onClick={() => handleDeleteArt(art.id)}
                                    title="Delete Artwork"
                                    type="button"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── TAB 1: GALLERY ORDER ── */}
            {activeTab === 'order' && (
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ArrowDownUp size={18} /> Gallery Display Order (Drag to Re-sequence)
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0 0 1rem' }}>
                  Drag cards to rearrange their position in the main gallery. Layout matches the live 3-column page view.
                </p>

                <div className="admin-order-grid fine-art-gallery-grid">
                  {paintings.map((art, index) => {
                    const isDragOver = dragOverOrderIndex === index;
                    const isDragging = draggedOrderIndex === index;
                    const canvasScaleStyle = getRelativeScaleStyle(art.size);

                    return (
                      <div
                        key={art.id}
                        className={`gallery-art-card admin-order-card ${isDragOver ? 'order-drag-over' : ''} ${isDragging ? 'is-dragging' : ''}`}
                        draggable
                        onDragStart={(e) => handleOrderDragStart(e, index)}
                        onDragOver={(e) => handleOrderDragOver(e, index)}
                        onDragLeave={() => handleOrderDragLeave(index)}
                        onDrop={(e) => handleOrderDrop(e, index)}
                        title="Drag to re-order"
                      >
                        <span className="order-badge-pill">#{index + 1}</span>
                        <div className="order-grab-badge">
                          <GripVertical size={14} />
                        </div>

                        <div className="card-canvas-wrapper" style={canvasScaleStyle}>
                          <img
                            src={art.imageUrl}
                            alt={art.title}
                            className="painting-canvas-img loaded"
                          />
                        </div>

                        <div className="art-card-info" style={canvasScaleStyle}>
                          <h4 className="art-title" style={{ fontSize: '1rem' }}>{art.title}</h4>
                          <div className="art-meta-row" style={{ fontSize: '0.76rem' }}>
                            <span className="art-medium">{art.category} • {art.medium}</span>
                            <span className="art-size">{art.size}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── TAB 2: MANAGE PAINTINGS ── */}
            {activeTab === 'paintings' && (
              <div>
                <form className="admin-form" onSubmit={handleSaveArtwork}>
                  <h4 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>
                    {editingId ? '✏️ Edit Artwork' : '＋ Add New Artwork'}
                  </h4>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Artwork Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Garden in Autumn"
                        value={artForm.title}
                        onChange={(e) => setArtForm(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={artForm.category}
                        onChange={(e) => setArtForm(prev => ({ ...prev, category: e.target.value }))}
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Medium / Technique</label>
                      <input
                        type="text"
                        placeholder="e.g. Oil on Canvas"
                        value={artForm.medium}
                        onChange={(e) => setArtForm(prev => ({ ...prev, medium: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Dimensions (Width × Height)</label>
                      <input
                        type="text"
                        placeholder="e.g. 60 × 80 cm"
                        value={artForm.size}
                        onChange={(e) => handleSizeChange(e.target.value)}
                      />
                      {sizeNotice ? (
                        <p style={{ color: '#E53E3E', fontSize: '0.8rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertCircle size={13} /> {sizeNotice}
                        </p>
                      ) : parsedDims ? (
                        <p style={{ color: '#10B981', fontSize: '0.8rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={13} /> {parsedDims.widthCm} cm × {parsedDims.heightCm} cm ✓
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Artwork Image</label>
                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <label
                        className="admin-btn"
                        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Upload size={15} /> Choose File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {imageUrlSafe.startsWith('data:') && (
                        <span style={{ fontSize: '0.82rem', color: '#10B981', fontWeight: 600 }}>
                          ✓ File loaded
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Or paste image URL (e.g. ./paintings/1.jpg)"
                      value={imageUrlSafe}
                      onChange={(e) => setArtForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                    />
                  </div>

                  {imageUrlSafe && (
                    <div style={{
                      width: '130px', height: '130px', borderRadius: '8px', overflow: 'hidden',
                      border: '1px solid var(--border-color)', margin: '0.6rem 0 1.2rem',
                      background: 'var(--bg-secondary)'
                    }}>
                      <img
                        src={imageUrlSafe}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                    <button type="submit" className="admin-btn">
                      <Check size={15} /> {editingId ? 'Update Artwork' : 'Add Artwork'}
                    </button>
                    {editingId && (
                      <button type="button" onClick={resetArtForm} className="tab-btn">
                        ✕ Cancel Edit
                      </button>
                    )}
                  </div>
                </form>

                {/* Existing Artwork List */}
                <div className="artwork-list">
                  <h4 style={{ margin: '1.5rem 0 0.8rem' }}>
                    All Artworks ({paintings.length})
                  </h4>
                  {paintings.map((art) => (
                    <div key={art.id} className={`art-item ${editingId === art.id ? 'is-editing' : ''}`}>
                      <div className="art-info">
                        <img src={art.imageUrl} alt={art.title} />
                        <div>
                          <strong>{art.title}</strong>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {art.category} • {art.medium} • {art.size}
                          </div>
                        </div>
                      </div>
                      <div className="art-actions">
                        <button
                          className="icon-btn"
                          onClick={() => handleEditClick(art)}
                          title="Edit"
                          type="button"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          className="icon-btn"
                          onClick={() => handleDeleteArt(art.id)}
                          title="Delete"
                          type="button"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 3: CATEGORIES ── */}
            {activeTab === 'categories' && (
              <div>
                <form className="admin-form" onSubmit={handleAddCategory} style={{ marginBottom: '2rem' }}>
                  <h4>Add New Category</h4>
                  <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <input
                      type="text"
                      placeholder="e.g. Landscapes"
                      required
                      value={newCatInput}
                      onChange={(e) => setNewCatInput(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button type="submit" className="admin-btn">
                      <Plus size={15} /> Add
                    </button>
                  </div>
                </form>

                <h4>Current Categories</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginTop: '0.8rem' }}>
                  {categories.map((cat) => {
                    const count = paintings.filter(p => p.category === cat).length;
                    return (
                      <div key={cat} className="art-item">
                        <span>
                          <strong>{cat}</strong>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                            ({count} artworks)
                          </span>
                        </span>
                        <button
                          className="icon-btn"
                          onClick={() => handleDeleteCat(cat)}
                          title="Delete Category"
                          type="button"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── TAB 4: ABOUT ME ── */}
            {activeTab === 'about' && (
              <form className="admin-form" onSubmit={handleSaveAbout}>
                <h4 style={{ marginBottom: '1rem' }}>Edit About Me</h4>

                <div className="form-group">
                  <label>Artist Photo URL or upload path</label>
                  <input
                    type="text"
                    placeholder="e.g. ./image.png"
                    value={aboutForm.photoUrl}
                    onChange={(e) => setAboutForm(prev => ({ ...prev, photoUrl: e.target.value }))}
                  />
                  {aboutForm.photoUrl && (
                    <img
                      src={aboutForm.photoUrl}
                      alt="Preview"
                      style={{
                        width: '80px', height: '80px', objectFit: 'cover', borderRadius: '50%',
                        marginTop: '0.6rem', border: '2px solid var(--border-color)'
                      }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                </div>

                <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                  Bio Paragraphs
                </label>

                {aboutForm.paragraphs.map((para, idx) => (
                  <div key={idx} className="form-group" style={{ position: 'relative' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Paragraph {idx + 1}</span>
                      {aboutForm.paragraphs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeParagraph(idx)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#E53E3E', fontSize: '0.8rem', padding: '2px 6px'
                          }}
                          title="Remove paragraph"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </label>
                    <textarea
                      rows="3"
                      value={para}
                      onChange={(e) => handleParagraphChange(idx, e.target.value)}
                      placeholder={`Paragraph ${idx + 1}…`}
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addParagraph}
                  className="tab-btn"
                  style={{ marginBottom: '1.2rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={14} /> Add Paragraph
                </button>

                <br />
                <button type="submit" className="admin-btn">
                  <Check size={15} /> Save Bio
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
