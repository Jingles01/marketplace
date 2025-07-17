import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import Button from "../components/Button.jsx";

const EditListingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        condition: '',
        zipCode: ''
    });
    const [image, setImage] = useState(null);
    const [existingImageUrl, setExistingImageUrl] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState('');

    const categories = [
        "Electronics", "Clothing", "Home & Garden", "Sports", "Toys",
        "Books", "Vehicles", "Furniture", "Other"
    ];

    const conditions = [
        "New", "Like New", "Good", "Fair", "Poor"
    ];

    const inputStyles = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
    const labelStyles = "block text-sm font-medium text-gray-700";

    useEffect(() => {
        const getListingDetails = async () => {
            try {
                const API_URL = config.apiUrl || 'http://localhost:3546/api';
                const response = await axios.get(`${API_URL}/listings/${id}`);
                setFormData(response.data);
                const listing = response.data;

                setFormData({
                    title: listing.title,
                    description: listing.description,
                    price: listing.price,
                    category: listing.category,
                    condition: listing.condition,
                    zipCode: listing.location?.zipCode
                });
                if (listing.images && listing.images.length > 0) {
                    setExistingImageUrl(listing.images[0].url);
                }

            } catch (error) {
                setError("Failed to load listing details");
            }
        };

        getListingDetails();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError("Invalid file type. Only images are allowed.");
                e.target.value = null;
                setImage(null);
                setImagePreview('');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError("Image size exceeds 5MB limit.");
                e.target.value = null;
                setImage(null);
                setImagePreview('');
                return;
            }
            setImage(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setError('');
        } else {
            setImage(null);
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const API_URL = config.apiUrl || 'http://localhost:3546/api';
            const data = new FormData();

            Object.keys(formData).forEach(key => {data.append(key, formData[key]);});
            if(image) data.append('image', image);

            await axios.put(`${API_URL}/listings/${id}`, data, {                headers: {'Content-Type': 'multipart/form-data'}
            });
            navigate(`/listings/${id}`);
        } catch (err) {
            setError( "Failed to update listing");
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this listing?')) {
            try {
                const API_URL = config.apiUrl || 'http://localhost:3546/api';
                await axios.delete(`${API_URL}/listings/${id}`);
                navigate('/');
            } catch (err) {
                setError(err.response?.data?.error || "Failed to delete listing");
            }
        }
    };

    if (error) return <div>{error}</div>;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6 mb-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Listing</h2>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-5" role="alert">{error}</div>}


            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="title" className={labelStyles}>Title*</label>
                    <input
                        type="text" id="title" name="title" required
                        value={formData.title} onChange={handleChange}
                        className={inputStyles} maxLength={100}
                    />
                </div>
                <div>
                    <label htmlFor="description" className={labelStyles}>Description*</label>
                    <textarea
                        id="description" name="description" required rows="4"
                        value={formData.description} onChange={handleChange}
                        className={inputStyles} maxLength={1000}
                    />
                </div>
                <div>
                    <label htmlFor="price" className={labelStyles}>Price ($)*</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            type="number" id="price" name="price" required min="0" step="0.01"
                            value={formData.price} onChange={handleChange}
                            className={`${inputStyles} pl-7`} placeholder="0.00"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="category" className={labelStyles}>Category*</label>
                    <select
                        id="category" name="category" required
                        value={formData.category} onChange={handleChange}
                        className={inputStyles}
                    >
                        <option value="" disabled>Select a category</option>
                        {categories.map((category) => (
                            category !== "All" && <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={`${labelStyles} mb-2`}>Condition*</label>
                    <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-2">
                        {conditions.map((condition) => (
                            condition && (
                                <label key={condition} className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="radio" name="condition" value={condition} required
                                        checked={formData.condition === condition} onChange={handleChange}
                                        className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{condition}</span>
                                </label>
                            )
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor="zipCode" className={labelStyles}>Zip Code*</label>
                    <input
                        type="text" id="zipCode" name="zipCode" required pattern="\d{5}" title="Enter a 5-digit zip code"
                        value={formData.zipCode} onChange={handleChange}
                        placeholder="Enter 5-digit zip code" className={inputStyles}
                    />
                </div>
                <div>
                    <label className={labelStyles}>Update Image (Optional)</label>
                    <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6 hover:border-indigo-500 transition duration-150 ease-in-out">
                        <div className="space-y-1 text-center">
                            {!imagePreview && existingImageUrl && (
                                <div className="mb-3">
                                    <p className="text-xs text-gray-500 mb-1">Current image:</p>
                                    <img src={existingImageUrl} alt="Current listing" className="max-h-32 mx-auto rounded border border-gray-200"/>
                                </div>
                            )}
                            {imagePreview && (
                                <div className="mb-3">
                                    <p className="text-xs text-gray-500 mb-1">New image preview:</p>
                                    <img src={imagePreview} alt="New preview" className="max-h-32 mx-auto rounded border border-gray-200"/>
                                </div>
                            )}

                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-gray-600 justify-center">
                                <label htmlFor="image-upload-input" className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
                                    <span>{image ? 'Change file' : 'Upload a file'}</span>
                                    <input id="image-upload-input" name="image" type="file" className="sr-only" onChange={handleImageChange} accept="image/png, image/jpeg, image/jpg"/>
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">Leave blank to keep current image. Max 5MB.</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
                    <Button type="submit" variant="primary">
                        Save Changes
                    </Button>
                    <Button type="button" variant="danger" onClick={handleDelete}>
                        Delete Listing
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditListingPage;