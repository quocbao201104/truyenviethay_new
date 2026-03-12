export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// Helper to construct full image URLs
// If usage prefers a separate base for images (e.g., CDN), it can be configured here.
// For now, it mirrors the API_BASE_URL logic or can be a separate env var.
export const IMAGE_BASE_URL = import.meta.env.VITE_APP_IMAGE_URL || API_BASE_URL;

export const getImageUrl = (path: string | null | undefined, width: number = 600): string => {
    if (!path) return '/placeholder.jpg'; // Or a default local asset
    
    // Cloudinary Optimization
    if (path.includes('cloudinary.com')) {
        // Inject transformations (w_X, f_auto, q_auto)
        // Regex looks for /upload/ and inserts params after it
        return path.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
    }

    if (path.startsWith('http')) return path;
    
    // Ensure path starts with slash if appending to base
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${IMAGE_BASE_URL}${cleanPath}`;
};

export const getAvatarUrl = (path: string | null | undefined): string => {
     if (!path || path.toLowerCase().includes('default-avatar') || path.toLowerCase().includes('avatar-default')) {
         return 'https://res.cloudinary.com/dg9ftuhv4/image/upload/w_200,h_200,c_fill,f_auto,q_auto/v1773304807/avatar-default_xtvub1.png';
     }

     // Cloudinary Optimization for Avatars
     if (path.includes('cloudinary.com')) {
         return path.replace('/upload/', '/upload/w_200,h_200,c_fill,f_auto,q_auto/');
     }

     if (path.startsWith('http')) return path;
     
     const cleanPath = path.startsWith('/') ? path : `/${path}`;
     return `${IMAGE_BASE_URL}${cleanPath}`;
};
