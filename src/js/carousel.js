$(document).ready(function() {
    class ProductCarousel {
        constructor(element) {
            this.$carousel = $(element);
            this.$track = this.$carousel.find('.carousel-track');
            this.$slides = this.$carousel.find('.carousel-slide');
            this.$prevBtn = this.$carousel.find('.carousel-btn-prev');
            this.$nextBtn = this.$carousel.find('.carousel-btn-next');
            this.$indicators = this.$carousel.find('.indicator');
            
            this.currentIndex = 0;
            this.slidesPerView = this.getSlidesPerView();
            this.totalSlides = this.$slides.length;
            this.maxIndex = Math.max(0, this.totalSlides - this.slidesPerView);
            
            this.init();
        }
        
        init() {
            this.setupSlides();
            this.bindEvents();
            this.updateButtons();
            this.updateIndicators();
            
            // Obsługa zmiany rozmiaru okna
            $(window).on('resize.carousel', () => {
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    this.handleResize();
                }, 250);
            });
        }
        
        getSlidesPerView() {
            const width = $(window).width();
            if (width < 576) return 1;
            if (width < 768) return 2;
            if (width < 992) return 3;
            return 4;
        }
        
        setupSlides() {
            const slideWidth = 100 / this.slidesPerView;
            this.$slides.css('width', slideWidth + '%');
        }
        
        bindEvents() {
            // Przyciski nawigacji
            this.$prevBtn.on('click', () => this.prevSlide());
            this.$nextBtn.on('click', () => this.nextSlide());
            
            // Wskaźniki
            this.$indicators.on('click', (e) => {
                const slideIndex = parseInt($(e.target).data('slide'));
                this.goToSlide(slideIndex);
            });
            
            // Obsługa klawiatury
            this.$carousel.on('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.prevSlide();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.nextSlide();
                }
            });
            
            // Obsługa dotyku (swipe)
            let startX = 0;
            let isDragging = false;
            
            this.$track.on('touchstart', (e) => {
                startX = e.originalEvent.touches[0].clientX;
                isDragging = true;
            });
            
            this.$track.on('touchmove', (e) => {
                if (!isDragging) return;
                e.preventDefault();
            });
            
            this.$track.on('touchend', (e) => {
                if (!isDragging) return;
                isDragging = false;
                
                const endX = e.originalEvent.changedTouches[0].clientX;
                const diff = startX - endX;
                
                if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                        this.nextSlide();
                    } else {
                        this.prevSlide();
                    }
                }
            });
        }
        
        prevSlide() {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.updateCarousel();
            }
        }
        
        nextSlide() {
            if (this.currentIndex < this.maxIndex) {
                this.currentIndex++;
                this.updateCarousel();
            }
        }
        
        goToSlide(index) {
            const maxIndicatorIndex = Math.ceil(this.totalSlides / this.slidesPerView) - 1;
            const targetIndex = Math.min(index * this.slidesPerView, this.maxIndex);
            
            if (targetIndex !== this.currentIndex) {
                this.currentIndex = targetIndex;
                this.updateCarousel();
            }
        }
        
        updateCarousel() {
            const translateX = -(this.currentIndex * (100 / this.slidesPerView));
            
            this.$carousel.addClass('carousel-loading');
            
            this.$track.css('transform', `translateX(${translateX}%)`);
            
            setTimeout(() => {
                this.$carousel.removeClass('carousel-loading');
            }, 400);
            
            this.updateButtons();
            this.updateIndicators();
        }
        
        updateButtons() {
            this.$prevBtn.prop('disabled', this.currentIndex === 0);
            this.$nextBtn.prop('disabled', this.currentIndex >= this.maxIndex);
        }
        
        updateIndicators() {
            const activeIndicator = Math.floor(this.currentIndex / this.slidesPerView);
            
            this.$indicators.removeClass('active');
            this.$indicators.eq(activeIndicator).addClass('active');
        }
        
        handleResize() {
            const newSlidesPerView = this.getSlidesPerView();
            
            if (newSlidesPerView !== this.slidesPerView) {
                this.slidesPerView = newSlidesPerView;
                this.maxIndex = Math.max(0, this.totalSlides - this.slidesPerView);
                
                // Dostosuj currentIndex jeśli przekracza nowy maxIndex
                if (this.currentIndex > this.maxIndex) {
                    this.currentIndex = this.maxIndex;
                }
                
                this.setupSlides();
                this.updateCarousel();
            }
        }
        
        // Publiczne API
        destroy() {
            $(window).off('resize.carousel');
            this.$carousel.off();
            this.$track.off();
            this.$prevBtn.off();
            this.$nextBtn.off();
            this.$indicators.off();
        }
        
        getCurrentIndex() {
            return this.currentIndex;
        }
        
        getTotalSlides() {
            return this.totalSlides;
        }
    }
    
    // Inicjalizacja karuzeli
    const carousel = new ProductCarousel('.product-carousel');
    
    // Opcjonalne: automatyczne przewijanie
    let autoplayInterval;
    
    function startAutoplay() {
        autoplayInterval = setInterval(() => {
            if (carousel.getCurrentIndex() >= carousel.getTotalSlides() - carousel.slidesPerView) {
                carousel.goToSlide(0);
            } else {
                carousel.nextSlide();
            }
        }, 5000);
    }
    
    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }
    
    // Zatrzymaj autoplay przy interakcji użytkownika
    $('.product-carousel').on('mouseenter touchstart', stopAutoplay);
    $('.product-carousel').on('mouseleave', startAutoplay);
    
    // Uruchom autoplay (opcjonalnie)
    // startAutoplay();
    
    // Udostępnij carousel globalnie dla debugowania
    window.productCarousel = carousel;
});
