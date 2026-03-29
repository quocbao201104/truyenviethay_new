export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// Helper to construct full image URLs
// If usage prefers a separate base for images (e.g., CDN), it can be configured here.
// For now, it mirrors the API_BASE_URL logic or can be a separate env var.
export const IMAGE_BASE_URL = import.meta.env.VITE_APP_IMAGE_URL || API_BASE_URL;
export const DEFAULT_STORY_COVER_URL =
    "https://res.cloudinary.com/dg9ftuhv4/image/upload/f_auto,q_auto:good,c_fill,g_auto,ar_2:3,w_600,dpr_auto/v1774718730/default_cover_lfqxd9.png";

type CloudinaryImageOptions = {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
    crop?: string;
    dprAuto?: boolean;
};

export const buildCloudinaryImageUrl = (
    path: string,
    {
        width,
        height,
        quality = "auto",
        format = "auto",
        crop,
        dprAuto = false,
    }: CloudinaryImageOptions = {},
): string => {
    if (!path.includes('cloudinary.com')) return path;

    const transforms: string[] = [];
    if (width) transforms.push(`w_${Math.round(width)}`);
    if (height) transforms.push(`h_${Math.round(height)}`);
    if (crop) transforms.push(`c_${crop}`);
    if (dprAuto) transforms.push("dpr_auto");
    transforms.push(`f_${format}`, `q_${quality}`);

    return path.replace('/upload/', `/upload/${transforms.join(",")}/`);
};

export const buildCloudinarySrcSet = (
    path: string | null | undefined,
    widths: number[],
    options: Omit<CloudinaryImageOptions, "width"> = {},
): string => {
    if (!path) return "";

    return widths
        .map((width) => {
            const url = path.includes("cloudinary.com")
                ? buildCloudinaryImageUrl(path, { ...options, width })
                : getImageUrl(path, width);
            return `${url} ${width}w`;
        })
        .join(", ");
};

export const getImageUrl = (path: string | null | undefined, width: number = 600): string => {
    const isOldDefault = path && (
        path.includes('bia_truyen_default.jpg') || 
        path.includes('default_cover.jpg')
    );

    if (!path || isOldDefault) return '/placeholder.jpg'; // Or a default local asset
    
    // Cloudinary Optimization
    if (path.includes('cloudinary.com')) {
        return buildCloudinaryImageUrl(path, { width });
    }

    if (path.startsWith('http')) return path;
    
    // Ensure path starts with slash if appending to base
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${IMAGE_BASE_URL}${cleanPath}`;
};

export const getStoryCoverUrl = (
    path: string | null | undefined,
    width: number = 600,
): string => {
    const isOldDefault = path && (
        path.includes('bia_truyen_default.jpg') || 
        path.includes('default_cover.jpg')
    );

    if (!path || isOldDefault) return DEFAULT_STORY_COVER_URL;
    if (path.includes("cloudinary.com")) {
        return buildCloudinaryImageUrl(path, { width, quality: "auto", format: "auto" });
    }
    if (path.startsWith("http")) return path;
    return getImageUrl(path, width);
};

export const getStoryCoverSrcSet = (
    path: string | null | undefined,
    widths: number[] = [320, 480, 640, 800],
): string => {
    if (!path) return "";
    return widths
        .map((width) => `${getStoryCoverUrl(path, width)} ${width}w`)
        .join(", ");
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
