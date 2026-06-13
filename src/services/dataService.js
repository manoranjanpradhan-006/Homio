import { db, storage, isConfigured } from '../firebase';
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  setDoc, 
  query, 
  where,
  limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  neighborhoods as mockNeighborhoods, 
  properties as mockProperties, 
  reviews as mockReviews 
} from '../data/mockData';

// Initialize from localStorage if present to ensure offline/fallback persistence
let localNeighborhoods = [...mockNeighborhoods];
let localProperties = [...mockProperties];
let localReviews = [...mockReviews];

const initLocalDB = () => {
  try {
    const storedProps = localStorage.getItem('homio_properties');
    if (storedProps) {
      localProperties = JSON.parse(storedProps);
    } else {
      localStorage.setItem('homio_properties', JSON.stringify(mockProperties));
    }

    const storedNeighborhoods = localStorage.getItem('homio_neighborhoods');
    if (storedNeighborhoods) {
      localNeighborhoods = JSON.parse(storedNeighborhoods);
    } else {
      localStorage.setItem('homio_neighborhoods', JSON.stringify(mockNeighborhoods));
    }
    
    const storedReviews = localStorage.getItem('homio_reviews');
    if (storedReviews) {
      localReviews = JSON.parse(storedReviews);
    } else {
      localStorage.setItem('homio_reviews', JSON.stringify(mockReviews));
    }
  } catch (e) {
    console.warn("localStorage persistence not available:", e);
  }
};

initLocalDB();

// Helper to convert Firestore document to a standard JS object with ID
const docToData = (docSnap) => {
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  // Try to parse the document ID as a number if possible
  const numId = parseInt(docSnap.id, 10);
  return {
    ...data,
    id: isNaN(numId) ? docSnap.id : numId
  };
};

