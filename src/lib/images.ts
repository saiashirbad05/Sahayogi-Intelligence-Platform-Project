/**
 * HIGH-FIDELITY PHOTO POOLS (V5)
 * These are curated Unsplash IDs mapped to NGO categories.
 */
export const PHOTO_POOLS: Record<string, string[]> = {
  Education: [
    "1503913997530-0f019e045115", "1427504494785-3a9ca7044f45", "1509062522246-3755977927d7",
    "1523247530030-41bd9fb3fd1a", "1503676260728-1c00da096a0b", "1497633762265-9d179a990aa6",
    "1546410531-bb4abcaf5017", "1524178232363-1fb2b075b655", "1544391496-0d77af2d715d",
    "1518331647414-7664448a393e", "1488190211105-8b0e65b80b4e", "1517673132405-a56a65b1067c",
    "1580582932707-12079083e20c", "1535905557528-122ad4546921", "1516321496642-c38d85ed3d58"
  ],
  Healthcare: [
    "1505751172107-55525aabc010", "1538108176682-4b2c35a1a1b3", "1576091160550-217359f49f4c",
    "1584515154023-e4939b71a27e", "1519494026892-80bbd2d6fd0d", "1512678080508-26eb07c512ee",
    "1530490125459-847a61407e2b", "1579684385127-1ef248997a0e", "1631217816693-9482bf4a34b9",
    "1551076805-e1869033e561", "1581056771141-9eb063b46853", "1631248055158-ed4160a0f683",
    "1584432830222-a1789dc5f28f", "1586773860418-d313ade0d355", "1582213708055-32e694605963"
  ],
  Rural: [
    "1526628953301-3e589a6a8b74", "1500382017468-9049fed747ef", "1464225227772-72ad89430d31",
    "1500673315821-21394a4ae9d8", "1589335645012-16335166299d", "1492496913914-bc3552d92f74",
    "1542601906-fbbd4afdb3fd", "1597534458220-919ef2a6730a", "1591857177557-ca81f4967342",
    "1532938911079-1b06ac7ceec7", "1515150144351-366ab9248d6f", "1449032323414-ad623bb69165",
    "1523348854733-9aa071be36ba", "1517519014107-1d5440787e97", "1513519245081-37012306915f"
  ],
  General: [
    "1488521787991-ed7bbaae773c", "1531206715517-5c0ba140ec2b", "1509099836639-18ba1795216d",
    "1593113598332-cd288d649433", "1578357078586-b21bad99a996", "1469571486292-0ba58a3f068b",
    "1524661135-423995f22d0b", "1506869640319-1836aee632ae", "1454165205634-192088f34145",
    "1532629902620-65c1bc294749", "1518173946644-07253303642c", "1517048676732-d65c3bb8b674",
    "1557800634-7560abaade52", "1521733613911-36c58dc860f3", "1506152983272-5b128325fd94"
  ]
};

/**
 * Reconstructs a full Unsplash URL from a specialty theme and photo index.
 * Deterministic mapping ensures consistency for the 50,000+ orgs.
 */
export const getUnsplashUrl = (index: number, theme: string = "General"): string => {
  const pool = PHOTO_POOLS[theme] || PHOTO_POOLS.General;
  const photoId = pool[index % pool.length];
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&q=80&w=800`;
};

const NGO_FIXED_IMAGES: Record<string, string> = {
  'Bhumi': '/images/789/IMG-20260402-WA0001.jpg',
  'Goonj': '/images/789/IMG-20260402-WA0009.jpg',
  'CRY (Child Rights and You)': '/images/789/IMG-20260402-WA0002.jpg',
  'Pehchaan The Street School': '/images/789/images%20%285%29.jpg',
  'Smile Foundation': '/images/789/IMG-20260402-WA0026.jpg',
  'Nanhi Kali': '/images/789/IMG-20260402-WA0021.jpg',
  'GiveIndia Foundation': 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=800',
  'HelpAge India': '/images/789/IMG-20260402-WA0010.jpg'
};

/**
 * Resolves the best available image for an entity (NGO or Volunteer).
 * Prioritizes actual images, then gallery items, then deterministic fallbacks.
 */
export const resolveEntityImage = (entity: any): string => {
  if (!entity) return getUnsplashUrl(0, 'General');

  const { images, image_gallery, name, id, specialty, type, is_featured } = entity;
  
  // 1. Check direct name-based lookup for absolute accuracy on core partners
  if (name) {
     const cleanName = name.toLowerCase();
     for (const [fixedName, path] of Object.entries(NGO_FIXED_IMAGES)) {
        if (cleanName.includes(fixedName.toLowerCase())) {
           return path;
        }
     }
  }

  // 2. Keyword-based theme detection for fallback consistency
  const getTheme = () => {
    if (!specialty) return type === 'NGO' || type === 'NPO' ? 'Rural' : 'General';
    const s = specialty.toLowerCase();
    if (s.includes('edu') || s.includes('school') || s.includes('learn')) return 'Education';
    if (s.includes('health') || s.includes('med') || s.includes('doctor')) return 'Healthcare';
    if (s.includes('rural') || s.includes('village') || s.includes('farm')) return 'Rural';
    return 'General';
  };

  const theme = getTheme();
  const safeId = (id || name || '0').toString();
  const seed = safeId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);

  // 3. Check primary images - Only trust if it's a full URL or a verified local path
  if (images && Array.isArray(images) && images.length > 0 && typeof images[0] === 'string' && images[0].length > 5) {
     // If it's a bulk NGO and using a generic local path, consider it suspicious and fallback to Unsplash
     // unless it's a featured/top NGO.
     if (safeId.startsWith('bulk-') && images[0].includes('/images/') && !is_featured) {
        return getUnsplashUrl(seed, theme);
     }
     return images[0];
  }

  // 4. Check gallery
  if (image_gallery && Array.isArray(image_gallery) && image_gallery.length > 0 && typeof image_gallery[0] === 'string' && image_gallery[0].length > 5) {
     return image_gallery[0];
  }

  // 5. Deterministic fallback
  return getUnsplashUrl(seed, theme);
};

export const resolveEntityLogo = (entity: any): string => {
  if (!entity) return '/images/logo.png';
  const { name } = entity;
  const cleanName = name?.toLowerCase() || '';
  
  // Specific Logos if available
  const LOGO_MAP: Record<string, string> = {
    'pehchaan': '/images/789/images%20%285%29.jpg', // Pic instead of symbol
    'bhumi': '/images/789/IMG-20260402-WA0001.jpg', 
    'goonj': '/images/789/IMG-20260402-WA0009.jpg',
    'cry': '/images/789/IMG-20260402-WA0002.jpg',
    'giveindia': 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=800',
    'helpage': '/images/789/IMG-20260402-WA0010.jpg'
  };

  for (const [key, val] of Object.entries(LOGO_MAP)) {
    if (cleanName.includes(key)) return val;
  }

  return '';
};
