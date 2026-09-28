import React from 'react';

const EditMenuBaseInfo = ({ 
  baseInfo, 
  setBaseInfo, 
  item, 
  categories, 
  hasAttemptedSubmit, 
  errors 
}) => {
  return (
    <div className="emi-flex-row">
      <div className="emi-image-upload-container">
        <label className="emi-label">Item Image</label>
        <div className="emi-image-upload-box">
          <input
            type="file"
            accept="image/*"
            className="emi-image-input"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setBaseInfo({ ...baseInfo, image: e.target.files[0] });
              }
            }}
          />
          {baseInfo.image ? (
            <img src={URL.createObjectURL(baseInfo.image)} alt="Preview" className="emi-image-preview" />
          ) : item?.image_url ? (
            <img src={item.image_url} alt="Current" className="emi-image-preview" />
          ) : null}

          <div className={`emi-image-placeholder ${(baseInfo.image || item?.image_url) ? 'has-image' : ''}`}>
            <i className="bi bi-camera"></i>
            <span>{(baseInfo.image || item?.image_url) ? 'Change Image' : 'Upload'}</span>
          </div>
        </div>
      </div>

      <div className="emi-flex-fields">
        <div className="emi-section" style={{ marginBottom: 0 }}>
          <label className="emi-label">Item Name *</label>
          <input
            type="text"
            className={`emi-input ${hasAttemptedSubmit && errors.name ? 'is-invalid' : ''}`}
            placeholder="Enter menu item name"
            value={baseInfo.name}
            onChange={(e) => setBaseInfo({ ...baseInfo, name: e.target.value })}
          />
          {hasAttemptedSubmit && errors.name && <p className="emi-error-text">{errors.name}</p>}
        </div>
        <div className="emi-section" style={{ marginBottom: 0 }}>
          <label className="emi-label">Category *</label>
          <select
            className={`emi-select ${hasAttemptedSubmit && errors.category ? 'is-invalid' : ''}`}
            value={baseInfo.category}
            onChange={(e) => setBaseInfo({ ...baseInfo, category: e.target.value })}
          >
            <option value="">Select category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
          </select>
          {hasAttemptedSubmit && errors.category && <p className="emi-error-text">{errors.category}</p>}
        </div>
        <div className="emi-section" style={{ marginBottom: 0, marginTop: '0.5rem' }}>
          <label className="emi-toggle-container">
            <input
              type="checkbox"
              style={{ display: 'none' }}
              checked={baseInfo.isAvailable}
              onChange={(e) => setBaseInfo({ ...baseInfo, isAvailable: e.target.checked })}
            />
            <span className="emi-toggle-switch">
              <span className="emi-toggle-slider"></span>
            </span>
            <span className="emi-toggle-label">Available for sale</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default EditMenuBaseInfo;
