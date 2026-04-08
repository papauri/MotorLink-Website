/**
 * Image Gallery Modal - Reusable Component
 * Supports both desktop grid view and mobile carousel
 */

let currentCarouselIndex = 0;
let carouselImages = [];

function closeImageGallery() {
    const modal = document.getElementById('imageGalleryModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

async function openImageGallery(carId, carTitle) {
    const modal = document.getElementById('imageGalleryModal');
    const container = document.getElementById('imageGalleryContainer');
    const titleEl = document.getElementById('galleryCarTitle');
    const viewBtn = document.getElementById('viewFullListingBtn');

    if (!modal || !container) return;

    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Update title and link
    if (titleEl) titleEl.textContent = carTitle || 'Car Images';
    if (viewBtn) viewBtn.href = `car.html?id=${carId}`;

    // Show loading
    container.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading images...</p>
        </div>
    `;

    try {
        // Fetch car images
        const response = await fetch(`${CONFIG.API_URL}?action=get_listing_images&listing_id=${carId}`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success && data.images && data.images.length > 0) {
            carouselImages = data.images;
            currentCarouselIndex = 0;

            // Check if mobile (screen width < 768px)
            const isMobile = window.innerWidth < 768;

            if (isMobile) {
                // Mobile: Carousel view
                renderMobileCarousel();
            } else {
                // Desktop: Grid view
                renderDesktopGrid();
            }
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-images"></i>
                    <p>No images available for this listing</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading images:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load images. Please try again.</p>
            </div>
        `;
    }
}

function renderDesktopGrid() {
    const container = document.getElementById('imageGalleryContainer');
    container.className = 'image-gallery-grid';
    container.innerHTML = carouselImages.map((img, index) => {
        const imageUrl = img.id
            ? `${CONFIG.API_URL}?action=image&id=${img.id}`
            : (img.filename ? `uploads/${img.filename}` : img.file_path);

        return `
            <div class="gallery-image-item ${img.is_primary ? 'primary-image' : ''}">
                <img src="${imageUrl}" alt="Car image ${index + 1}" onclick="viewFullImage('${imageUrl}')">
                ${img.is_primary ? '<div class="primary-badge"><i class="fas fa-star"></i> Featured</div>' : ''}
            </div>
        `;
    }).join('');
}

function renderMobileCarousel() {
    const container = document.getElementById('imageGalleryContainer');
    container.className = 'image-carousel-mobile';

    const imageUrl = carouselImages[currentCarouselIndex].id
        ? `${CONFIG.API_URL}?action=image&id=${carouselImages[currentCarouselIndex].id}`
        : (carouselImages[currentCarouselIndex].filename
            ? `uploads/${carouselImages[currentCarouselIndex].filename}`
            : carouselImages[currentCarouselIndex].file_path);

    const isPrimary = carouselImages[currentCarouselIndex].is_primary;

    container.innerHTML = `
        <div class="carousel-container">
            <button class="carousel-btn carousel-prev" onclick="previousImage()" ${currentCarouselIndex === 0 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>

            <div class="carousel-image-wrapper">
                <img src="${imageUrl}" alt="Car image ${currentCarouselIndex + 1}" class="carousel-image">
                ${isPrimary ? '<div class="primary-badge"><i class="fas fa-star"></i> Featured</div>' : ''}
            </div>

            <button class="carousel-btn carousel-next" onclick="nextImage()" ${currentCarouselIndex === carouselImages.length - 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
        <div class="carousel-indicators">
            ${carouselImages.map((_, index) => `
                <span class="indicator ${index === currentCarouselIndex ? 'active' : ''}" onclick="goToImage(${index})"></span>
            `).join('')}
        </div>
        <div class="carousel-counter">
            ${currentCarouselIndex + 1} / ${carouselImages.length}
        </div>
    `;

    // Add swipe support
    addSwipeSupport();
}

function previousImage() {
    if (currentCarouselIndex > 0) {
        currentCarouselIndex--;
        renderMobileCarousel();
    }
}

function nextImage() {
    if (currentCarouselIndex < carouselImages.length - 1) {
        currentCarouselIndex++;
        renderMobileCarousel();
    }
}

function goToImage(index) {
    currentCarouselIndex = index;
    renderMobileCarousel();
}

function addSwipeSupport() {
    const container = document.querySelector('.carousel-image-wrapper');
    if (!container) return;

    let touchStartX = 0;
    let touchEndX = 0;

    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchStartX - touchEndX > swipeThreshold) {
            // Swipe left - next image
            nextImage();
        }
        if (touchEndX - touchStartX > swipeThreshold) {
            // Swipe right - previous image
            previousImage();
        }
    }
}

