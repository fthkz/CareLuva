// Service Catalog - Provided by CareLuva
// Loads from Firestore with fallback to static data

let serviceCatalog = {
    'dentistry': [
        { id: 'dent_001', name: 'Teeth Cleaning', description: 'Professional dental cleaning and polishing' },
        { id: 'dent_002', name: 'Dental Checkup', description: 'Comprehensive oral examination' },
        { id: 'dent_003', name: 'Teeth Whitening', description: 'Professional teeth whitening treatment' },
        { id: 'dent_004', name: 'Root Canal Treatment', description: 'Endodontic treatment for infected teeth' },
        { id: 'dent_005', name: 'Tooth Extraction', description: 'Simple or surgical tooth removal' },
        { id: 'dent_006', name: 'Dental Filling', description: 'Cavity filling with composite or amalgam' },
        { id: 'dent_007', name: 'Dental Crown', description: 'Crown placement for damaged teeth' },
        { id: 'dent_008', name: 'Dental Implant', description: 'Tooth replacement with implant' },
        { id: 'dent_009', name: 'Orthodontic Consultation', description: 'Braces and alignment consultation' },
        { id: 'dent_010', name: 'Gum Treatment', description: 'Periodontal treatment and scaling' }
    ],
    'hair-transplant': [
        { id: 'hair_001', name: 'FUE Hair Transplant', description: 'Follicular Unit Extraction procedure' },
        { id: 'hair_002', name: 'FUT Hair Transplant', description: 'Follicular Unit Transplantation procedure' },
        { id: 'hair_003', name: 'Hair Transplant Consultation', description: 'Initial consultation and assessment' },
        { id: 'hair_004', name: 'Hairline Design', description: 'Custom hairline planning and design' },
        { id: 'hair_005', name: 'Beard Transplant', description: 'Facial hair restoration' },
        { id: 'hair_006', name: 'Eyebrow Transplant', description: 'Eyebrow restoration procedure' },
        { id: 'hair_007', name: 'Post-Transplant Care', description: 'Follow-up care and maintenance' },
        { id: 'hair_008', name: 'PRP Treatment', description: 'Platelet-Rich Plasma therapy for hair' }
    ],
    'cosmetic-surgery': [
        { id: 'cosm_001', name: 'Rhinoplasty', description: 'Nose reshaping surgery' },
        { id: 'cosm_002', name: 'Breast Augmentation', description: 'Breast enhancement procedure' },
        { id: 'cosm_003', name: 'Liposuction', description: 'Fat removal and body contouring' },
        { id: 'cosm_004', name: 'Tummy Tuck', description: 'Abdominoplasty procedure' },
        { id: 'cosm_005', name: 'Facelift', description: 'Facial rejuvenation surgery' },
        { id: 'cosm_006', name: 'Botox Injection', description: 'Botox cosmetic treatment' },
        { id: 'cosm_007', name: 'Dermal Fillers', description: 'Facial filler injections' },
        { id: 'cosm_008', name: 'Breast Reduction', description: 'Breast size reduction surgery' },
        { id: 'cosm_009', name: 'Eyelid Surgery', description: 'Blepharoplasty procedure' },
        { id: 'cosm_010', name: 'Lip Augmentation', description: 'Lip enhancement procedure' }
    ],
    'general-medicine': [
        { id: 'gen_001', name: 'General Consultation', description: 'Routine medical consultation' },
        { id: 'gen_002', name: 'Health Checkup', description: 'Comprehensive health screening' },
        { id: 'gen_003', name: 'Blood Test', description: 'Laboratory blood analysis' },
        { id: 'gen_004', name: 'Vaccination', description: 'Immunization services' },
        { id: 'gen_005', name: 'ECG', description: 'Electrocardiogram test' },
        { id: 'gen_006', name: 'X-Ray', description: 'Radiographic imaging' },
        { id: 'gen_007', name: 'Ultrasound', description: 'Ultrasound scanning' },
        { id: 'gen_008', name: 'Minor Surgery', description: 'Outpatient surgical procedures' }
    ]
};

// Get services for a category
function getServicesForCategory(category) {
    return serviceCatalog[category] || [];
}

// Get all categories
function getAllCategories() {
    return Object.keys(serviceCatalog);
}

// Get service by ID (works with both Firestore IDs and legacy static IDs)
function getServiceById(serviceId) {
    for (const category in serviceCatalog) {
        const service = serviceCatalog[category].find(s => s.id === serviceId);
        if (service) {
            return { ...service, category };
        }
    }
    return null;
}

// Refresh catalog from Firestore (useful after admin updates)
async function refreshServiceCatalog() {
    await initializeServiceCatalog();
    // Update window object
    if (typeof window !== 'undefined') {
        window.serviceCatalog = serviceCatalog;
    }
}

// Load service catalog from Firestore
async function loadServiceCatalogFromFirestore() {
    try {
        // Check if Firebase is available
        if (typeof window === 'undefined' || !window.firebase || !window.firebase.db) {
            console.warn('Firebase not available, using static catalog');
            return false;
        }

        const { getFirestore, collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
        const db = window.firebase.db;
        
        const catalogRef = collection(db, 'serviceCatalog');
        const snapshot = await getDocs(query(catalogRef, orderBy('category')));
        
        const loadedCatalog = {};
        const loadedCategories = new Set();
        
        snapshot.forEach(doc => {
            const data = doc.data();
            // Skip placeholder entries
            if (data.isPlaceholder) return;
            
            const category = data.category;
            loadedCategories.add(category);
            
            if (!loadedCatalog[category]) {
                loadedCatalog[category] = [];
            }
            
            loadedCatalog[category].push({
                id: doc.id,
                name: data.name,
                description: data.description,
                category: category
            });
        });
        
        if (Object.keys(loadedCatalog).length > 0) {
            serviceCatalog = loadedCatalog;
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error loading service catalog from Firestore:', error);
        return false;
    }
}

// Initialize catalog (load from Firestore, fallback to static)
async function initializeServiceCatalog() {
    const loaded = await loadServiceCatalogFromFirestore();
    if (!loaded) {
        console.log('Using static service catalog');
    }
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.serviceCatalog = serviceCatalog;
    window.getServicesForCategory = getServicesForCategory;
    window.getAllCategories = getAllCategories;
    window.getServiceById = getServiceById;
    window.loadServiceCatalogFromFirestore = loadServiceCatalogFromFirestore;
    window.initializeServiceCatalog = initializeServiceCatalog;
    window.refreshServiceCatalog = refreshServiceCatalog;
    
    // Auto-initialize when Firebase is ready
    if (window.firebaseReady) {
        initializeServiceCatalog();
    } else {
        // Wait for Firebase to be ready
        const checkFirebase = setInterval(() => {
            if (window.firebaseReady) {
                clearInterval(checkFirebase);
                initializeServiceCatalog();
            }
        }, 100);
    }
}

