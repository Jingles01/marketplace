import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';

const ListingCard = ({
                         listing,
                         isLoggedIn,
                         isFavorited,
                         onFavoriteToggle,
                         showFavoriteButton = true,
                         displayDistance,
                     }) => {
    if (!listing) {
        return <div className="border border-gray-200 rounded-lg p-4 shadow animate-pulse min-h-[300px]">Loading...</div>;
    }

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow hover:shadow-xl hover:-translate-y-1 transition duration-200 ease-in-out bg-white flex flex-col group relative">
            {isLoggedIn && showFavoriteButton && onFavoriteToggle && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onFavoriteToggle(listing._id, isFavorited);
                    }}
                    title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
                    className={`absolute top-2 right-2 z-10 p-1.5 rounded-full ${isFavorited ? 'text-red-500 bg-white bg-opacity-70' : 'text-gray-500 bg-white bg-opacity-70 hover:text-red-500'} transition-colors duration-150`}
                    aria-label={isFavorited ? "Unfavorite" : "Favorite"}
                >
                    <FontAwesomeIcon icon={isFavorited ? faHeartSolid : faHeartRegular} className="h-5 w-5" />
                </button>
            )}

            <Link to={`/listings/${listing._id}`} className="block flex flex-col flex-grow">
                <div className="w-full h-48 bg-gray-100 overflow-hidden">
                    {listing.images && listing.images.length > 0 ? (
                        <img
                            src={listing.images[0].url}
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-400 text-sm">No image</span>
                        </div>
                    )}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate group-hover:text-primary" title={listing.title}>
                        {listing.title || 'Untitled Listing'}
                    </h3>
                    <p className="text-xl font-bold text-primary mb-2">
                        ${listing.price ? parseFloat(listing.price).toFixed(2) : 'N/A'}
                    </p>
                    {displayDistance && (
                        <p className="text-xs text-gray-500 mb-2">
                            Distance: {displayDistance}
                        </p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-3">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {listing.category || 'N/A'}
                        </span>
                        <span className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {listing.condition || 'N/A'}
                        </span>
                    </div>
                    <div className="flex-grow"></div>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        {listing.createdBy?.username && (
                            <p className="text-xs text-muted-foreground truncate" title={`Seller: ${listing.createdBy.username}`}>
                                Seller: <Link to={`/users/${listing.createdBy._id}`} className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline">
                                {listing.createdBy.username}
                            </Link>
                            </p>
                        )}
                        {listing.location && (listing.location.city || listing.location.state) && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate" title={`Location: ${listing.location.city || ''}, ${listing.location.state || ''}`}>
                                <svg className="inline-block h-3 w-3 mr-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                {`${listing.location.city || ''}${listing.location.city && listing.location.state ? ', ' : ''}${listing.location.state || ''}`}                            </p>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ListingCard;