function viewFullImage(imageUrl) {
    // Create lightbox overlay
    const lightbox = document.createElement('div');
    lightbox.className = 'image-lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close" onclick="closeLightbox()">
                <i class="fas fa-times"></i>
            </button>
            <img src="${imageUrl}" alt="Full size image">
        </div>
    `;
    
    document.body.appendChild(lightbox);
    
    // Close on click outside image
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
}

function closeLightbox() {
    const lightbox = document.querySelector('.image-lightbox');
    if (lightbox) {
        lightbox.remove();
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('imageGalleryModal');
    if (e.target === modal) {
        closeImageGallery();
    }
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeImageGallery();
    }
});

// Add CSS styles dynamically
const imageGalleryStyles = document.createElement('style');
imageGalleryStyles.textContent = `
    /* Modern Modal Styles */
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 20px;
        backdrop-filter: blur(4px);
        animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    .modal-content.modal-large {
        background: white;
        border-radius: 16px;
        max-width: 1200px;
        width: 100%;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease;
        position: relative;
    }

    @keyframes slideUp {
        from {
            transform: translateY(50px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .modal-header {
        padding: 24px 30px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .modal-header h2 {
        margin: 0;
        font-size: 24px;
        display: flex;
        align-items: center;
        gap: 12px;
        color: #111827;
    }

    .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #6b7280;
        transition: all 0.2s;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .modal-close:hover {
        background: #f3f4f6;
        color: #111827;
    }

    .modal-body {
        padding: 30px;
        overflow-y: auto;
        flex: 1;
    }

    .modal-footer {
        padding: 20px 30px;
        border-top: 1px solid #e5e7eb;
        display: flex;
        gap: 12px;
        justify-content: flex-end;
    }

    .image-gallery-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
    }

    .gallery-image-item {
        position: relative;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: transform 0.2s;
        background: #f5f5f5;
        aspect-ratio: 4/3;
    }

    .gallery-image-item:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .gallery-image-item.primary-image {
        border: 3px solid #ffc107;
    }

    .gallery-image-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        cursor: pointer;
        transition: transform 0.3s;
    }

    .gallery-image-item img:hover {
        transform: scale(1.05);
    }

    .primary-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background: #ffc107;
        color: #000;
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 5px;
    }

    /* Image Count Badge - Unified Styling for All Devices */
    .image-count {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(10px);
        color: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        z-index: 10;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        user-select: none;
    }

    .image-count i {
        font-size: 0.9rem;
    }

    .image-count:hover {
        background: rgba(255, 193, 7, 0.95);
        color: #000;
        transform: scale(1.05) translateY(-2px);
        box-shadow: 0 4px 12px rgba(255, 193, 7, 0.4);
    }

    .image-count:active {
        transform: scale(0.98);
    }

    /* Mobile optimizations */
    @media (max-width: 768px) {
        .image-count {
            top: 8px;
            right: 8px;
            padding: 4px 10px;
            font-size: 0.75rem;
            border-radius: 16px;
        }

        .image-count i {
            font-size: 0.85rem;
        }
    }

    /* Very small screens */
    @media (max-width: 480px) {
        .image-count {
            padding: 3px 8px;
            font-size: 0.7rem;
        }

        .image-count i {
            font-size: 0.8rem;
        }
    }

    /* Mobile Carousel Styles */
    .image-carousel-mobile {
        display: flex;
        flex-direction: column;
        gap: 20px;
        align-items: center;
    }

    .carousel-container {
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .carousel-image-wrapper {
        flex: 1;
        position: relative;
        border-radius: 12px;
        overflow: hidden;
        background: #f5f5f5;
        aspect-ratio: 4/3;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .carousel-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        touch-action: pan-y;
        user-select: none;
    }

    .carousel-btn {
        background: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.2s;
        flex-shrink: 0;
        color: #111827;
    }

    .carousel-btn:hover:not(:disabled) {
        background: #f3f4f6;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .carousel-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }

    .carousel-indicators {
        display: flex;
        gap: 8px;
        justify-content: center;
    }

    .indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #d1d5db;
        cursor: pointer;
        transition: all 0.2s;
    }

    .indicator.active {
        background: #ffc107;
        width: 24px;
        border-radius: 4px;
    }

    .carousel-counter {
        text-align: center;
        font-size: 14px;
        color: #6b7280;
        font-weight: 500;
    }

    /* Lightbox for full-size image viewing */
    .image-lightbox {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
        animation: fadeIn 0.2s ease;
    }

    .lightbox-content {
        position: relative;
        max-width: 95%;
        max-height: 95%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .lightbox-content img {
        max-width: 100%;
        max-height: 90vh;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }

    .lightbox-close {
        position: absolute;
        top: -50px;
        right: 0;
        background: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 20px;
        color: #111827;
        transition: all 0.2s;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .lightbox-close:hover {
        background: #f3f4f6;
        transform: scale(1.1);
    }

    @media (max-width: 768px) {
        .lightbox-close {
            top: 10px;
            right: 10px;
        }

        .modal {
            padding: 10px;
        }

        .modal-content.modal-large {
            max-height: 95vh;
            border-radius: 12px;
        }

        .modal-header {
            padding: 16px 20px;
        }

        .modal-header h2 {
            font-size: 18px;
        }

        .modal-body {
            padding: 20px;
        }

        .modal-footer {
            padding: 16px 20px;
            flex-direction: column-reverse;
        }

        .modal-footer .btn {
            width: 100%;
        }

        .image-gallery-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 10px;
        }
    }
`;

// Append styles to document head
document.head.appendChild(imageGalleryStyles);
