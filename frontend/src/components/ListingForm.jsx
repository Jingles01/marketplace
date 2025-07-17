
// eslint-disable-next-line react/prop-types
const ListingForm = ({formData, setFormData, image, setImage, handleImageChange, handleSubmit, categories, conditions,
                         error,
                     }) => {
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            <div>
                <label htmlFor="title" className="block mb-1 text-sm">
                    Title*
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>

            <div>
                <label htmlFor="description" className="block mb-1 text-sm">
                    Description*
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2 border rounded"
                    rows="4"
                    required
                />
            </div>

            <div>
                <label htmlFor="price" className="block mb-1 text-sm">
                    Price ($)*
                </label>
                <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>

            <div>
                <label htmlFor="category" className="mb-1 text-sm">
                    Category*
                </label>
                <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block mb-1 text-sm">
                    Condition*
                </label>
                <div className="flex flex-wrap gap-3">
                    {conditions.map((condition) => (
                        <label key={condition} className="flex items-center">
                            <input
                                type="radio"
                                name="condition"
                                value={condition}
                                checked={formData.condition === condition}
                                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                className="mr-1"
                                required
                            />
                            {condition}
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label htmlFor="zipCode">Zip Code</label>
                <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="Enter zip code"
                />
            </div>

            <div className="block mb-1 text-sm">
                <label className="block text-sm font-medium text-gray-700">
                    Image*
                </label>
                <div className="mt-1 flex items-center">
                    <input
                        type="file"
                        id="images"
                        name="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-500 file:text-sm file:font-bold file:text-blue-700"
                        required={!image}
                    />
                </div>
                {image && (
                    <div className="mt-4">
                        <p className="text-sm text-gray-500">File selected: {image.name}</p>
                        <div className="mt-2 flex items-center justify-center w-full border border-gray-300 rounded-md p-4 bg-gray-100">
                            <img
                                src={URL.createObjectURL(image)}
                                alt="Preview"
                                className="max-h-64 w-auto object-contain"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="text-right">
                <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
                </button>
            </div>
        </form>
    );
};

export default ListingForm;