// Helper to upload base64 or blob URL to Firebase Storage
const uploadImageToStorage = async (imageSrc) => {
  if (!isConfigured || !storage) return null;
  try {
    let blob;
    if (imageSrc.startsWith('blob:')) {
      const response = await fetch(imageSrc);
      blob = await response.blob();
    } else if (imageSrc.startsWith('data:')) {
      const arr = imageSrc.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      blob = new Blob([u8arr], { type: mime });
    } else {
      return imageSrc; // Already a remote HTTP URL
    }

    const fileExt = blob.type.split('/')[1] || 'jpg';
    const fileName = `properties/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const fileRef = ref(storage, fileName);
    
    await uploadBytes(fileRef, blob);
    const downloadURL = await getDownloadURL(fileRef);
    console.log("[DataService] Image uploaded successfully to storage:", downloadURL);
    return downloadURL;
  } catch (err) {
    console.error("[DataService] Error uploading image to Firebase Storage, will fallback to original/Base64:", err);
    return null;
  }
};

/**
 * Fetch all neighborhoods. Falls back to mock data if Firestore is not configured or queries fail.
 */
export const getNeighborhoods = async () => {
  if (!isConfigured || !db) {
    console.log("[DataService] Using mock neighborhoods (Firebase not configured)");
    return localNeighborhoods;
  }
  try {
    const querySnapshot = await getDocs(collection(db, 'neighborhoods'));
    if (querySnapshot.empty) {
      console.log("[DataService] Neighborhoods collection is empty. Falling back to mock data.");
      return localNeighborhoods;
    }
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push(docToData(doc));
    });
    // Sort by ID to maintain consistent order
    return list.sort((a, b) => a.id - b.id);
  } catch (error) {
    console.error("[DataService] Error fetching neighborhoods from Firestore:", error);
    return localNeighborhoods;
  }
};

/**
 * Fetch a single neighborhood by ID.
 */
export const getNeighborhoodById = async (id) => {
  const targetId = String(id);
  if (!isConfigured || !db) {
    return localNeighborhoods.find(n => String(n.id) === targetId);
  }
  try {
    const docRef = doc(db, 'neighborhoods', targetId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docToData(docSnap);
    }
    // Try matching numeric or string ID in mock data
    return localNeighborhoods.find(n => String(n.id) === targetId);
  } catch (error) {
    console.error(`[DataService] Error fetching neighborhood ${id}:`, error);
    return localNeighborhoods.find(n => String(n.id) === targetId);
  }
};

/**
 * Fetch all properties.
 */
export const getProperties = async () => {
  if (!isConfigured || !db) {
    console.log("[DataService] Using mock properties (Firebase not configured)");
    return localProperties;
  }
  try {
    const querySnapshot = await getDocs(collection(db, 'properties'));
    if (querySnapshot.empty) {
      console.log("[DataService] Properties collection is empty. Falling back to mock data.");
      return localProperties;
    }
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push(docToData(doc));
    });
    return list.sort((a, b) => a.id - b.id);
  } catch (error) {
    console.error("[DataService] Error fetching properties from Firestore:", error);
    return localProperties;
  }
};

/**
 * Fetch a single property by ID.
 */
export const getPropertyById = async (id) => {
  const targetId = String(id);
  if (!isConfigured || !db) {
    return localProperties.find(p => String(p.id) === targetId);
  }
  try {
    const docRef = doc(db, 'properties', targetId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docToData(docSnap);
    }
    return localProperties.find(p => String(p.id) === targetId);
  } catch (error) {
    console.error(`[DataService] Error fetching property ${id}:`, error);
    return localProperties.find(p => String(p.id) === targetId);
  }
};

/**
 * Fetch reviews for a specific neighborhood.
 */
export const getReviews = async (neighborhoodId) => {
  const targetNeighborhoodId = Number(neighborhoodId);
  if (!isConfigured || !db) {
    return localReviews.filter(r => r.neighborhoodId === targetNeighborhoodId);
  }
  try {
    const q = query(collection(db, 'reviews'), where('neighborhoodId', '==', targetNeighborhoodId));
    const querySnapshot = await getDocs(q);
    
    // If empty in Firestore, but we have them in mock data, return mock data
    if (querySnapshot.empty) {
      const mockResult = localReviews.filter(r => r.neighborhoodId === targetNeighborhoodId);
      if (mockResult.length > 0) return mockResult;
    }
    
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push(docToData(doc));
    });
    return list;
  } catch (error) {
    console.error(`[DataService] Error fetching reviews for neighborhood ${neighborhoodId}:`, error);
    return localReviews.filter(r => r.neighborhoodId === targetNeighborhoodId);
  }
};

/**
 * Add a new property to the database.
 */
export const addProperty = async (propertyData) => {
  // Generate a premium placeholder image from Unsplash to ensure design aesthetics look premium
  const premiumPlaceholders = [
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
  ];
  
  // Try uploading any uploaded images to Firebase Storage first (if configured/supported)
  const uploadedImageUrls = [];
  if (propertyData.images && propertyData.images.length > 0) {
    for (const img of propertyData.images) {
      if (img.startsWith('data:') || img.startsWith('blob:')) {
        const url = await uploadImageToStorage(img);
        if (url) {
          uploadedImageUrls.push(url);
        } else {
          // If storage fails/is not configured, keep the compressed Base64 representation
          uploadedImageUrls.push(img);
        }
      } else {
        uploadedImageUrls.push(img);
      }
    }
  }

  const finalImages = uploadedImageUrls.length > 0
    ? uploadedImageUrls
    : [premiumPlaceholders[Math.floor(Math.random() * premiumPlaceholders.length)]];

  const newProperty = {
    ...propertyData,
    city: propertyData.city || "Bhubaneswar",
    images: finalImages,
    amenities: propertyData.amenities && propertyData.amenities.length > 0
      ? propertyData.amenities
      : ["Power Backup", "Lift", "Security", "Car Parking", "CCTV", "Gym"],
    lat: propertyData.lat || 20.3500 + (Math.random() - 0.5) * 0.05, // Random lat near BBSR
    lng: propertyData.lng || 85.8200 + (Math.random() - 0.5) * 0.05, // Random lng near BBSR
    isFeatured: propertyData.isFeatured || false,
    isNew: true,
    availableFrom: propertyData.availableFrom || "Immediate"
  };

  if (!isConfigured || !db) {
    console.log("[DataService] Saving property to local simulation (Firebase not configured)");
    const newId = localProperties.length + 1;
    const simulated = { ...newProperty, id: newId };
    localProperties.push(simulated);
    try {
      localStorage.setItem('homio_properties', JSON.stringify(localProperties));
    } catch (e) {
      console.warn("Failed to save properties to localStorage:", e);
    }
    return simulated;
  }

  try {
    // Determine next integer ID (retrieve count or generate random timestamp-based ID)
    const timestampId = String(Date.now());
    const docRef = doc(db, 'properties', timestampId);
    await setDoc(docRef, newProperty);
    console.log("[DataService] Property written successfully to Firestore with ID:", timestampId);
    return { ...newProperty, id: timestampId };
  } catch (error) {
    console.error("[DataService] Error saving property to Firestore:", error);
    // Local simulation fallback
    const newId = localProperties.length + 1;
    const simulated = { ...newProperty, id: newId };
    localProperties.push(simulated);
    try {
      localStorage.setItem('homio_properties', JSON.stringify(localProperties));
    } catch (e) {
      console.warn("Failed to save properties to localStorage:", e);
    }
    return simulated;
  }
};

/**
 * Add a review for a neighborhood.
 */
export const addReview = async (reviewData) => {
  const newReview = {
    ...reviewData,
    date: reviewData.date || "Just now",
    helpful: 0,
    notHelpful: 0,
    verified: false,
    avatar: reviewData.user ? reviewData.user.substring(0, 2).toUpperCase() : "U",
    avatarColor: reviewData.avatarColor || "#8b5cf6"
  };

  if (!isConfigured || !db) {
    console.log("[DataService] Saving review to local simulation");
    const newId = localReviews.length + 1;
    const simulated = { ...newReview, id: newId };
    localReviews.push(simulated);
    try {
      localStorage.setItem('homio_reviews', JSON.stringify(localReviews));
    } catch (e) {
      console.warn("Failed to save reviews to localStorage:", e);
    }
    return simulated;
  }

  try {
    const timestampId = String(Date.now());
    const docRef = doc(db, 'reviews', timestampId);
    await setDoc(docRef, newReview);
    console.log("[DataService] Review written successfully to Firestore with ID:", timestampId);
    return { ...newReview, id: timestampId };
  } catch (error) {
    console.error("[DataService] Error saving review to Firestore:", error);
    const newId = localReviews.length + 1;
    const simulated = { ...newReview, id: newId };
    localReviews.push(simulated);
    try {
      localStorage.setItem('homio_reviews', JSON.stringify(localReviews));
    } catch (e) {
      console.warn("Failed to save reviews to localStorage:", e);
    }
    return simulated;
  }
};

/**
 * Utility function to seed initial mock data into Firestore collections.
 * overwrites existing docs with same keys.
 */
export const seedFirestore = async () => {
  if (!isConfigured || !db) {
    throw new Error("Firebase is not initialized or configured. Check your env variables.");
  }

  console.log("[DataService] Seeding Firestore started...");
  
  // 1. Seed Neighborhoods
  for (const n of mockNeighborhoods) {
    const docRef = doc(db, 'neighborhoods', String(n.id));
    await setDoc(docRef, n);
  }
  console.log("[DataService] Seeded neighborhoods successfully.");

  // 2. Seed Properties
  for (const p of mockProperties) {
    const docRef = doc(db, 'properties', String(p.id));
    await setDoc(docRef, p);
  }
  console.log("[DataService] Seeded properties successfully.");

  // 3. Seed Reviews
  for (const r of mockReviews) {
    const docRef = doc(db, 'reviews', String(r.id));
    await setDoc(docRef, r);
  }
  console.log("[DataService] Seeded reviews successfully.");
  
  return { success: true };
};
