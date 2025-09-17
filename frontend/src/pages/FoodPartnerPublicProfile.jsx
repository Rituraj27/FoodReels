import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Share2 } from 'lucide-react';
import axios from 'axios';
import '../styles/FoodPartnerProfile.css';

// Default Profile Icon Component
const DefaultProfileIcon = ({ size = 120, className = '' }) => (
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

const FoodPartnerPublicProfile = () => {
  const { partnerId } = useParams();
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [reels, setReels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [likedReels, setLikedReels] = useState(new Set());
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const fetchPartnerData = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:8000/api/foodpartner/public/${partnerId}`
      );
      setPartner(data.profile);
      setFollowersCount(
        (data.profile &&
          data.profile.followers &&
          data.profile.followers.length) ||
          0
      );
    } catch (error) {
      console.error('Error fetching partner data:', error);
      setError(
        error?.response?.data?.message || 'Failed to load partner profile'
      );
    }
  }, [partnerId]);

  const fetchPartnerReels = useCallback(async () => {
    try {
      // Use public feeds endpoint (no auth required)
      const response = await axios.get(
        'http://localhost:8000/api/food/public',
        {
          params: {
            limit: 20,
            sortBy: 'latest',
            owner: partnerId,
          },
        }
      );

      setReels(response.data.foodFeeds || []);
    } catch (error) {
      console.error('Error fetching partner reels:', error);
    } finally {
      setIsLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    fetchPartnerData();
    fetchPartnerReels();
  }, [partnerId, fetchPartnerData, fetchPartnerReels]);

  const toggleFollow = async () => {
    try {
      // optimistic
      setIsFollowing((prev) => !prev);
      setFollowersCount((prev) => prev + (isFollowing ? -1 : 1));

      const { data } = await axios.post(
        `http://localhost:8000/api/foodpartner/public/${partnerId}/follow`,
        {},
        { withCredentials: true }
      );

      setIsFollowing(!!data.isFollowing);
      if (typeof data.followersCount === 'number') {
        setFollowersCount(data.followersCount);
      }
    } catch (err) {
      // revert
      setIsFollowing((prev) => !prev);
      setFollowersCount((prev) => prev + (isFollowing ? 1 : -1));
      alert(
        err?.response?.data?.message || 'You need to login as user to follow'
      );
    }
  };

  const handleLike = async (reelId) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/food/${reelId}/like`,
        {},
        { withCredentials: true }
      );

      setLikedReels((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(reelId)) {
          newSet.delete(reelId);
        } else {
          newSet.add(reelId);
        }
        return newSet;
      });

      setReels((prevReels) =>
        prevReels.map((reel) =>
          reel._id === reelId ? { ...reel, likes: response.data.likes } : reel
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    if (typeof addr === 'string') return addr;
    try {
      const { street, city, state, pincode } = addr;
      return (
        [street, city, state].filter(Boolean).join(', ') +
        (pincode ? ` - ${pincode}` : '')
      );
    } catch {
      return addr;
    }
  };

  if (isLoading) {
    return (
      <div className='profile-container'>
        <div className='loading-message'>Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='profile-container'>
        <div className='error-message'>{error}</div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className='profile-container'>
        <div className='error-message'>Profile not found</div>
      </div>
    );
  }

  return (
    <div className='profile-container'>
      {/* Back Button */}
      <div className='back-button-container'>
        <button className='back-button' onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back to Reels
        </button>
      </div>

      <div className='profile-top'>
        <div className='avatar-wrapper'>
          {partner.profileImage &&
          partner.profileImage !== 'https://via.placeholder.com/150' ? (
            <img
              src={partner.profileImage}
              alt={partner.businessName}
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
            size={120}
            className='default-profile-icon'
            style={{
              display:
                partner.profileImage &&
                partner.profileImage !== 'https://via.placeholder.com/150'
                  ? 'none'
                  : 'flex',
            }}
          />
        </div>

        <div className='profile-info'>
          <h2>{partner.businessName}</h2>
          <p className='owner-name'>Owner: {partner.owner}</p>

          <div className='stats-row'>
            <div className='stat-box'>
              <h3>{followersCount}</h3>
              <p>Followers</p>
            </div>
            <div className='stat-box'>
              <h3>{partner.totalVideos || reels.length}</h3>
              <p>Videos</p>
            </div>
            <div className='stat-box'>
              <h3>{partner.totalLikes || 0}</h3>
              <p>Total Likes</p>
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <button className='btn-follow' onClick={toggleFollow}>
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>
      </div>

      <div className='profile-body'>
        <div className='profile-section'>
          <h3>About</h3>
          <p>{partner.businessDescription || 'No description provided.'}</p>

          <div className='business-details'>
            <p>
              <strong>Email:</strong> {partner.businessEmail}
            </p>
            <p>
              <strong>Phone:</strong> {partner.phoneNumber}
            </p>
            <p>
              <strong>Address:</strong> {formatAddress(partner.address)}
            </p>
          </div>

          <div className='specialties'>
            {(partner.specialties || []).map((specialty, i) => (
              <div key={i} className='chip'>
                {specialty}
              </div>
            ))}
          </div>
        </div>

        <div className='profile-section'>
          <h3>Latest Reels</h3>
          <div className='recent-uploads-grid'>
            {reels.length > 0 ? (
              reels.slice(0, 6).map((reel) => (
                <div key={reel._id} className='upload-card'>
                  <video
                    src={reel.videoUrl}
                    muted
                    playsInline
                    preload='metadata'
                    poster={reel.thumbnail || ''}
                    style={{ width: '100%', height: 160, objectFit: 'cover' }}
                  />
                  <div className='upload-info'>
                    <h4>{reel.title}</h4>
                    <div className='reel-stats'>
                      <button
                        className={`stat-button ${
                          likedReels.has(reel._id) ? 'liked' : ''
                        }`}
                        onClick={() => handleLike(reel._id)}
                      >
                        <Heart
                          size={14}
                          fill={likedReels.has(reel._id) ? '#ff6b6b' : 'none'}
                        />
                        <span>{reel.likes}</span>
                      </button>
                      <button className='stat-button'>
                        <MessageCircle size={14} />
                        <span>{reel.comments?.length || 0}</span>
                      </button>
                      <button className='stat-button'>
                        <Share2 size={14} />
                      </button>
                    </div>
                    <p>{new Date(reel.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No reels available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodPartnerPublicProfile;
