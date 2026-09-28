import React from 'react';

const AddMenuBaseInfo = ({ baseInfo, setBaseInfo, categories, hasAttemptedSubmit, errors }) => {
  return (
    <div className="ami-flex-row">
      <div className="ami-image-upload-container">
        <label className="ami-label">Item Image *</label>
        <div className={`ami-image-upload-box ${hasAttemptedSubmit && errors.image ? 'is-invalid-border' : ''}`}>
          <input
            type="file"
            accept="image/*"
            className="ami-image-input"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setBaseInfo({ ...baseInfo, image: e.target.files[0] });
              }
            }}
          />
          {baseInfo.image && (
            <img src={URL.createObjectURL(baseInfo.image)} alt="Preview" className="ami-image-preview" />
          )}
          <div className={`ami-image-placeholder ${baseInfo.image ? 'has-image' : ''}`}>
            <i className="bi bi-camera"></i>
            <span>{baseInfo.image ? 'Change Image' : 'Upload'}</span>
          </div>
        </div>
        {hasAttemptedSubmit && errors.image && <p className="ami-error-text" style={{ marginTop: '0.25rem' }}>{errors.image}</p>}
      </div>

      <div className="ami-flex-fields">
        <div className="ami-section" style={{ marginBottom: 0 }}>
          <label className="ami-label">Item Name *</label>
          <input
            type="text"
            className={`ami-input ${hasAttemptedSubmit && errors.name ? 'is-invalid' : ''}`}
            placeholder="Enter menu item name"
            value={baseInfo.name}
            onChange={(e) => setBaseInfo({ ...baseInfo, name: e.target.value })}
          />
          {hasAttemptedSubmit && errors.name && <p className="ami-error-text">{errors.name}</p>}
        </div>
        <div className="ami-section" style={{ marginBottom: 0 }}>
          <label className="ami-label">Category *</label>
          <select
            className={`ami-select ${hasAttemptedSubmit && errors.category ? 'is-invalid' : ''}`}
            value={baseInfo.category}
            onChange={(e) => setBaseInfo({ ...baseInfo, category: e.target.value })}
          >
            <option value="">Select category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
          </select>
          {hasAttemptedSubmit && errors.category && <p className="ami-error-text">{errors.category}</p>}
        </div>
        <div className="ami-section" style={{ marginBottom: 0, marginTop: '0.5rem' }}>
          <label className="ami-toggle-container">
            <input
              type="checkbox"
              style={{ display: 'none' }}
              checked={baseInfo.isAvailable}
              onChange={(e) => setBaseInfo({ ...baseInfo, isAvailable: e.target.checked })}
            />
            <span className="ami-toggle-switch">
              <span className="ami-toggle-slider"></span>
            </span>
            <span className="ami-toggle-label">Available for sale</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default AddMenuBaseInfo;
