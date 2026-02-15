/**
 * Format price with $ symbol
 */
export const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);
};

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

/**
 * Format date with time
 */
export const formatDateTime = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Truncate text to a maximum length
 */
export const truncate = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

/**
 * Get error message from API error
 */
export const getErrorMessage = (err) => {
    return err.response?.data?.error || err.message || 'Something went wrong';
};

/**
 * Generate star array for ratings
 */
export const getStarArray = (rating, max = 5) => {
    const stars = [];
    for (let i = 1; i <= max; i++) {
        if (i <= Math.floor(rating)) stars.push('full');
        else if (i - 0.5 <= rating) stars.push('half');
        else stars.push('empty');
    }
    return stars;
};
