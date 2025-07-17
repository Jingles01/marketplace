import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../config.js";
import Button from "../components/Button";


const CreateListingPage = () => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        category: "",
        condition: "",
        zipCode: "",
    });
    const [image, setImage] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();


    const updateFormField = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };


    const handleImageChange = (e) => {
        const file = e.target.files[0];


        if (!file) return;


        if (!file.type.startsWith('image/')) {
            setError("Only image files");
            return;
        }


        if (file.size > 5 * 1024 * 1024) {
            setError("Image less than 5MB.");
            return;
        }


        setImage(file)
        setError("")
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");


        if (!image) {
            setError("You must upload an image");
            return;
        }


        try {
            const data = new FormData();


            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });
            data.append('image', image);
            const response = await axios.post(`${config.apiUrl}/listings`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });


            alert("Listing created successfully!");
            navigate(`/listings/${response.data.listing._id}`);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create listing");
        }
    };


    const categories = [
        "Electronics", "Clothing", "Home & Garden", "Sports", "Toys",
        "Books", "Vehicles", "Furniture", "Other"
    ];


    const conditions = [
        "New", "Like New", "Good", "Fair", "Poor"
    ];

    const labelStyles = "block text-sm font-medium text-gray-700";
    const inputStyles = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200";


    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6 mb-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Create a New Listing</h2>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-5" role="alert">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">

                <div>
                    <label htmlFor="title" className={labelStyles}>
                        Title*
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={updateFormField}
                        className={inputStyles}
                        required
                        maxLength={100}
                    />
                </div>
                <div>
                    <label htmlFor="description" className={labelStyles}>
                        Description*
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={updateFormField}
                        className={inputStyles}
                        rows="4"
                        required
                        maxLength={1000}
                    />
                </div>
                <div>
                    <label htmlFor="price" className={labelStyles}>
                        Price ($)*
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={updateFormField}
                            className={`${inputStyles} pl-7`}
                            placeholder="1.00"
                            required
                            min="1"
                            step="1"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="category" className={labelStyles}>
                        Category*
                    </label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={updateFormField}
                        className={inputStyles}
                        required
                    >
                        <option value="" disabled>Select a category</option>
                        {categories.map((category) => (
                            category !== "All" && <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={`${labelStyles} mb-2`}>
                        Condition*
                    </label>
                    <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-2">
                        {conditions.map((condition) => (
                            condition && (
                                <label key={condition} className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="condition"
                                        value={condition}
                                        checked={formData.condition === condition}
                                        onChange={updateFormField}
                                        required
                                        className="form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{condition}</span>
                                </label>
                            )
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor="zipCode" className={labelStyles}>
                        Zip Code*
                    </label>
                    <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={updateFormField}
                        placeholder="Enter 5-digit zip code"
                        className={inputStyles}
                        pattern="\d{5}"
                        title="Enter a 5-digit zip code"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="image-upload" className={labelStyles}>
                        Image*
                    </label>
                    <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6 hover:border-indigo-500 transition duration-150 ease-in-out">
                        <div className="space-y-1 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="image-upload-input" className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
                                    <span>Upload a file</span>
                                    <input id="image-upload-input" name="image" type="file" className="sr-only" onChange={handleImageChange} accept="image/png, image/jpeg, image/jpg" required={!image}/>
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                        </div>
                    </div>
                    {image && (
                        <div className="mt-4">
                            <p className="text-sm text-gray-500">Preview:</p>
                            <div className="mt-2 flex items-center justify-center w-full border border-gray-300 rounded-md p-2 bg-gray-50">
                                <img
                                    src={URL.createObjectURL(image)}
                                    alt="Preview"
                                    className="max-h-64 w-auto object-contain rounded"
                                />
                            </div>
                        </div>
                    )}
                </div>
                <div className="pt-5">
                    <div className="flex justify-end">
                        <Button type="submit" variant="primary">
                            Create Listing
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateListingPage;