// eslint-disable-next-line react/prop-types
const StarRating = ({ rating, totalReviews, reviewCountText }) => {
    const numericRating = Number(rating);
    const validRating = isNaN(numericRating) ? 0 : Math.max(0, Math.min(5, numericRating));
    const fullStars = Math.round(validRating);

    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <svg
                    key={i}
                    className={`h-5 w-5 ${i < fullStars ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
            {reviewCountText ? (
                <span className="ml-2 text-sm text-gray-600">{reviewCountText}</span>
            ) : totalReviews !== undefined ? (
                <span className="ml-2 text-sm text-gray-600" aria-label={`${validRating.toFixed(1)} out of 5 stars from ${totalReviews} reviews`}>
                    ({validRating > 0 ? validRating.toFixed(1) : '0.0'} from {totalReviews} reviews)
                </span>
            ) : null}
        </div>
    );
};

export default StarRating;