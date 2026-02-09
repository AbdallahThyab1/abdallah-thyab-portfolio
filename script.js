/**
 * ============================================
 * PORTFOLIO ENGINE - RESPONSIVE EDITION
 * ============================================
 * Enhanced for mobile, tablet, and desktop responsiveness
 * Focus on performance, stability, and mobile UX
 * ============================================
 */

'use strict';

// ============================================
// CONFIGURATION & CONSTANTS - ENHANCED FOR RESPONSIVENESS
// ============================================
const CONFIG = {
    theme: localStorage.getItem('portfolio-theme') || 'light',
    animations: localStorage.getItem('portfolio-animations') !== 'false',
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    isMobile: window.innerWidth <= 767,
    isTablet: window.innerWidth >= 768 && window.innerWidth <= 1023,
    isDesktop: window.innerWidth >= 1024,
    performance: {
        debounceDelay: 100,
        throttleDelay: 200
    }
};

const STATE = {
    lastScrollY: 0,
    scrollDirection: 'down',
    isNavOpen: false,
    isThemeChanging: false,
    isMobileMenuOpen: false,
    touchStartX: 0,
    touchStartY: 0
};

// ============================================
// DOM CACHE WITH ERROR HANDLING - RESPONSIVE ENHANCEMENT
// ============================================
const DOM = {
    // Core Elements
    html: document.documentElement,
    body: document.body,
    
    // Theme & UI
    themeToggle: document.querySelector('.theme-toggle'),
    
    // Navigation - Enhanced for mobile
    navToggle: document.getElementById('nav-toggle'),
    navToggleLabel: document.querySelector('.nav__toggle-label'),
    navMenu: document.getElementById('nav-menu'),
    navLinks: document.querySelectorAll('.nav__link'),
    header: document.querySelector('.header'),
    
    // Interactive Elements
    contactForm: document.getElementById('contact-form'),
    projectCards: document.querySelectorAll('.project-card'),
    allButtons: document.querySelectorAll('button, .btn'),
    
    // Content
    currentYear: document.getElementById('currentYear'),
    heroTitle: document.querySelector('.hero__title'),
    
    // Performance Monitoring
    performance: {
        startTime: performance.now(),
        resources: performance.getEntriesByType('resource')
    }
};

// ============================================
// RESPONSIVE UTILITIES
// ============================================
const ResponsiveUtils = {
    /**
     * Check current screen size and update CONFIG
     */
    updateScreenSize: () => {
        CONFIG.isMobile = window.innerWidth <= 767;
        CONFIG.isTablet = window.innerWidth >= 768 && window.innerWidth <= 1023;
        CONFIG.isDesktop = window.innerWidth >= 1024;
        
        return {
            isMobile: CONFIG.isMobile,
            isTablet: CONFIG.isTablet,
            isDesktop: CONFIG.isDesktop
        };
    },

    /**
     * Execute function only on mobile
     */
    onMobile: (callback) => {
        if (CONFIG.isMobile) callback();
    },

    /**
     * Execute function only on desktop
     */
    onDesktop: (callback) => {
        if (CONFIG.isDesktop) callback();
    },

    /**
     * Adjust behavior based on screen size
     */
    responsiveAction: (mobileAction, tabletAction, desktopAction) => {
        if (CONFIG.isMobile && mobileAction) mobileAction();
        else if (CONFIG.isTablet && tabletAction) tabletAction();
        else if (CONFIG.isDesktop && desktopAction) desktopAction();
    },

    /**
     * Handle orientation changes
     */
    handleOrientationChange: () => {
        const handleChange = () => {
            ResponsiveUtils.updateScreenSize();
            console.log(`📱 Orientation changed: ${window.innerWidth}x${window.innerHeight}, Mobile: ${CONFIG.isMobile}`);
            
            // Close mobile menu when switching to landscape on tablet/desktop
            if (window.innerWidth >= 768 && STATE.isMobileMenuOpen) {
                ResponsiveUtils.closeMobileMenu();
            }
        };
        
        // Debounced resize handler
        window.addEventListener('resize', Performance.debounce(handleChange, 250));
    }
};

