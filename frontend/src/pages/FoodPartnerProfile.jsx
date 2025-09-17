import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/shared.css';
import '../styles/FoodPartnerProfile.css';

// Default Profile Icon Component
const DefaultProfileIcon = ({ size = 128, className = '' }) => (
  <div
    className={`default-profile-icon ${className}`}
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: '#4a5568',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#a0aec0',
      fontSize: size * 0.4,
      fontWeight: 'bold',
    }}
  >
    👤
  </div>
);

function FoodPartnerProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    businessName: '',
    owner: '',
    businessEmail: '',
    phoneNumber: '',
    address: '',
    profileImage: '',
    followers: [],
    totalVideos: 0,
    totalLikes: 0,
    recentUploads: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editState, setEditState] = useState({
    businessDescription: '',
    specialties: '',
    profileImageFile: null,
    profileImagePreview: null,
  });
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8000/api/foodpartner/profile',
        { withCredentials: true }
      );
      setProfile(response.data);
      setEditState((s) => ({
        ...s,
        businessDescription: response.data.businessDescription || '',
        specialties: (response.data.specialties || []).join(', '),
      }));
    } catch (error) {
      setError(error?.response?.data?.message || 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    if (typeof addr === 'string') return addr;
    // addr may be an object { street, city, state, pincode }
    try {
      const { street, city, state, pincode } = addr;
      return (
        [street, city, state].filter(Boolean).join(', ') +
        (pincode ? ` - ${pincode}` : '')
      );
    } catch {
      return '';
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className='error-message'>{error}</div>;

  return (
    <div className='profile-container'>
      <div className='profile-top'>
        <div className='avatar-wrapper'>
          {profile.profileImage &&
          profile.profileImage !== 'https://via.placeholder.com/150' ? (
            <img
              src={profile.profileImage}
              alt='Profile'
              onError={(e) => {
                e.target.style.display = 'none';
                const defaultIcon = e.target.parentElement.querySelector(
                  '.default-profile-icon'
                );
                if (defaultIcon) {
                  defaultIcon.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <DefaultProfileIcon
            size={128}
            className='default-profile-icon'
            style={{
              display:
                profile.profileImage &&
                profile.profileImage !== 'https://via.placeholder.com/150'
                  ? 'none'
                  : 'flex',
            }}
          />
        </div>

        <div className='profile-info'>
          <h2>{profile.businessName}</h2>
          <p className='owner-name'>Owner: {profile.owner}</p>

          <div className='stats-row'>
            <div className='stat-box'>
              <h3>{profile.followers ? profile.followers.length : 0}</h3>
              <p>Followers</p>
            </div>
            <div className='stat-box'>
              <h3>{profile.totalVideos || 0}</h3>
              <p>Videos</p>
            </div>
            <div className='stat-box'>
              <h3>{profile.totalLikes || 0}</h3>
              <p>Total Likes</p>
            </div>
          </div>
        </div>

        <div className='profile-actions'>
          <div style={{ textAlign: 'right' }}>
            <button
              className='btn-edit'
              style={{ marginRight: 8 }}
              onClick={async () => {
                try {
                  await axios.get(
                    'http://localhost:8000/api/auth/food-partner/logout',
                    { withCredentials: true }
                  );
                } catch {
                  // ignore
                } finally {
                  navigate('/foodpartner/login');
                }
              }}
            >
              Logout
            </button>
            <button className='btn-edit' onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className='profile-body'>
        <div className='profile-section'>
          <h3>About</h3>
          {isEditing ? (
            <div>
              <textarea
                value={editState.businessDescription}
                onChange={(e) =>
                  setEditState((s) => ({
                    ...s,
                    businessDescription: e.target.value,
                  }))
                }
                rows={4}
                style={{ width: '100%', padding: 8 }}
              />

              <div style={{ marginTop: 8 }}>
                <label>Specialties (comma separated)</label>
                <input
                  type='text'
                  value={editState.specialties}
                  onChange={(e) =>
                    setEditState((s) => ({ ...s, specialties: e.target.value }))
                  }
                  style={{ width: '100%', padding: 8, marginTop: 4 }}
                />
              </div>

              <div className='image-upload-section'>
                <div className='image-upload-group'>
                  <h4>Profile Image</h4>
                  <div className='image-upload-container'>
                    <div className='current-image'>
                      {editState.profileImagePreview ? (
                        <img
                          src={editState.profileImagePreview}
                          alt='profile preview'
                          className='preview-image profile-preview'
                        />
                      ) : profile.profileImage &&
                        profile.profileImage !==
                          'https://via.placeholder.com/150' ? (
                        <img
                          src={profile.profileImage}
                          alt='current profile'
                          className='current-image-display profile-preview'
                        />
                      ) : (
                        <DefaultProfileIcon
                          size={80}
                          className='profile-preview'
                        />
                      )}
                    </div>
                    <div className='upload-controls'>
                      <label className='file-input-label'>
                        <span className='upload-btn'>Choose Profile Image</span>
                        <input
                          type='file'
                          accept='image/*'
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setEditState((s) => ({
                                ...s,
                                profileImageFile: file,
                                profileImagePreview: URL.createObjectURL(file),
                              }));
                            }
                          }}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <p className='upload-hint'>
                        Recommended: 400x400px, JPG/PNG
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {uploadError && (
                <div
                  className='upload-error'
                  style={{
                    color: '#ff6b6b',
                    fontSize: '0.9rem',
                    marginTop: '12px',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    border: '1px solid rgba(255, 107, 107, 0.2)',
                    borderRadius: '6px',
                  }}
                >
                  {uploadError}
                </div>
              )}

              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button
                  className='btn-edit'
                  disabled={isUploading}
                  onClick={async () => {
                    // Submit updates
                    setIsUploading(true);
                    setUploadError('');

                    try {
                      const form = new FormData();
                      form.append(
                        'businessDescription',
                        editState.businessDescription
                      );
                      form.append('specialties', editState.specialties);

                      if (editState.profileImageFile) {
                        // Validate file size (max 5MB)
                        if (editState.profileImageFile.size > 5 * 1024 * 1024) {
                          throw new Error(
                            'Profile image size must be less than 5MB'
                          );
                        }
                        // Validate file type
                        if (
                          !editState.profileImageFile.type.startsWith('image/')
                        ) {
                          throw new Error(
                            'Profile image must be a valid image file'
                          );
                        }
                        form.append('profileImage', editState.profileImageFile);
                      }

                      const res = await axios.put(
                        'http://localhost:8000/api/foodpartner/profile',
                        form,
                        {
                          withCredentials: true,
                          headers: { 'Content-Type': 'multipart/form-data' },
                        }
                      );

                      setProfile((p) => ({ ...p, ...res.data.profile }));
                      setIsEditing(false);
                      setEditState({
                        businessDescription: '',
                        specialties: '',
                        profileImageFile: null,
                        profileImagePreview: null,
                      });
                    } catch (err) {
                      const errorMessage =
                        err?.response?.data?.message ||
                        err?.message ||
                        'Failed to update profile';
                      setUploadError(errorMessage);
                    } finally {
                      setIsUploading(false);
                    }
                  }}
                >
                  {isUploading ? 'Saving...' : 'Save'}
                </button>

                <button
                  className='btn-edit'
                  disabled={isUploading}
                  onClick={() => {
                    setIsEditing(false);
                    setUploadError('');
                    setEditState({
                      businessDescription: profile.businessDescription || '',
                      specialties: (profile.specialties || []).join(', '),
                      profileImageFile: null,
                      profileImagePreview: null,
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p>{profile.businessDescription || 'No description provided.'}</p>
          )}

          <div className='business-details'>
            <p>
              <strong>Email:</strong> {profile.businessEmail}
            </p>
            <p>
              <strong>Phone:</strong> {profile.phoneNumber}
            </p>
            <p>
              <strong>Address:</strong> {formatAddress(profile.address)}
            </p>
          </div>

          {/* <div className='specialties'>
            {(profile.specialties || []).map((s, i) => (
              <div key={i} className='chip'>
                {s}
              </div>
            ))}
          </div> */}

          {/* <div style={{ marginTop: 12 }}>
            <h4>Followers</h4>
            <div className='followers-list'>
              {(profile.followers || []).map((f) => (
                <div key={f._id} className='follower'>
                  <img
                    src={f.avatar || 'https://via.placeholder.com/150'}
                    alt={f.fullName}
                  />
                  <div style={{ fontSize: 0.9, color: '#e6e6e6' }}>
                    {f.fullName}
                  </div>
                </div>
              ))}
            </div>
          </div> */}
        </div>

        <div className='profile-section'>
          <h3>Recent Uploads</h3>
          <div className='recent-uploads-grid'>
            {profile.recentUploads && profile.recentUploads.length > 0 ? (
              profile.recentUploads.map((upload) => (
                <div key={upload._id} className='upload-card'>
                  {upload.videoUrl ? (
                    <video
                      src={upload.videoUrl}
                      muted
                      playsInline
                      preload='metadata'
                      poster={upload.thumbnail || ''}
                      style={{ width: '100%', height: 160, objectFit: 'cover' }}
                    />
                  ) : (
                    <img src={upload.thumbnail} alt={upload.title} />
                  )}
                  <div className='upload-info'>
                    <h4>{upload.title}</h4>
                    <p>
                      {upload.likes} likes •{' '}
                      {new Date(upload.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p>No uploads yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodPartnerProfile;
