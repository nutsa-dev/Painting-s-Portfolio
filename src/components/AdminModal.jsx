import React, { useState } from 'react';
import { X, Lock, Plus, Trash2, Edit3, Check, LogOut, UserPlus, LogIn, GripVertical, Columns, Move } from 'lucide-react';
import {
  checkAdminAuth,
  loginAdmin,
  logoutAdmin,
  registerAdminCredentials,
  savePainting,
  deletePainting,
  addCategory,
  deleteCategory,
  saveAboutMe
} from '../utils/storage';

export default function AdminModal({
  isOpen,
  onClose,
  paintings,
  categories,
  aboutData,
  onRefreshData
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(checkAdminAuth());
  const [isRegistering, setIsRegistering] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' | 'paintings' | 'categories' | 'about'

  // Kanban Drag & Drop State
  const [draggedPainting, setDraggedPainting] = useState(null);
  const [dragOverCategory, setDragOverCategory] = useState(null);

  // Artwork Form State
  const [editingId, setEditingId] = useState(null);
  const [artForm, setArtForm] = useState({
    title: '',
    medium: '',
    size: '',
    category: categories[0] || 'Still Life',
    imageUrl: ''
  });

  // New Category State
  const [newCatInput, setNewCatInput] = useState('');

  // About Form State
  const [aboutForm, setAboutForm] = useState(aboutData || { photoUrl: '', p1: '', p2: '', p3: '' });

  if (!isOpen) return null;

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
      savePainting({
        ...draggedPainting,
        category: targetCategory
      });
      setDraggedPainting(null);
      if (onRefreshData) onRefreshData();
    }
  };

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

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setArtForm(prev => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveArtwork = (e) => {
    e.preventDefault();
    if (!artForm.title || !artForm.imageUrl) return;

    savePainting({
      id: editingId,
      ...artForm
    });

    onRefreshData();
    resetArtForm();
  };

  const resetArtForm = () => {
    setEditingId(null);
    setArtForm({
      title: '',
      medium: '',
      size: '',
      category: categories[0] || 'Still Life',
      imageUrl: ''
    });
  };

  const handleEditClick = (art) => {
    setEditingId(art.id);
    setArtForm({
      title: art.title,
      medium: art.medium || '',
      size: art.size || '',
      category: art.category || categories[0],
      imageUrl: art.imageUrl
    });
  };

  const handleDeleteArt = (id) => {
    if (window.confirm('Are you sure you want to delete this artwork?')) {
      deletePainting(id);
      onRefreshData();
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatInput.trim()) return;
    addCategory(newCatInput);
    setNewCatInput('');
    onRefreshData();
  };

  const handleDeleteCat = (catName) => {
    if (window.confirm(`Delete category "${catName}"?`)) {
      deleteCategory(catName);
      onRefreshData();
    }
  };

  const handleSaveAbout = (e) => {
    e.preventDefault();
    saveAboutMe(aboutForm);
    onRefreshData();
    alert('About Me details saved successfully!');
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
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

        {!isAuthenticated ? (
          /* Admin Auth Form (Sign In / Sign Up) */
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            {/* Sign In / Sign Up Tabs */}
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
                <UserPlus size={16} /> Sign Up (Register)
              </button>
            </div>

            <h3 style={{ marginBottom: '0.5rem' }}>
              {isRegistering ? 'Register Admin Account' : 'Sign In to Admin CMS'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              {isRegistering
                ? 'Set up your admin email & password to manage portfolio content.'
                : 'Enter your email and password to access the management dashboard.'}
            </p>

            <form onSubmit={handleLogin} style={{ maxWidth: '350px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="email"
                placeholder="Email Address"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                style={{
                  padding: '0.8rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
              />

              <input
                type="password"
                placeholder={isRegistering ? 'Create Password' : 'Password'}
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={{
                  padding: '0.8rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
              />

              {loginError && !isRegistering && (
                <p style={{ color: '#E53E3E', fontSize: '0.9rem' }}>Incorrect email or password. Please try again.</p>
              )}

              <button
                type="submit"
                style={{
                  background: 'var(--accent-color)',
                  color: 'white',
                  border: 'none',
                  padding: '0.8rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {isRegistering ? 'Complete Sign Up' : 'Sign In'}
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard Tabs */
          <div>
            <div className="admin-tabs">
              <button
                className={`tab-btn ${activeTab === 'kanban' ? 'active' : ''}`}
                onClick={() => setActiveTab('kanban')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Columns size={16} /> Kanban Board (Drag & Drop)
              </button>
              <button
                className={`tab-btn ${activeTab === 'paintings' ? 'active' : ''}`}
                onClick={() => setActiveTab('paintings')}
              >
                Manage Paintings ({paintings.length})
              </button>
              <button
                className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
                onClick={() => setActiveTab('categories')}
              >
                Manage Categories ({categories.length})
              </button>
              <button
                className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
                onClick={() => setActiveTab('about')}
              >
                Edit About Me
              </button>
            </div>

            {/* TAB 0: KANBAN BOARD (DRAG AND DROP) */}
            {activeTab === 'kanban' && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Columns size={20} /> Artwork Category Kanban Board
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                      Drag and drop painting cards between categories to re-organize your portfolio in real time.
                    </p>
                  </div>
                </div>

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
                            <Move size={16} style={{ color: 'var(--accent-color)' }} />
                            {cat}
                          </h4>
                          <span className="kanban-count-badge">{catPaintings.length}</span>
                        </div>

                        <div className="kanban-cards-wrapper">
                          {catPaintings.length === 0 ? (
                            <div className="kanban-empty-drop">
                              Drag paintings here to assign to "{cat}"
                            </div>
                          ) : (
                            catPaintings.map((art) => (
                              <div
                                key={art.id}
                                className="kanban-card"
                                draggable={true}
                                onDragStart={(e) => handleDragStart(e, art)}
                                title="Drag to move to another category"
                              >
                                <div className="kanban-drag-handle">
                                  <GripVertical size={18} />
                                </div>

                                <img
                                  src={art.imageUrl}
                                  alt={art.title}
                                  className="kanban-card-thumb"
                                />

                                <div className="kanban-card-details">
                                  <div className="kanban-card-title">{art.title}</div>
                                  <div className="kanban-card-meta">{art.medium} • {art.size}</div>
                                </div>

                                <div className="art-actions">
                                  <button
                                    className="icon-btn"
                                    onClick={() => handleEditArtwork(art)}
                                    title="Edit Artwork"
                                    type="button"
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                  <button
                                    className="icon-btn"
                                    onClick={() => handleDeleteArtwork(art.id)}
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

            {/* TAB 1: PAINTINGS CRUD */}
            {activeTab === 'paintings' && (
              <div>
                <form className="admin-form" onSubmit={handleSaveArtwork}>
                  <h4 style={{ fontSize: '1.2rem' }}>{editingId ? 'Edit Artwork' : 'Add New Artwork'}</h4>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Artwork Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Garden in Autumn"
                        value={artForm.title}
                        onChange={(e) => setArtForm({ ...artForm, title: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={artForm.category}
                        onChange={(e) => setArtForm({ ...artForm, category: e.target.value })}
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
                        onChange={(e) => setArtForm({ ...artForm, medium: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Dimensions / Size</label>
                      <input
                        type="text"
                        placeholder="e.g. 60 × 80 cm"
                        value={artForm.size}
                        onChange={(e) => setArtForm({ ...artForm, size: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Artwork Image (Upload File or Enter Image URL)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      style={{ marginBottom: '0.5rem' }}
                    />
                    <input
                      type="text"
                      placeholder="Or paste image URL (e.g. /paintings/1.jpg)"
                      value={artForm.imageUrl}
                      onChange={(e) => setArtForm({ ...artForm, imageUrl: e.target.value })}
                    />
                  </div>

                  {artForm.imageUrl && (
                    <div style={{ width: '100px', height: '100px', borderRadius: '6px', overflow: 'hidden' }}>
                      <img src={artForm.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <button type="submit" className="admin-btn">
                      {editingId ? 'Update Artwork' : 'Add Artwork'}
                    </button>
                    {editingId && (
                      <button type="button" onClick={resetArtForm} className="tab-btn">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                <div className="artwork-list">
                  <h4 style={{ marginTop: '1.5rem' }}>Existing Artwork List</h4>
                  {paintings.map((art) => (
                    <div key={art.id} className="art-item">
                      <div className="art-info">
                        <img src={art.imageUrl} alt={art.title} />
                        <div>
                          <strong>{art.title}</strong>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {art.category} • {art.medium}
                          </div>
                        </div>
                      </div>

                      <div className="art-actions">
                        <button className="icon-btn" onClick={() => handleEditClick(art)} title="Edit">
                          <Edit3 size={16} />
                        </button>
                        <button className="icon-btn" onClick={() => handleDeleteArt(art.id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: CATEGORIES */}
            {activeTab === 'categories' && (
              <div>
                <form className="admin-form" onSubmit={handleAddCategory} style={{ marginBottom: '2rem' }}>
                  <h4>Add New Category</h4>
                  <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <input
                      type="text"
                      placeholder="Category name (e.g. Landscapes)"
                      required
                      value={newCatInput}
                      onChange={(e) => setNewCatInput(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button type="submit" className="admin-btn">
                      <Plus size={16} /> Add Category
                    </button>
                  </div>
                </form>

                <h4>Current Categories</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
                  {categories.map((cat) => (
                    <div key={cat} className="art-item">
                      <span><strong>{cat}</strong></span>
                      <button className="icon-btn" onClick={() => handleDeleteCat(cat)} title="Delete Category">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: ABOUT ME EDIT */}
            {activeTab === 'about' && (
              <form className="admin-form" onSubmit={handleSaveAbout}>
                <h4>Edit About Me Details</h4>

                <div className="form-group">
                  <label>Artist Photo URL</label>
                  <input
                    type="text"
                    value={aboutForm.photoUrl}
                    onChange={(e) => setAboutForm({ ...aboutForm, photoUrl: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Paragraph 1</label>
                  <textarea
                    rows="3"
                    value={aboutForm.p1}
                    onChange={(e) => setAboutForm({ ...aboutForm, p1: e.target.value })}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Paragraph 2</label>
                  <textarea
                    rows="3"
                    value={aboutForm.p2}
                    onChange={(e) => setAboutForm({ ...aboutForm, p2: e.target.value })}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Paragraph 3</label>
                  <textarea
                    rows="3"
                    value={aboutForm.p3}
                    onChange={(e) => setAboutForm({ ...aboutForm, p3: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" className="admin-btn">
                  <Check size={16} /> Save Bio Changes
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