// ============================================
// MOBILE NAVIGATION ENHANCEMENTS
// ============================================
const MobileNavigation = {
    /**
     * Initialize mobile navigation
     */
    init: () => {
        if (!DOM.navToggle || !DOM.navMenu) return;
        
        // Add ARIA attributes for accessibility
        MobileNavigation.setupAriaAttributes();
        
        // Setup mobile menu toggle
        MobileNavigation.setupMobileToggle();
        
        // Setup touch gestures for mobile menu
        if (CONFIG.isMobile) {
            MobileNavigation.setupTouchGestures();
        }
        
        // Close menu when clicking outside on mobile
        MobileNavigation.setupOutsideClick();
        
        // Handle ESC key to close menu
        MobileNavigation.setupKeyboardClose();
        
        // Update on screen resize
        window.addEventListener('resize', Performance.debounce(() => {
            ResponsiveUtils.updateScreenSize();
            
            // Auto-close menu when switching to desktop
            if (CONFIG.isDesktop && STATE.isMobileMenuOpen) {
                MobileNavigation.closeMenu();
            }
        }, 200));
    },

    /**
     * Setup ARIA attributes for accessibility
     */
    setupAriaAttributes: () => {
        if (DOM.navToggleLabel) {
            DOM.navToggleLabel.setAttribute('aria-label', 'Toggle navigation menu');
            DOM.navToggleLabel.setAttribute('aria-expanded', 'false');
        }
        
        DOM.navLinks.forEach(link => {
            link.setAttribute('tabindex', '0');
        });
    },

    /**
     * Setup mobile menu toggle with enhanced UX
     */
    setupMobileToggle: () => {
        if (!DOM.navToggleLabel) return;
        
        DOM.navToggleLabel.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (DOM.navToggle.checked) {
                MobileNavigation.closeMenu();
            } else {
                MobileNavigation.openMenu();
            }
        });
        
        // Update ARIA attribute when menu state changes
        DOM.navToggle.addEventListener('change', () => {
            if (DOM.navToggleLabel) {
                DOM.navToggleLabel.setAttribute('aria-expanded', DOM.navToggle.checked.toString());
            }
            STATE.isMobileMenuOpen = DOM.navToggle.checked;
        });
    },

    /**
     * Setup touch gestures for mobile menu
     */
    setupTouchGestures: () => {
        let touchStartX = 0;
        let touchEndX = 0;
        const swipeThreshold = 50;
        
        DOM.navMenu.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        DOM.navMenu.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const swipeDistance = touchEndX - touchStartX;
            
            // Swipe right to close menu
            if (swipeDistance > swipeThreshold && STATE.isMobileMenuOpen) {
                MobileNavigation.closeMenu();
            }
        }, { passive: true });
    },

    /**
     * Close menu when clicking outside on mobile
     */
    setupOutsideClick: () => {
        document.addEventListener('click', (e) => {
            if (!STATE.isMobileMenuOpen || CONFIG.isDesktop) return;
            
            const isClickInsideMenu = DOM.navMenu.contains(e.target);
            const isClickOnToggle = DOM.navToggleLabel?.contains(e.target);
            
            if (!isClickInsideMenu && !isClickOnToggle) {
                MobileNavigation.closeMenu();
            }
        });
        
        // Also close when tapping on navigation links (already handled, but ensure it works)
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (STATE.isMobileMenuOpen) {
                    setTimeout(() => {
                        MobileNavigation.closeMenu();
                    }, 100); // Small delay for smooth scroll to work
                }
            });
        });
    },

    /**
     * Setup ESC key to close menu
     */
    setupKeyboardClose: () => {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && STATE.isMobileMenuOpen) {
                MobileNavigation.closeMenu();
            }
        });
    },

    /**
     * Open mobile menu with animation
     */
    openMenu: () => {
        DOM.navToggle.checked = true;
        STATE.isMobileMenuOpen = true;
        
        // Prevent body scroll when menu is open on mobile
        if (CONFIG.isMobile) {
            document.body.style.overflow = 'hidden';
        }
        
        // Focus first nav item for keyboard navigation
        setTimeout(() => {
            if (DOM.navLinks.length > 0) {
                DOM.navLinks[0].focus();
            }
        }, 100);
    },

    /**
     * Close mobile menu with animation
     */
    closeMenu: () => {
        DOM.navToggle.checked = false;
        STATE.isMobileMenuOpen = false;
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Return focus to toggle button
        if (DOM.navToggleLabel) {
            setTimeout(() => {
                DOM.navToggleLabel.focus();
            }, 100);
        }
    }
};

// ============================================
// PERFORMANCE OPTIMIZATION UTILITIES - ENHANCED FOR MOBILE
// ============================================
const Performance = {
    /**
     * Debounce function for scroll/resize events
     */
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function for frequent events
     */
    throttle: (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Request Animation Frame wrapper with mobile optimization
     */
    raf: (() => {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        return (callback) => {
            if (isMobile && !CONFIG.animations) {
                // Skip RAF on mobile with reduced motion for better performance
                setTimeout(callback, 0);
            } else {
                return (window.requestAnimationFrame ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame ||
                        function(callback) { setTimeout(callback, 1000 / 60); })(callback);
            }
        };
    })(),

    /**
     * Measure performance
     */
    mark: (name) => {
        if (window.performance && performance.mark) {
            performance.mark(`portfolio-${name}`);
        }
    },

    /**
     * Log performance metrics
     */
    logMetrics: () => {
        const loadTime = performance.now() - DOM.performance.startTime;
        console.log(`🚀 Portfolio loaded in ${loadTime.toFixed(2)}ms`);
        console.log(`📱 Device: ${CONFIG.isMobile ? 'Mobile' : CONFIG.isTablet ? 'Tablet' : 'Desktop'} (${window.innerWidth}x${window.innerHeight})`);
        
        // Log resource loading only if slow
        if (loadTime > 1000) {
            DOM.performance.resources.forEach(resource => {
                if (resource.duration > 1000) {
                    console.warn(`⏱️ Slow resource: ${resource.name} - ${resource.duration.toFixed(2)}ms`);
                }
            });
        }
    },

    /**
     * Optimize for mobile performance
     */
    optimizeForMobile: () => {
        if (!CONFIG.isMobile) return;
        
        // Reduce animation complexity on mobile
        if (CONFIG.reducedMotion) {
            document.body.classList.add('reduced-motion');
        }
        
        // Lazy load images that aren't in viewport
        Performance.lazyLoadImages();
    },

    /**
     * Lazy load images for better mobile performance
     */
    lazyLoadImages: () => {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '50px 0px' });
        
        images.forEach(img => imageObserver.observe(img));
    }
};

