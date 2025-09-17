import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Heart, Share2, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/HomeNew.css';

// Default Profile Icon Component
const DefaultProfileIcon = ({ size = 40, className = '' }) => (
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

const Home = () => {
  const [reels, setReels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [likedReels, setLikedReels] = useState(new Set());
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [followingByPartner, setFollowingByPartner] = useState({});

  const videoRefs = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:8000/api/food', {
        withCredentials: true,
        params: {
          sortBy: 'latest',
          limit: 20,
        },
      });

      setReels(response.data.foodFeeds || []);

      // Initialize comments state
      const commentsState = {};
      response.data.foodFeeds?.forEach((reel) => {
        commentsState[reel._id] = reel.comments || [];
      });
      setComments(commentsState);
    } catch (error) {
      setError(error?.response?.data?.message || 'Failed to load reels');
      console.error('Error fetching reels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = useCallback((videoIndex) => {
    const video = videoRefs.current[videoIndex];
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  }, []);

  const incrementViewCount = async (feedId) => {
    try {
      await axios.post(`http://localhost:8000/api/food/${feedId}/view`);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleLike = async (reelId) => {
    if (isLiking) return;

    try {
      setIsLiking(true);
      const response = await axios.post(
        `http://localhost:8000/api/food/${reelId}/like`,
        {},
        { withCredentials: true }
      );

      // Update local state
      setLikedReels((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(reelId)) {
          newSet.delete(reelId);
        } else {
          newSet.add(reelId);
        }
        return newSet;
      });

      // Update reels data
      setReels((prevReels) =>
        prevReels.map((reel) =>
          reel._id === reelId ? { ...reel, likes: response.data.likes } : reel
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      alert(error?.response?.data?.message || 'Failed to like reel');
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async (reelId) => {
    if (!newComment.trim() || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      const response = await axios.post(
        `http://localhost:8000/api/food/${reelId}/comment`,
        { text: newComment },
        { withCredentials: true }
      );

      // Update comments state
      setComments((prev) => ({
        ...prev,
        [reelId]: [...(prev[reelId] || []), response.data.comment],
      }));

      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert(error?.response?.data?.message || 'Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const toggleComments = (reelId) => {
    setShowComments((prev) => ({
      ...prev,
      [reelId]: !prev[reelId],
    }));
  };

  const handleProfileClick = (ownerId) => {
    // Navigate to food partner profile (you might need to create a public profile view)
    navigate(`/foodpartner/public/${ownerId}`);
  };

  // Handle space bar for play/pause
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === 'Space') {
        event.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [togglePlayPause]);

  // Autoplay all videos on mount
  useEffect(() => {
    if (reels.length > 0) {
      reels.forEach((reel, index) => {
        const video = videoRefs.current[index];
        if (video) {
          video.play().catch((error) => {
            console.log('Autoplay was prevented:', error);
          });
          incrementViewCount(reel._id);
        }
      });
    }
  }, [reels]);

  if (isLoading) {
    return (
      <div className='app-container'>
        <div className='loading-container'>
          <div className='loading-spinner'></div>
          <p>Loading delicious reels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='app-container'>
        <div className='error-container'>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={fetchReels} className='retry-button'>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className='app-container'>
        <div className='empty-container'>
          <h2>No reels available</h2>
          <p>Check back later for delicious food content!</p>
        </div>
      </div>
    );
  }

  return (
    <div className='app-container'>
      {/* Header */}
      <header className='header'>
        <h1 className='logo'>FoodReels</h1>
        <div className='nav-links'>
          <a href='/home' className='nav-link active'>
            Home
          </a>
          <button
            className='btn'
            onClick={async () => {
              try {
                await axios.get('http://localhost:8000/api/auth/user/logout', {
                  withCredentials: true,
                });
              } catch (e) {
                // ignore errors on logout
              } finally {
                navigate('/user/login');
              }
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Reels Section */}
      <main className='reels-container'>
        {reels.map((reel, index) => (
          <div key={reel._id} className='reel-item'>
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              src={reel.videoUrl}
              className='reel-video'
              loop
              muted
              playsInline
              onClick={() => togglePlayPause(index)}
              poster={reel.thumbnail}
            />

            <div
              className='reel-overlay'
              onClick={() => togglePlayPause(index)}
            >
              {/* Play/Pause Indicator - will be handled by video state */}

              {/* User info and description */}
              <div
                className='reel-content'
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className='reel-title'>{reel.title}</h2>
                <div
                  className='user-info'
                  onClick={() => handleProfileClick(reel.owner._id)}
                >
                  {reel.owner.profileImage &&
                  reel.owner.profileImage !==
                    'https://via.placeholder.com/150' ? (
                    <img
                      src={reel.owner.profileImage}
                      alt={reel.owner.businessName}
                      className='user-avatar'
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const defaultIcon = e.target.nextSibling;
                        if (defaultIcon) {
                          defaultIcon.style.display = 'flex';
                        }
                      }}
                    />
                  ) : (
                    <DefaultProfileIcon
                      size={40}
                      className='user-avatar default-profile-icon'
                    />
                  )}
                  <div className='user-details'>
                    <span className='user-name'>{reel.owner.businessName}</span>
                    <span className='user-username'>
                      @
                      {reel.owner.businessName
                        .toLowerCase()
                        .replace(/\s+/g, '_')}
                    </span>
                  </div>
                </div>
                <p className='reel-description'>{reel.description}</p>

                {/* Hashtags */}
                {reel.hashtags && reel.hashtags.length > 0 && (
                  <div className='hashtags'>
                    {reel.hashtags.map((tag, tagIndex) => (
                      <span key={tagIndex} className='hashtag'>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div
                className='action-buttons'
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className={`action-button ${
                    likedReels.has(reel._id) ? 'liked' : ''
                  }`}
                  onClick={() => handleLike(reel._id)}
                  disabled={isLiking}
                >
                  <Heart fill={likedReels.has(reel._id) ? '#ff6b6b' : 'none'} />
                  <span className='like-count'>{reel.likes}</span>
                </button>

                {/* Follow */}
                <button
                  className='action-button'
                  onClick={async () => {
                    const partnerId = reel.owner._id;
                    const wasFollowing = !!followingByPartner[partnerId];
                    // Optimistic toggle
                    setFollowingByPartner((prev) => ({
                      ...prev,
                      [partnerId]: !wasFollowing,
                    }));
                    // optional follower count UI not shown on reel card

                    try {
                      const { data } = await axios.post(
                        `http://localhost:8000/api/foodpartner/public/${partnerId}/follow`,
                        {},
                        { withCredentials: true }
                      );

                      // Reconcile with server state
                      setFollowingByPartner((prev) => ({
                        ...prev,
                        [partnerId]: !!data.isFollowing,
                      }));
                      // could reconcile followersCount if displayed
                    } catch (err) {
                      // Revert optimistic state on error
                      setFollowingByPartner((prev) => ({
                        ...prev,
                        [partnerId]: wasFollowing,
                      }));
                      // revert if we were tracking count
                      alert(
                        err?.response?.data?.message ||
                          'You need to login as user to follow'
                      );
                    }
                  }}
                >
                  {followingByPartner[reel.owner._id] ? 'Following' : 'Follow'}
                </button>

                <button
                  className='action-button'
                  onClick={() => toggleComments(reel._id)}
                >
                  <MessageCircle />
                  <span className='comment-count'>
                    {comments[reel._id]?.length || 0}
                  </span>
                </button>

                <button
                  className='action-button'
                  onClick={() => {
                    const url = `${window.location.origin}/foodpartner/public/${reel.owner._id}`;
                    if (navigator.share) {
                      navigator
                        .share({
                          title: reel.title,
                          text: 'Check out this food reel!',
                          url,
                        })
                        .catch(() => {
                          navigator.clipboard?.writeText(url);
                          alert('Link copied to clipboard');
                        });
                    } else {
                      navigator.clipboard?.writeText(url);
                      alert('Link copied to clipboard');
                    }
                  }}
                >
                  <Share2 />
                </button>
              </div>

              {/* Comments Section */}
              {showComments[reel._id] && (
                <div
                  className='comments-section'
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className='comments-list'>
                    {comments[reel._id]?.map((comment, commentIndex) => (
                      <div key={commentIndex} className='comment-item'>
                        <div className='comment-user'>
                          {comment.user.avatar &&
                          comment.user.avatar !==
                            'https://via.placeholder.com/150' ? (
                            <img
                              src={comment.user.avatar}
                              alt={comment.user.fullName}
                              className='comment-avatar'
                            />
                          ) : (
                            <DefaultProfileIcon
                              size={24}
                              className='comment-avatar'
                            />
                          )}
                          <span className='comment-username'>
                            {comment.user.fullName}
                          </span>
                        </div>
                        <p className='comment-text'>{comment.text}</p>
                      </div>
                    ))}
                    {(!comments[reel._id] ||
                      comments[reel._id].length === 0) && (
                      <p className='no-comments'>
                        No comments yet. Be the first to comment!
                      </p>
                    )}
                  </div>

                  <div className='comment-input'>
                    <input
                      type='text'
                      placeholder='Add a comment...'
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleComment(reel._id);
                        }
                      }}
                      disabled={isSubmittingComment}
                    />
                    <button
                      onClick={() => handleComment(reel._id)}
                      disabled={!newComment.trim() || isSubmittingComment}
                      className='comment-submit-btn'
                    >
                      {isSubmittingComment ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default Home;
