import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/shared.css';
import '../styles/FoodUploadForm.css';

function FoodUploadForm() {
  const [businessName, setBusinessName] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    cuisine: '',
    preparationTime: '',
    difficulty: 'medium',
    isVegetarian: false,
    ingredients: [{ item: '', quantity: '' }],
    steps: [''],
    hashtags: [''],
  });
  const [videoFile, setVideoFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await axios.get(
          'http://localhost:8000/api/foodpartner/profile',
          { withCredentials: true }
        );
        if (mounted && data?.businessName) {
          setBusinessName(data.businessName);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleVideoChange = (e) => {
    if (e.target.files?.[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      [field]: value,
    };
    setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { item: '', quantity: '' }],
    }));
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData((prev) => ({ ...prev, steps: newSteps }));
  };

  const addStep = () => {
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, ''],
    }));
  };

  const handleHashtagChange = (index, value) => {
    const newHashtags = [...formData.hashtags];
    newHashtags[index] = value;
    setFormData((prev) => ({ ...prev, hashtags: newHashtags }));
  };

  const addHashtag = () => {
    setFormData((prev) => ({
      ...prev,
      hashtags: [...prev.hashtags, ''],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setUploadProgress(0);
    setUploadSuccess(false);

    try {
      const form = new FormData();
      form.append('video', videoFile);
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('category', formData.category);
      form.append('cuisine', formData.cuisine);
      form.append('preparationTime', formData.preparationTime);
      form.append('difficulty', formData.difficulty);
      form.append('isVegetarian', formData.isVegetarian);
      form.append('ingredients', JSON.stringify(formData.ingredients));
      form.append('steps', JSON.stringify(formData.steps));
      form.append('hashtags', JSON.stringify(formData.hashtags));

      const response = await axios.post(
        'http://localhost:8000/api/food/create',
        form,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
          timeout: 60000, // 60 seconds
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          },
        }
      );

      if (response.data && (response.data.food || response.data.url)) {
        setUploadSuccess(true);
        // Reset form
        setFormData({
          title: '',
          description: '',
          category: '',
          cuisine: '',
          preparationTime: '',
          difficulty: 'medium',
          isVegetarian: false,
          ingredients: [{ item: '', quantity: '' }],
          steps: [''],
          hashtags: [''],
        });
        setVideoFile(null);
        // Show success notification
        alert('Food reel uploaded successfully! Your video is now available.');
      } else {
        throw new Error('Upload failed: Invalid server response');
      }
    } catch (error) {
      // Prefer server-provided message when available
      const serverMessage = error?.response?.data?.message;
      const status = error?.response?.status;
      if (status === 408) {
        setError(serverMessage || 'Upload timed out. Please try again.');
      } else if (status === 502) {
        setError(serverMessage || 'Network error contacting storage provider.');
      } else if (error.code === 'ECONNABORTED') {
        setError(
          'Upload timed out on the client. Please try again with a smaller file or better connection.'
        );
      } else {
        setError(
          serverMessage || error.message || 'Failed to upload food reel'
        );
      }
      setUploadSuccess(false);
      setIsLoading(false);
      setUploadProgress(0);
    } finally {
      // Keep the success state visible for a short moment before clearing progress
      if (uploadSuccess) {
        setTimeout(() => {
          setUploadProgress(0);
          setIsLoading(false);
        }, 1500);
      } else {
        setUploadProgress(0);
        setIsLoading(false);
      }
    }
  };

  return (
    <div className='upload-form-container'>
      <h2>
        {businessName
          ? `${businessName} — Upload New Food Reel`
          : 'Upload New Food Reel'}
      </h2>
      {error && <div className='error-message'>{error}</div>}

      <form onSubmit={handleSubmit} className='upload-form'>
        <div className='form-section'>
          <h3>Upload Video</h3>
          <div className='file-input-container'>
            <label className='file-upload-label'>
              <input
                type='file'
                accept='video/*'
                onChange={handleVideoChange}
                required
              />
              <svg
                className='file-upload-icon'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                <polyline points='17 8 12 3 7 8' />
                <line x1='12' y1='3' x2='12' y2='15' />
              </svg>
              <span className='file-upload-text'>
                {videoFile
                  ? videoFile.name
                  : 'Click to upload video or drag and drop'}
              </span>
            </label>
          </div>
        </div>

        <div className='form-section'>
          <h3>Basic Details</h3>
          <div className='form-row'>
            <label className='label' htmlFor='title'>
              Title
            </label>
            <input
              id='title'
              className='input'
              type='text'
              name='title'
              value={formData.title}
              onChange={handleInputChange}
              placeholder='Enter your food reel title'
              required
            />
          </div>

          <div className='form-row'>
            <label className='label' htmlFor='description'>
              Description
            </label>
            <textarea
              id='description'
              className='textarea'
              name='description'
              value={formData.description}
              onChange={handleInputChange}
              placeholder='Describe your food reel'
              required
            />
          </div>
        </div>

        <div className='form-section'>
          <h3>Recipe Details</h3>
          <div className='form-row'>
            <label className='label' htmlFor='category'>
              Category
            </label>
            <select
              id='category'
              className='input'
              name='category'
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value=''>Select a category</option>
              <option value='appetizer'>Appetizer</option>
              <option value='main-course'>Main Course</option>
              <option value='dessert'>Dessert</option>
              <option value='beverage'>Beverage</option>
              <option value='snack'>Snack</option>
              <option value='breakfast'>Breakfast</option>
              <option value='street-food'>Street Food</option>
            </select>
          </div>

          <div className='form-row'>
            <label className='label' htmlFor='cuisine'>
              Cuisine
            </label>
            <input
              id='cuisine'
              className='input'
              type='text'
              name='cuisine'
              value={formData.cuisine}
              onChange={handleInputChange}
              placeholder='e.g., Indian, Italian, Chinese'
              required
            />
          </div>

          <div className='form-row'>
            <label className='label' htmlFor='preparationTime'>
              Preparation Time (minutes)
            </label>
            <input
              id='preparationTime'
              className='input'
              type='number'
              name='preparationTime'
              value={formData.preparationTime}
              onChange={handleInputChange}
              placeholder='Enter preparation time in minutes'
              required
            />
          </div>

          <div className='form-row'>
            <label className='label' htmlFor='difficulty'>
              Difficulty Level
            </label>
            <select
              id='difficulty'
              className='input'
              name='difficulty'
              value={formData.difficulty}
              onChange={handleInputChange}
            >
              <option value='easy'>Easy</option>
              <option value='medium'>Medium</option>
              <option value='hard'>Hard</option>
            </select>
          </div>

          <div className='form-row'>
            <label className='checkbox-label'>
              <input
                type='checkbox'
                name='isVegetarian'
                checked={formData.isVegetarian}
                onChange={handleInputChange}
              />
              Vegetarian Recipe
            </label>
          </div>
        </div>

        <div className='form-section'>
          <h3>Ingredients</h3>
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className='ingredient-row'>
              <input
                type='text'
                className='input'
                placeholder='Ingredient name'
                value={ingredient.item}
                onChange={(e) =>
                  handleIngredientChange(index, 'item', e.target.value)
                }
                required
              />
              <input
                type='text'
                className='input'
                placeholder='Amount'
                value={ingredient.quantity}
                onChange={(e) =>
                  handleIngredientChange(index, 'quantity', e.target.value)
                }
                required
              />
            </div>
          ))}
          <button
            type='button'
            onClick={addIngredient}
            className='btn-secondary'
          >
            + Add Ingredient
          </button>
        </div>

        <div className='form-section'>
          <h3>Cooking Steps</h3>
          {formData.steps.map((step, index) => (
            <div key={index} className='form-row'>
              <textarea
                className='textarea'
                placeholder={`Step ${index + 1}: Describe the cooking process`}
                value={step}
                onChange={(e) => handleStepChange(index, e.target.value)}
                required
              />
            </div>
          ))}
          <button type='button' onClick={addStep} className='btn-secondary'>
            + Add Step
          </button>
        </div>

        <div className='form-section'>
          <h3>Hashtags</h3>
          <div className='hashtags-grid'>
            {formData.hashtags.map((hashtag, index) => (
              <div key={index} className='form-row'>
                <input
                  type='text'
                  className='input'
                  placeholder='#foodreels'
                  value={hashtag}
                  onChange={(e) => handleHashtagChange(index, e.target.value)}
                />
              </div>
            ))}
          </div>
          <button type='button' onClick={addHashtag} className='btn-secondary'>
            + Add Hashtag
          </button>
        </div>

        {uploadProgress > 0 && (
          <div className='upload-progress'>
            <div
              className='progress-bar'
              style={{ width: `${uploadProgress}%` }}
            >
              {uploadProgress}%
            </div>
          </div>
        )}

        {uploadSuccess && (
          <div className='success-message'>
            Upload completed successfully! Your video is now available.
          </div>
        )}

        <div className='form-actions'>
          <button type='submit' className='btn-primary' disabled={isLoading}>
            {isLoading ? `Uploading... ${uploadProgress}%` : 'Upload Food Reel'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FoodUploadForm;