// ============================================
// THEME MANAGEMENT SYSTEM - ENHANCED FOR MOBILE
// ============================================
const ThemeEngine = {
    /**
     * Get current theme with fallbacks
     */
    getCurrentTheme: () => {
        const saved = localStorage.getItem('portfolio-theme');
        if (saved) return saved;
        
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return systemDark ? 'dark' : 'light';
    },

    /**
     * Apply theme with smooth transitions
     */
    applyTheme: (theme, instant = false) => {
        if (STATE.isThemeChanging) return;
        
        STATE.isThemeChanging = true;
        
        // Add transition class for smooth change
        if (!instant && !CONFIG.reducedMotion) {
            DOM.body.classList.add('theme-transitioning');
        }
        
        // Set theme attribute
        DOM.html.setAttribute('data-theme', theme);
        localStorage.setItem('portfolio-theme', theme);
        
        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#0a0a0a' : '#ffffff');
        }
        
        // Dispatch custom event
        const event = new CustomEvent('themechange', {
            detail: { theme, timestamp: Date.now() }
        });
        document.dispatchEvent(event);
        
        // Remove transition class after animation
        if (!instant && !CONFIG.reducedMotion) {
            setTimeout(() => {
                DOM.body.classList.remove('theme-transitioning');
                STATE.isThemeChanging = false;
            }, 300);
        } else {
            STATE.isThemeChanging = false;
        }
        
        // Log theme change
        console.log(`🎨 Theme changed to: ${theme}`);
    },

    /**
     * Toggle between light/dark themes with mobile optimization
     */
    toggleTheme: () => {
        const current = DOM.html.getAttribute('data-theme');
        const newTheme = current === 'light' ? 'dark' : 'light';
        
        ThemeEngine.applyTheme(newTheme);
        
        // Add button feedback animation (simpler on mobile)
        if (DOM.themeToggle) {
            if (CONFIG.isMobile) {
                DOM.themeToggle.style.transform = 'scale(0.95)';
            } else {
                DOM.themeToggle.style.transform = 'scale(0.9) rotate(15deg)';
            }
            
            setTimeout(() => {
                DOM.themeToggle.style.transform = '';
            }, 200);
        }
    },

    /**
     * Listen for system theme changes
     */
    listenToSystemTheme: () => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = (e) => {
            // Only change if user hasn't set a preference
            if (!localStorage.getItem('portfolio-theme')) {
                ThemeEngine.applyTheme(e.matches ? 'dark' : 'light', true);
            }
        };
        
        // Use try-catch for older browser support
        try {
            mediaQuery.addEventListener('change', handleChange);
        } catch (error) {
            mediaQuery.addListener(handleChange);
        }
    },

    /**
     * Setup theme toggle with mobile-friendly interactions
     */
    setupThemeToggle: () => {
        if (!DOM.themeToggle) return;
        
        // Click handler
        DOM.themeToggle.addEventListener('click', ThemeEngine.toggleTheme);
        
        // Touch feedback for mobile
        if (CONFIG.isMobile) {
            DOM.themeToggle.addEventListener('touchstart', () => {
                DOM.themeToggle.classList.add('touch-active');
            });
            
            DOM.themeToggle.addEventListener('touchend', () => {
                setTimeout(() => {
                    DOM.themeToggle.classList.remove('touch-active');
                }, 150);
            });
        }
    }
};

