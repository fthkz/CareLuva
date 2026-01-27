// Review Moderation Functions for Admin Panel

// Load reviews for moderation
async function loadReviews() {
    const statusEl = document.getElementById('status');
    const containerEl = document.getElementById('data-container');
    
    try {
        statusEl.innerHTML = '🔄 Loading reviews...';
        statusEl.className = 'status loading';
        
        if (!window.firebase || !window.firebase.db || !window.firebaseReady) {
            throw new Error('Firebase not initialized');
        }

        // Import Firebase Firestore functions
        const { collection, query, orderBy, getDocs } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');

        // Load all reviews (pending and approved)
        const reviewsRef = collection(window.firebase.db, 'reviews');
        
        // Try to query with orderBy, but fallback to simple query if index doesn't exist
        let querySnapshot;
        try {
            const reviewsQuery = query(reviewsRef, orderBy('createdAt', 'desc'));
            querySnapshot = await getDocs(reviewsQuery);
        } catch (error) {
            // If orderBy fails (no index), get all reviews without ordering
            console.warn('Could not order by createdAt (index may be missing), loading all reviews:', error);
            querySnapshot = await getDocs(reviewsRef);
        }
        
        const reviews = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Sort in JavaScript if needed (fallback if orderBy didn't work)
        if (reviews.length > 0 && !reviews[0].createdAt) {
            // No createdAt field, keep original order
        } else {
            reviews.sort((a, b) => {
                const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : (a.createdAt ? new Date(a.createdAt) : new Date(0));
                const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : (b.createdAt ? new Date(b.createdAt) : new Date(0));
                return bDate.getTime() - aDate.getTime(); // Descending order
            });
        }

        console.log('Loaded reviews:', reviews);

        // Separate pending and approved reviews
        const pendingReviews = reviews.filter(r => r.status === 'pending');
        const approvedReviews = reviews.filter(r => r.status === 'approved');
        const rejectedReviews = reviews.filter(r => r.status === 'rejected');

        if (reviews.length === 0) {
            containerEl.innerHTML = `
                <div class="data-section">
                    <h3>⭐ Review Moderation</h3>
                    <div class="registration-card">
                        <p style="text-align: center; color: #6b7280; padding: 20px;">
                            No reviews found in Firebase database.
                        </p>
                    </div>
                </div>
            `;
        } else {
            containerEl.innerHTML = `
                <div class="data-section">
                    <h3>⭐ Review Moderation (${reviews.length} total - ${pendingReviews.length} pending)</h3>
                    <div style="margin-bottom: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
                        <strong>Statistics:</strong>
                        <span style="margin-left: 15px;">📋 Pending: ${pendingReviews.length}</span>
                        <span style="margin-left: 15px;">✅ Approved: ${approvedReviews.length}</span>
                        <span style="margin-left: 15px;">❌ Rejected: ${rejectedReviews.length}</span>
                    </div>
                    <div style="margin-bottom: 20px; padding: 15px; background: #eff6ff; border-radius: 8px; border: 1px solid #3b82f6;">
                        <strong style="display: block; margin-bottom: 10px;">🔧 Review Management Tools:</strong>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <button class="btn btn-danger" onclick="deleteInvalidPendingReviews()" style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500;">
                                🗑️ Delete Invalid Pending Reviews
                            </button>
                            <button class="btn btn-success" onclick="generateReviewsWithRealClinicIds(10)" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500;">
                                ➕ Generate 10 Reviews (Real IDs)
                            </button>
                            <button class="btn btn-secondary" onclick="generateReviewsWithRealClinicIds(20)" style="background: #6b7280; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500;">
                                ➕ Generate 20 Reviews (Real IDs)
                            </button>
                        </div>
                        <p style="margin-top: 10px; font-size: 12px; color: #6b7280;">
                            <strong>Note:</strong> "Delete Invalid" removes pending reviews with clinic IDs that don't exist in providerRegistrations.
                        </p>
                    </div>
                    
                    ${pendingReviews.length > 0 ? `
                        <h4 style="margin: 20px 0 10px 0; color: #92400e;">⏳ Pending Reviews</h4>
                        ${pendingReviews.map(review => `
                            <div class="registration-card" style="border-left: 4px solid #f59e0b;">
                                <div class="registration-header">
                                    <div>
                                        <div class="clinic-name">${review.reviewerName || 'Anonymous'}</div>
                                        <div style="font-size: 14px; color: #6b7280; margin-top: 5px;">
                                            Review for: ${review.clinicName || 'Unknown Clinic'}
                                        </div>
                                    </div>
                                    <div class="status-badge pending">Pending</div>
                                </div>
                                <div class="registration-details">
                                    <div class="detail-item">
                                        <div class="detail-label">Rating</div>
                                        <div class="detail-value">
                                            ${'★'.repeat(Math.floor(review.overallRating || 0))}${'☆'.repeat(5 - Math.floor(review.overallRating || 0))} 
                                            (${(review.overallRating || 0).toFixed(1)})
                                        </div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Review Title</div>
                                        <div class="detail-value">${review.reviewTitle || 'No title'}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Date</div>
                                        <div class="detail-value">${review.createdAt ? (review.createdAt.toDate ? review.createdAt.toDate().toLocaleDateString() : new Date(review.createdAt).toLocaleDateString()) : 'N/A'}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Clinic ID</div>
                                        <div class="detail-value">${review.clinicId || 'N/A'}</div>
                                    </div>
                                </div>
                                <div style="margin-top: 15px; padding: 15px; background: #f9fafb; border-radius: 8px;">
                                    <strong>Review Text:</strong>
                                    <p style="margin-top: 8px; color: #374151; line-height: 1.6;">${review.reviewText || 'No review text'}</p>
                                </div>
                                ${review.categoryRatings && Object.keys(review.categoryRatings).length > 0 ? `
                                    <div style="margin-top: 15px; padding: 15px; background: #f9fafb; border-radius: 8px;">
                                        <strong>Category Ratings:</strong>
                                        <div style="margin-top: 8px; display: flex; gap: 20px; flex-wrap: wrap;">
                                            ${Object.entries(review.categoryRatings).map(([category, rating]) => 
                                                `<span style="font-size: 14px;"><strong>${category.charAt(0).toUpperCase() + category.slice(1)}:</strong> ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</span>`
                                            ).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                                <div style="margin-top: 20px; display: flex; gap: 10px;">
                                    <button class="btn btn-success" onclick="updateReviewStatus('${review.id}', 'approved')">
                                        ✅ Approve
                                    </button>
                                    <button class="btn btn-danger" onclick="updateReviewStatus('${review.id}', 'rejected')">
                                        ❌ Reject
                                    </button>
                                    <button class="btn btn-secondary" onclick="viewClinicProfile('${review.clinicId}')">
                                        👁️ View Clinic
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    ` : ''}
                    
                    ${approvedReviews.length > 0 ? `
                        <h4 style="margin: 30px 0 10px 0; color: #065f46;">✅ Approved Reviews</h4>
                        ${approvedReviews.slice(0, 10).map(review => `
                            <div class="registration-card" style="border-left: 4px solid #10b981;">
                                <div class="registration-header">
                                    <div>
                                        <div class="clinic-name">${review.reviewerName || 'Anonymous'}</div>
                                        <div style="font-size: 14px; color: #6b7280; margin-top: 5px;">
                                            Review for: ${review.clinicName || 'Unknown Clinic'}
                                        </div>
                                    </div>
                                    <div class="status-badge approved">Approved</div>
                                </div>
                                <div style="margin-top: 15px; padding: 15px; background: #f9fafb; border-radius: 8px;">
                                    <strong>Review Text:</strong>
                                    <p style="margin-top: 8px; color: #374151; line-height: 1.6;">${review.reviewText || 'No review text'}</p>
                                </div>
                                <div style="margin-top: 15px;">
                                    <span style="color: #6b7280; font-size: 14px;">
                                        ${'★'.repeat(Math.floor(review.overallRating || 0))}${'☆'.repeat(5 - Math.floor(review.overallRating || 0))} 
                                        (${(review.overallRating || 0).toFixed(1)}) - ${review.createdAt ? (review.createdAt.toDate ? review.createdAt.toDate().toLocaleDateString() : new Date(review.createdAt).toLocaleDateString()) : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                        ${approvedReviews.length > 10 ? `<p style="text-align: center; color: #6b7280; margin-top: 15px;">... and ${approvedReviews.length - 10} more approved reviews</p>` : ''}
                    ` : ''}
                </div>
            `;
        }

        statusEl.innerHTML = `✅ Loaded ${reviews.length} reviews (${pendingReviews.length} pending)`;
        statusEl.className = 'status success';
        
    } catch (error) {
        console.error('Error loading reviews:', error);
        statusEl.innerHTML = `❌ Error loading reviews: ${error.message}`;
        statusEl.className = 'status error';
        containerEl.innerHTML = `
            <div class="data-section">
                <h3>⭐ Review Moderation</h3>
                <div class="registration-card">
                    <p style="text-align: center; color: #991b1b; padding: 20px;">
                        Error loading reviews: ${error.message}
                    </p>
                </div>
            </div>
        `;
    }
}

// Update review status
async function updateReviewStatus(reviewId, newStatus) {
    if (!confirm(`Are you sure you want to ${newStatus} this review?`)) {
        return;
    }

    try {
        if (!window.firebase || !window.firebase.db || !window.firebaseReady) {
            throw new Error('Firebase not initialized');
        }

        // Import Firebase Firestore functions
        const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');

        const reviewRef = doc(window.firebase.db, 'reviews', reviewId);
        await updateDoc(reviewRef, {
            status: newStatus,
            reviewedAt: new Date().toISOString(),
            reviewedBy: currentAdmin?.email || 'admin' // Use admin email if available
        });

        alert(`Review ${newStatus} successfully!`);
        loadReviews(); // Reload reviews
    } catch (error) {
        console.error('Error updating review status:', error);
        alert(`Error ${newStatus} review: ${error.message}`);
    }
}

// View clinic profile
function viewClinicProfile(clinicId) {
    if (clinicId) {
        // Open in same window to preserve admin session
        window.location.href = `provider-directory.html?id=${clinicId}&from=admin`;
    } else {
        alert('Clinic ID not available');
    }
}

// Delete pending reviews with invalid clinic IDs
async function deleteInvalidPendingReviews() {
    if (!confirm('This will delete all pending reviews with invalid clinic IDs. Continue?')) {
        return;
    }

    try {
        if (!window.firebase || !window.firebase.db || !window.firebaseReady) {
            throw new Error('Firebase not initialized');
        }

        const { collection, query, where, getDocs, doc, deleteDoc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');

        console.log('🔍 Finding pending reviews with invalid clinic IDs...');
        
        // Get all pending reviews
        const reviewsRef = collection(window.firebase.db, 'reviews');
        const pendingQuery = query(reviewsRef, where('status', '==', 'pending'));
        const reviewsSnapshot = await getDocs(pendingQuery);

        const invalidReviews = [];
        const validReviews = [];

        // Check each review's clinic ID
        for (const reviewDoc of reviewsSnapshot.docs) {
            const reviewData = reviewDoc.data();
            const clinicId = reviewData.clinicId;

            if (!clinicId) {
                invalidReviews.push({ id: reviewDoc.id, reason: 'No clinicId' });
                continue;
            }

            // Check if clinic exists
            try {
                const clinicRef = doc(window.firebase.db, 'providerRegistrations', clinicId);
                const clinicSnap = await getDoc(clinicRef);

                if (!clinicSnap.exists()) {
                    invalidReviews.push({ 
                        id: reviewDoc.id, 
                        clinicId: clinicId,
                        clinicName: reviewData.clinicName || 'Unknown',
                        reason: 'Clinic not found'
                    });
                } else {
                    validReviews.push({ id: reviewDoc.id, clinicId: clinicId });
                }
            } catch (error) {
                console.error(`Error checking clinic ${clinicId}:`, error);
                invalidReviews.push({ 
                    id: reviewDoc.id, 
                    clinicId: clinicId,
                    reason: 'Error checking clinic'
                });
            }
        }

        console.log(`Found ${invalidReviews.length} invalid reviews and ${validReviews.length} valid reviews`);

        // Delete invalid reviews
        let deletedCount = 0;
        for (const invalidReview of invalidReviews) {
            try {
                const reviewRef = doc(window.firebase.db, 'reviews', invalidReview.id);
                await deleteDoc(reviewRef);
                deletedCount++;
                console.log(`Deleted review ${invalidReview.id} (clinicId: ${invalidReview.clinicId})`);
            } catch (error) {
                console.error(`Error deleting review ${invalidReview.id}:`, error);
            }
        }

        alert(`✅ Deleted ${deletedCount} pending reviews with invalid clinic IDs.\n\nInvalid: ${invalidReviews.length}\nValid: ${validReviews.length}`);
        
        // Reload reviews
        loadReviews();
    } catch (error) {
        console.error('Error deleting invalid reviews:', error);
        alert(`❌ Error: ${error.message}`);
    }
}

// Generate new reviews with real clinic IDs
async function generateReviewsWithRealClinicIds(count = 10) {
    if (!confirm(`Generate ${count} new pending reviews with real clinic IDs?`)) {
        return;
    }

    try {
        if (!window.firebase || !window.firebase.db || !window.firebaseReady) {
            throw new Error('Firebase not initialized');
        }

        const { collection, query, getDocs, addDoc, limit, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');

        console.log('🔍 Fetching real clinic IDs...');
        
        // Get real clinic IDs from providerRegistrations
        const providersRef = collection(window.firebase.db, 'providerRegistrations');
        const providersQuery = query(providersRef, limit(100));
        const providersSnapshot = await getDocs(providersQuery);

        const clinicIds = [];
        const clinicDataMap = {};
        
        providersSnapshot.forEach((doc) => {
            const data = doc.data();
            clinicIds.push(doc.id);
            clinicDataMap[doc.id] = {
                clinicName: data.clinicName || data.name || 'Unknown Clinic',
                specialization: data.specialization || 'General Medicine'
            };
        });

        if (clinicIds.length === 0) {
            alert('❌ No clinics found in providerRegistrations. Please create some clinics first.');
            return;
        }

        console.log(`Found ${clinicIds.length} real clinics`);

        // Generate reviews
        const reviewsRef = collection(window.firebase.db, 'reviews');
        const reviewTemplates = [
            { title: 'Great experience!', text: 'The staff was very professional and the service was excellent.', rating: 5 },
            { title: 'Good service', text: 'Had a good experience overall. Would recommend.', rating: 4 },
            { title: 'Satisfactory', text: 'The clinic met my expectations. Clean and organized.', rating: 4 },
            { title: 'Very helpful', text: 'The doctors were knowledgeable and took time to explain everything.', rating: 5 },
            { title: 'Professional care', text: 'Received professional care and attention. Thank you!', rating: 5 },
            { title: 'Could be better', text: 'Service was okay but could use some improvements.', rating: 3 },
            { title: 'Excellent facility', text: 'Modern facility with great equipment and friendly staff.', rating: 5 },
            { title: 'Good value', text: 'Good quality care at reasonable prices.', rating: 4 },
            { title: 'Highly recommend', text: 'One of the best clinics I have visited. Highly recommend!', rating: 5 },
            { title: 'Satisfied patient', text: 'I am satisfied with the care I received. Thank you!', rating: 4 }
        ];

        const reviewerNames = [
            'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson',
            'Lisa Anderson', 'Robert Taylor', 'Jennifer Martinez', 'William Thomas', 'Amanda Garcia'
        ];

        let generatedCount = 0;
        for (let i = 0; i < count; i++) {
            // Pick a random clinic
            const randomClinicId = clinicIds[Math.floor(Math.random() * clinicIds.length)];
            const clinicData = clinicDataMap[randomClinicId];
            const template = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)];
            const reviewerName = reviewerNames[Math.floor(Math.random() * reviewerNames.length)];

            // Generate category ratings
            const categoryRatings = {
                cleanliness: Math.floor(Math.random() * 2) + 4, // 4-5
                staff: Math.floor(Math.random() * 2) + 4,
                value: Math.floor(Math.random() * 2) + 3, // 3-5
                communication: Math.floor(Math.random() * 2) + 4
            };

            const reviewData = {
                clinicId: randomClinicId,
                clinicName: clinicData.clinicName,
                specialization: clinicData.specialization,
                reviewerName: reviewerName,
                reviewTitle: template.title,
                reviewText: template.text,
                overallRating: template.rating,
                categoryRatings: categoryRatings,
                status: 'pending',
                createdAt: serverTimestamp(),
                verified: false
            };

            try {
                await addDoc(reviewsRef, reviewData);
                generatedCount++;
                console.log(`Generated review ${i + 1}/${count} for clinic: ${clinicData.clinicName}`);
            } catch (error) {
                console.error(`Error generating review ${i + 1}:`, error);
            }
        }

        alert(`✅ Generated ${generatedCount} new pending reviews with real clinic IDs!`);
        
        // Reload reviews
        loadReviews();
    } catch (error) {
        console.error('Error generating reviews:', error);
        alert(`❌ Error: ${error.message}`);
    }
}

// Make functions globally available
window.loadReviews = loadReviews;
window.updateReviewStatus = updateReviewStatus;
window.viewClinicProfile = viewClinicProfile;
window.deleteInvalidPendingReviews = deleteInvalidPendingReviews;
window.generateReviewsWithRealClinicIds = generateReviewsWithRealClinicIds;