// ============================================
// SCROLL & ANIMATION ENGINE - MOBILE OPTIMIZED
// ============================================
const ScrollEngine = {
    /**
     * Initialize scroll effects with mobile considerations
     */
    init: () => {
        // Skip heavy animations on mobile with reduced motion
        if (CONFIG.reducedMotion && CONFIG.isMobile) return;
        
        // Add scroll-triggered animations (simpler on mobile)
        if (!CONFIG.isMobile || CONFIG.animations) {
            ScrollEngine.setupScrollAnimations();
        }
        
        // Handle scroll direction (throttled more on mobile)
        const throttleDelay = CONFIG.isMobile ? 100 : 50;
        window.addEventListener('scroll', Performance.throttle(ScrollEngine.handleScroll, throttleDelay));
        
        // Add scroll progress indicator (only on desktop)
        if (CONFIG.isDesktop) {
            ScrollEngine.createScrollProgress();
        }
        
        // Handle mobile-specific scroll behaviors
        if (CONFIG.isMobile) {
            ScrollEngine.setupMobileScroll();
        }
    },

    /**
     * Handle scroll events with mobile optimization
     */
    handleScroll: () => {
        const currentScrollY = window.scrollY;
        
        // Determine scroll direction
        STATE.scrollDirection = currentScrollY > STATE.lastScrollY ? 'down' : 'up';
        STATE.lastScrollY = currentScrollY;
        
        // Add/remove scroll class for header effects
        if (currentScrollY > 100) {
            DOM.body.classList.add('scrolled');
        } else {
            DOM.body.classList.remove('scrolled');
        }
        
        // Trigger scroll animations (only if not mobile or animations enabled)
        if (!CONFIG.isMobile || CONFIG.animations) {
            ScrollEngine.triggerScrollAnimations(currentScrollY);
        }
    },

    /**
     * Setup scroll-triggered animations with mobile fallback
     */
    setupScrollAnimations: () => {
        // Add data attributes for animation
        document.querySelectorAll('.project-card, .service-card').forEach((el, index) => {
            el.setAttribute('data-animate', '');
            
            // Reduce delay on mobile for better performance
            const delay = CONFIG.isMobile ? index * 50 : index * 100;
            el.setAttribute('data-animate-delay', delay);
        });
    },

    /**
     * Trigger animations on scroll with mobile optimization
     */
    triggerScrollAnimations: (scrollY) => {
        const windowHeight = window.innerHeight;
        const triggerPoint = CONFIG.isMobile ? windowHeight * 0.9 : windowHeight * 0.8;
        
        document.querySelectorAll('[data-animate]').forEach(el => {
            const rect = el.getBoundingClientRect();
            const isVisible = rect.top < triggerPoint && rect.bottom > 0;
            
            if (isVisible && !el.classList.contains('animated')) {
                const delay = parseInt(el.getAttribute('data-animate-delay') || 0);
                
                setTimeout(() => {
                    el.classList.add('animated');
                    
                    // Add staggered animation (simpler on mobile)
                    if (el.classList.contains('project-card')) {
                        if (CONFIG.isMobile && CONFIG.reducedMotion) {
                            el.style.opacity = '1';
                        } else {
                            el.style.transform = 'translateY(0)';
                            el.style.opacity = '1';
                        }
                    }
                }, delay);
            }
        });
    },

    /**
     * Create scroll progress indicator (desktop only)
     */
    createScrollProgress: () => {
        // Only create on desktop
        if (CONFIG.isMobile || CONFIG.isTablet) return;
        
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.innerHTML = `
            <div class="scroll-progress__bar"></div>
        `;
        DOM.body.appendChild(progressBar);
        
        // Update progress on scroll
        const updateProgress = () => {
            const winHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;
            const scrolled = window.scrollY;
            const progress = (scrolled / (docHeight - winHeight)) * 100;
            
            const bar = progressBar.querySelector('.scroll-progress__bar');
            bar.style.width = `${progress}%`;
        };
        
        window.addEventListener('scroll', Performance.throttle(updateProgress, 50));
    },

    /**
     * Setup mobile-specific scroll behaviors
     */
    setupMobileScroll: () => {
        // Prevent rubber-band scrolling on iOS when at top/bottom
        let startY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            const currentY = e.touches[0].clientY;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;
            
            // At top of page and trying to scroll down
            if (scrollTop <= 0 && currentY > startY) {
                e.preventDefault();
            }
            
            // At bottom of page and trying to scroll up
            if (scrollTop + clientHeight >= scrollHeight && currentY < startY) {
                e.preventDefault();
            }
        }, { passive: false });
    },

    /**
     * Smooth scroll to element with mobile optimization
     */
    smoothScrollTo: (element, offset = 80) => {
        if (CONFIG.reducedMotion || CONFIG.isMobile) {
            // Instant scroll on mobile or reduced motion
            element.scrollIntoView();
            return;
        }
        
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
};

// ============================================
// INTERACTION ENHANCEMENTS - MOBILE FRIENDLY
// ============================================
const InteractionEngine = {
    /**
     * Initialize all interactive elements with mobile support
     */
    init: () => {
        // Enhanced button interactions
        InteractionEngine.enhanceButtons();
        
        // Project card interactions
        InteractionEngine.enhanceProjectCards();
        
        // Form enhancements
        InteractionEngine.enhanceForms();
        
        // Keyboard navigation
        InteractionEngine.setupKeyboardNav();
        
        // Touch device optimizations
        if ('ontouchstart' in window) {
            InteractionEngine.setupTouchOptimizations();
        }
    },

    /**
     * Enhance button interactions for touch devices
     */
    enhanceButtons: () => {
        DOM.allButtons.forEach(button => {
            // Skip if already enhanced
            if (button.classList.contains('interaction-enhanced')) return;
            
            // Add touch feedback class for mobile
            if (CONFIG.isMobile) {
                button.classList.add('touch-target');
            }
            
            // Ripple effect (simpler on mobile)
            button.addEventListener('click', (e) => {
                if (button.classList.contains('no-ripple')) return;
                
                // Skip ripple on mobile if reduced motion
                if (CONFIG.isMobile && CONFIG.reducedMotion) return;
                
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.7);
                    transform: scale(0);
                    animation: ripple-animation 0.6s linear;
                    width: ${size}px;
                    height: ${size}px;
                    top: ${y}px;
                    left: ${x}px;
                    pointer-events: none;
                `;
                
                button.style.position = 'relative';
                button.style.overflow = 'hidden';
                button.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
            
            // Add active state for touch devices
            if (CONFIG.isMobile) {
                button.addEventListener('touchstart', () => {
                    button.classList.add('active');
                });
                
                button.addEventListener('touchend', () => {
                    setTimeout(() => {
                        button.classList.remove('active');
                    }, 150);
                });
            }
            
            // Mark as enhanced
            button.classList.add('interaction-enhanced');
        });
    },

    /**
     * Enhance project cards for touch interactions
     */
    enhanceProjectCards: () => {
        DOM.projectCards.forEach(card => {
            // Live project interactions
            if (card.getAttribute('data-live') === 'true') {
                if (CONFIG.isMobile) {
                    // Simpler interactions on mobile
                    card.addEventListener('touchstart', () => {
                        card.classList.add('card-active');
                    });
                    
                    card.addEventListener('touchend', () => {
                        setTimeout(() => {
                            card.classList.remove('card-active');
                        }, 150);
                    });
                } else {
                    // Desktop hover effects
                    card.addEventListener('mouseenter', () => {
                        if (CONFIG.reducedMotion) return;
                        
                        card.style.transform = 'translateY(-8px) scale(1.02)';
                        card.style.zIndex = '10';
                    });
                    
                    card.addEventListener('mouseleave', () => {
                        if (CONFIG.reducedMotion) return;
                        
                        card.style.transform = 'translateY(0) scale(1)';
                        card.style.zIndex = '';
                    });
                }
                
                // Click effect
                card.addEventListener('click', (e) => {
                    if (e.target.tagName === 'A') return;
                    
                    const link = card.querySelector('.btn');
                    if (link) {
                        link.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            link.style.transform = '';
                        }, 150);
                    }
                });
            }
            
            // Non-live projects - visual feedback only
            if (card.getAttribute('data-live') === 'false') {
                if (CONFIG.isMobile) {
                    card.style.opacity = '0.8'; // More visible on mobile
                }
            }
        });
    },

    /**
     * Enhance form interactions for mobile
     */
    enhanceForms: () => {
        if (!DOM.contactForm) return;
        
        const inputs = DOM.contactForm.querySelectorAll('.form__input, .form__textarea');
        
        inputs.forEach(input => {
            // Floating label effect
            const label = input.previousElementSibling;
            if (label && label.classList.contains('form__label')) {
                input.addEventListener('focus', () => {
                    label.classList.add('form__label--active');
                });
                
                input.addEventListener('blur', () => {
                    if (!input.value) {
                        label.classList.remove('form__label--active');
                    }
                });
                
                // Check initial value
                if (input.value) {
                    label.classList.add('form__label--active');
                }
            }
            
            // Real-time validation
            input.addEventListener('input', InteractionEngine.validateInput);
            
            // Auto-resize textarea (simpler on mobile)
            if (input.tagName === 'TEXTAREA') {
                input.addEventListener('input', () => {
                    if (CONFIG.isMobile) {
                        // Fixed height on mobile for better UX
                        input.style.height = '120px';
                    } else {
                        input.style.height = 'auto';
                        input.style.height = input.scrollHeight + 'px';
                    }
                });
            }
            
            // Better mobile keyboard handling
            if (CONFIG.isMobile) {
                input.addEventListener('focus', () => {
                    // Scroll input into view on mobile
                    setTimeout(() => {
                        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                });
            }
        });
        
        // Form submission
        DOM.contactForm.addEventListener('submit', InteractionEngine.handleFormSubmit);
    },

    /**
     * Validate input in real-time
     */
    validateInput: (e) => {
        const input = e.target;
        const value = input.value.trim();
        
        // Remove existing error
        input.classList.remove('form__input--error');
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('form__error')) {
            errorElement.remove();
        }
        
        // Validate based on input type
        if (input.hasAttribute('required') && !value) {
            InteractionEngine.showInputError(input, 'This field is required');
            return false;
        }
        
        if (input.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                InteractionEngine.showInputError(input, 'Please enter a valid email');
                return false;
            }
        }
        
        return true;
    },

    /**
     * Show input error with mobile-friendly styling
     */
    showInputError: (input, message) => {
        input.classList.add('form__input--error');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'form__error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #ef4444;
            font-size: ${CONFIG.isMobile ? '0.75rem' : '0.875rem'};
            margin-top: 0.25rem;
            animation: slideDown 0.3s ease;
        `;
        
        input.parentNode.insertBefore(errorElement, input.nextSibling);
        
        // Shake animation (skip on mobile with reduced motion)
        if (!CONFIG.reducedMotion) {
            input.style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                input.style.animation = '';
            }, 500);
        }
        
        // Scroll to error on mobile
        if (CONFIG.isMobile) {
            setTimeout(() => {
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    },

    /**
     * Handle form submission with mobile optimization
     */
    handleFormSubmit: async (e) => {
        e.preventDefault();
        
        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const originalContent = submitButton.innerHTML;
        
        // Validate all inputs
        let isValid = true;
        const inputs = form.querySelectorAll('[required]');
        inputs.forEach(input => {
            if (!InteractionEngine.validateInput({ target: input })) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            form.classList.add('form--error');
            setTimeout(() => form.classList.remove('form--error'), 3000);
            return;
        }
        
        // Disable submit button
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <span class="btn__spinner">
                <i class="fas fa-spinner fa-spin"></i>
            </span>
            <span class="btn__text">Sending...</span>
        `;
        
        try {
            // Simulate API call (shorter on mobile)
            const delay = CONFIG.isMobile ? 1000 : 1500;
            await new Promise(resolve => setTimeout(resolve, delay));
            
            // Success state
            submitButton.innerHTML = `
                <i class="fas fa-check"></i>
                <span class="btn__text">Sent successfully!</span>
            `;
            submitButton.style.backgroundColor = '#10b981';
            
            // Reset form
            form.reset();
            
            // Remove active labels
            form.querySelectorAll('.form__label--active').forEach(label => {
                label.classList.remove('form__label--active');
            });
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'form__success';
            successMessage.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <p>Thank you for your message! We'll get back to you soon.</p>
            `;
            form.prepend(successMessage);
            
            // Reset after delay (shorter on mobile)
            const resetDelay = CONFIG.isMobile ? 2000 : 3000;
            setTimeout(() => {
                submitButton.innerHTML = originalContent;
                submitButton.disabled = false;
                submitButton.style.backgroundColor = '';
                successMessage.remove();
            }, resetDelay);
            
            // Track conversion
            console.log('📨 Form submitted successfully');
            
        } catch (error) {
            // Error state
            submitButton.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <span class="btn__text">Error, please try again</span>
            `;
            submitButton.style.backgroundColor = '#ef4444';
            
            setTimeout(() => {
                submitButton.innerHTML = originalContent;
                submitButton.disabled = false;
                submitButton.style.backgroundColor = '';
            }, 3000);
            
            console.error('Form submission error:', error);
        }
    },

    /**
     * Setup keyboard navigation with mobile considerations
     */
    setupKeyboardNav: () => {
        // Skip on mobile (virtual keyboard interferes)
        if (CONFIG.isMobile) return;
        
        document.addEventListener('keydown', (e) => {
            // Skip if user is typing in a form
            if (e.target.matches('input, textarea, select')) return;
            
            // Theme toggle: Ctrl/Cmd + T
            if ((e.ctrlKey || e.metaKey) && e.key === 't') {
                e.preventDefault();
                ThemeEngine.toggleTheme();
            }
            
            // Navigation shortcuts
            if (e.key === '1' && e.altKey) {
                e.preventDefault();
                document.querySelector('[href="#home"]')?.click();
            }
            
            if (e.key === '2' && e.altKey) {
                e.preventDefault();
                document.querySelector('[href="#projects"]')?.click();
            }
            
            if (e.key === '3' && e.altKey) {
                e.preventDefault();
                document.querySelector('[href="#contact"]')?.click();
            }
            
            // Escape to close navigation
            if (e.key === 'Escape' && STATE.isMobileMenuOpen) {
                MobileNavigation.closeMenu();
            }
        });
    },

    /**
     * Setup touch-specific optimizations
     */
    setupTouchOptimizations: () => {
        // Increase tap target sizes on mobile
        if (CONFIG.isMobile) {
            document.querySelectorAll('a, button, .btn').forEach(el => {
                if (el.offsetHeight < 44 || el.offsetWidth < 44) {
                    el.classList.add('small-tap-target');
                }
            });
        }
        
        // Prevent zoom on double-tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // Improve touch scrolling
        document.addEventListener('touchmove', (e) => {
            // Allow default touch scrolling
        }, { passive: true });
    }
};

// ============================================
// VISUAL EFFECTS & ANIMATIONS - MOBILE OPTIMIZED
// ============================================
const VisualEffects = {
    /**
     * Initialize visual effects with mobile performance in mind
     */
    init: () => {
        // Skip heavy effects on mobile or reduced motion
        if (CONFIG.reducedMotion || CONFIG.isMobile) return;
        
        // Typing animation for hero (only on desktop)
        if (CONFIG.isDesktop) {
            VisualEffects.heroTypingAnimation();
        }
        
        // Particle background (only on desktop)
        if (CONFIG.isDesktop && CONFIG.animations) {
            VisualEffects.createParticles();
        }
        
        // Gradient animation (lighter on mobile)
        VisualEffects.animateGradients();
    },

    /**
     * Typing animation for hero section
     */
    heroTypingAnimation: () => {
        if (!DOM.heroTitle) return;
        
        const lines = DOM.heroTitle.querySelectorAll('.hero__title-line');
        lines.forEach((line, index) => {
            const text = line.textContent;
            line.textContent = '';
            line.style.opacity = '1';
            
            let charIndex = 0;
            const typeChar = () => {
                if (charIndex < text.length) {
                    line.textContent += text.charAt(charIndex);
                    charIndex++;
                    setTimeout(typeChar, 50 + Math.random() * 50);
                }
            };
            
            // Stagger animation
            setTimeout(typeChar, index * 300);
        });
    },

    /**
     * Create particle background (desktop only)
     */
    createParticles: () => {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        
        const particleCount = CONFIG.isDesktop ? 15 : 5; // Fewer on tablet
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random properties
            const size = Math.random() * 4 + 1;
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            const duration = Math.random() * 10 + 10;
            const delay = Math.random() * 5;
            
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: var(--color-accent);
                border-radius: 50%;
                opacity: ${Math.random() * 0.3 + 0.1};
                left: ${posX}%;
                top: ${posY}%;
                animation: float-particle ${duration}s infinite ${delay}s linear;
                pointer-events: none;
                z-index: 1;
            `;
            
            hero.appendChild(particle);
            particles.push(particle);
        }
        
        // Add CSS animation
        if (!document.querySelector('#particle-animation')) {
            const style = document.createElement('style');
            style.id = 'particle-animation';
            style.textContent = `
                @keyframes float-particle {
                    0% {
                        transform: translate(0, 0) rotate(0deg);
                        opacity: 0.1;
                    }
                    100% {
                        transform: translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px) rotate(360deg);
                        opacity: 0.1;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    },

    /**
     * Animate gradients with mobile performance
     */
    animateGradients: () => {
        // Skip on mobile for better performance
        if (CONFIG.isMobile) return;
        
        const gradients = document.querySelectorAll('.project-card__image-inner');
        
        gradients.forEach((gradient, index) => {
            // Only animate if not on mobile and animations enabled
            if (CONFIG.animations && !CONFIG.isMobile) {
                gradient.style.animation = `gradient-shift ${20 + index * 2}s infinite alternate`;
            }
        });
        
        // Add gradient animation CSS
        if (!document.querySelector('#gradient-animation') && CONFIG.animations && !CONFIG.isMobile) {
            const style = document.createElement('style');
            style.id = 'gradient-animation';
            style.textContent = `
                @keyframes gradient-shift {
                    0% {
                        filter: hue-rotate(0deg);
                    }
                    100% {
                        filter: hue-rotate(20deg);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
};

// ============================================
// ERROR HANDLING & DEBUGGING - MOBILE AWARE
// ============================================
const ErrorHandler = {
    /**
     * Initialize error handling
     */
    init: () => {
        // Global error handler
        window.addEventListener('error', ErrorHandler.handleError);
        
        // Promise rejection handler
        window.addEventListener('unhandledrejection', ErrorHandler.handlePromiseRejection);
        
        // Network error handling
        ErrorHandler.setupNetworkMonitoring();
    },

    /**
     * Handle JavaScript errors
     */
    handleError: (event) => {
        const error = {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            isMobile: CONFIG.isMobile
        };
        
        console.error('❌ JavaScript Error:', error);
        
        // Don't show error to user in production
        if (window.location.hostname === 'localhost') {
            ErrorHandler.showErrorToast(error.message);
        }
        
        return false;
    },

    /**
     * Handle promise rejections
     */
    handlePromiseRejection: (event) => {
        console.error('❌ Promise Rejection:', event.reason);
    },

    /**
     * Setup network monitoring
     */
    setupNetworkMonitoring: () => {
        // Online/offline detection
        window.addEventListener('online', () => {
            console.log('✅ Back online');
            document.body.classList.remove('offline');
        });
        
        window.addEventListener('offline', () => {
            console.warn('⚠️ Offline mode');
            document.body.classList.add('offline');
            
            // Show subtle offline indicator
            ErrorHandler.showOfflineIndicator();
        });
    },

    /**
     * Show error toast (development only)
     */
    showErrorToast: (message) => {
        // Skip on mobile in production
        if (CONFIG.isMobile && window.location.hostname !== 'localhost') return;
        
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message.substring(0, 50)}...</span>
            <button class="error-toast__close">&times;</button>
        `;
        
        document.body.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => toast.remove(), 5000);
        
        // Close button
        toast.querySelector('.error-toast__close').addEventListener('click', () => {
            toast.remove();
        });
    },

    /**
     * Show offline indicator
     */
    showOfflineIndicator: () => {
        const indicator = document.createElement('div');
        indicator.className = 'offline-indicator';
        indicator.innerHTML = `
            <i class="fas fa-wifi-slash"></i>
            <span>You are offline</span>
        `;
        
        document.body.appendChild(indicator);
        
        // Remove when back online
        window.addEventListener('online', () => {
            indicator.classList.add('fade-out');
            setTimeout(() => indicator.remove(), 300);
        }, { once: true });
    }
};

// ============================================
// INITIALIZATION - RESPONSIVE FIRST
// ============================================
const PortfolioEngine = {
    /**
     * Initialize everything with responsive considerations
     */
    init: () => {
        Performance.mark('init-start');
        
        console.log('%c🎨 Initializing Portfolio Engine...', 'color: #0066ff; font-weight: bold;');
        console.log(`📱 Device: ${CONFIG.isMobile ? 'Mobile' : CONFIG.isTablet ? 'Tablet' : 'Desktop'}`);
        
        // 1. Update screen size
        ResponsiveUtils.updateScreenSize();
        
        // 2. Set current year
        if (DOM.currentYear) {
            DOM.currentYear.textContent = new Date().getFullYear();
        }
        
        // 3. Initialize systems in order of importance
        ErrorHandler.init();
        Performance.optimizeForMobile();
        
        // 4. Theme system
        ThemeEngine.applyTheme(CONFIG.theme, true);
        ThemeEngine.listenToSystemTheme();
        ThemeEngine.setupThemeToggle();
        
        // 5. Mobile navigation (critical for mobile UX)
        MobileNavigation.init();
        
        // 6. Initialize engines
        ScrollEngine.init();
        InteractionEngine.init();
        
        // 7. Visual effects (low priority, can be delayed)
        setTimeout(() => {
            VisualEffects.init();
        }, 500);
        
        // 8. Setup orientation/resize handling
        ResponsiveUtils.handleOrientationChange();
        
        // 9. Performance logging
        Performance.mark('init-end');
        
        // Measure initialization time
        const initTime = performance.now() - DOM.performance.startTime;
        console.log(`✅ Portfolio ready in ${initTime.toFixed(2)}ms`);
        
        // Add helpful global methods
        PortfolioEngine.exposeGlobalMethods();
        
        // Dispatch ready event
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent('portfolio:ready', {
                detail: {
                    loadTime: initTime,
                    isMobile: CONFIG.isMobile,
                    isTablet: CONFIG.isTablet,
                    isDesktop: CONFIG.isDesktop
                }
            }));
        }, 100);
    },

    /**
     * Setup event listeners with mobile considerations
     */
    setupEventListeners: () => {
        // Theme toggle already handled in ThemeEngine.setupThemeToggle()
        
        // Navigation links (enhanced for mobile)
        if (DOM.navLinks) {
            DOM.navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const href = link.getAttribute('href');
                    if (href.startsWith('#')) {
                        e.preventDefault();
                        const target = document.querySelector(href);
                        if (target) {
                            ScrollEngine.smoothScrollTo(target, 100);
                        }
                    }
                    
                    // Close mobile menu with delay for smooth scroll
                    if (STATE.isMobileMenuOpen) {
                        setTimeout(() => {
                            MobileNavigation.closeMenu();
                        }, 100);
                    }
                });
            });
        }
        
        // Smooth scroll for all anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    ScrollEngine.smoothScrollTo(target, 100);
                }
            });
        });
        
        // Window resize optimization
        window.addEventListener('resize', Performance.debounce(() => {
            ResponsiveUtils.updateScreenSize();
            console.log(`📱 Window resized: ${window.innerWidth}x${window.innerHeight}, Mobile: ${CONFIG.isMobile}`);
        }, 250));
        
        // Beforeunload - save state
        window.addEventListener('beforeunload', () => {
            localStorage.setItem('portfolio-last-visit', Date.now());
            localStorage.setItem('portfolio-last-screen-size', `${window.innerWidth}x${window.innerHeight}`);
        });
    },

    /**
     * Expose helpful global methods
     */
    exposeGlobalMethods: () => {
        window.Portfolio = {
            // Theme controls
            theme: {
                toggle: ThemeEngine.toggleTheme,
                set: (theme) => ThemeEngine.applyTheme(theme),
                get: () => DOM.html.getAttribute('data-theme')
            },
            
            // Navigation
            navigation: {
                openMenu: MobileNavigation.openMenu,
                closeMenu: MobileNavigation.closeMenu,
                isOpen: () => STATE.isMobileMenuOpen
            },
            
            // Responsive utilities
            responsive: {
                isMobile: () => CONFIG.isMobile,
                isTablet: () => CONFIG.isTablet,
                isDesktop: () => CONFIG.isDesktop,
                update: ResponsiveUtils.updateScreenSize
            },
            
            // Performance
            performance: {
                log: Performance.logMetrics,
                mark: Performance.mark
            },
            
            // Utility
            scrollTo: (selector) => {
                const element = document.querySelector(selector);
                if (element) ScrollEngine.smoothScrollTo(element);
            },
            
            // Info
            version: '2.1.0-responsive',
            config: CONFIG,
            state: STATE
        };
        
        console.log('🔧 Portfolio methods available on window.Portfolio');
    }
};

// ============================================
// ENTRY POINT - WITH RESPONSIVE SUPPORT
// ============================================
// Enhanced DOM ready detection for better mobile support
const initPortfolio = () => {
    // Check critical elements exist before initialization
    if (!document.body || !document.head) {
        setTimeout(initPortfolio, 50);
        return;
    }
    
    // Initialize with a small delay for better perceived performance
    setTimeout(() => {
        try {

            PortfolioEngine.setupEventListeners();
            Performance.logMetrics();
        } catch (error) {
            console.error('Failed to initialize Portfolio Engine:', error);
            // Fallback: at least set current year
            if (DOM.currentYear) {
                DOM.currentYear.textContent = new Date().getFullYear();
            }
        }
    }, 100);
};

// Start initialization based on document state
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
    initPortfolio();
}

// Handle page visibility for mobile battery optimization
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden - reduce activity
        console.log('📱 Page hidden, reducing activity');
    } else {
        // Page is visible again
        console.log('📱 Page visible, resuming normal activity');
    }
});

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PortfolioEngine,
        ThemeEngine,
        ScrollEngine,
        InteractionEngine,
        VisualEffects,
        MobileNavigation,
        ResponsiveUtils,
        Performance,
        ErrorHandler
    };
}

