/**
 * MotorLink AI Assistant Chat Widget
 * Provides AI-powered assistance for car-related questions
 * Requires user authentication
 */

class AICarChat {
    constructor() {
        this.isMinimized = false;
        this.isOpen = false;
        this.conversationHistory = [];
        this.currentUser = null;
        this.isSending = false;
        this.retryCount = 0;
        this.maxRetries = 20; // Increased retries for better persistence - keep trying until it works
        this.baseRetryDelay = 2000; // Start with 2 seconds
        this.maxRetryDelay = 30000; // Max 30 seconds between retries
        this.currentRetryTimeout = null;
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.bindEvents();
        this.setupWidgetVisibility();
        await this.loadUsageIndicator();
    }

    async checkAuth() {
        try {
            const response = await fetch(`${CONFIG.API_URL}?action=check_auth`, {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success && data.authenticated) {
                this.currentUser = data.user;
            } else {
                this.currentUser = null;
            }
        } catch (error) {
            console.error('Auth check error:', error);
            this.currentUser = null;
        }
    }

    setupWidgetVisibility() {
        const widget = document.getElementById('aiCarChatWidget');
        if (!widget) return;

        if (!this.currentUser) {
            // Hide widget for guests
            widget.style.display = 'none';
        } else {
            // Show widget for logged-in users
            widget.style.display = 'block';
            // Ensure initial state is minimized
            const chatBody = document.getElementById('aiChatBody');
            if (chatBody) {
                chatBody.style.display = 'none';
                widget.classList.add('minimized');
                this.isMinimized = true;
                this.isOpen = false;
            }
        }
    }

    bindEvents() {
        // Toggle chat header click
        const chatHeader = document.getElementById('aiChatHeader');
        const chatToggle = document.getElementById('aiChatToggle');
        const chatMinimized = document.getElementById('aiChatMinimized');
        const chatInput = document.getElementById('aiChatInput');
        const chatSendBtn = document.getElementById('aiChatSendBtn');

        if (chatHeader) {
            chatHeader.addEventListener('click', (e) => {
                if (e.target.closest('.ai-chat-toggle')) return;
                this.toggleChat();
            });
        }

        if (chatToggle) {
            chatToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.minimizeChat();
            });
        }

        if (chatMinimized) {
            chatMinimized.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.openChat();
            });
        }

        if (chatSendBtn) {
            chatSendBtn.addEventListener('click', () => {
                this.sendMessage(0, 'button');
            });
        }

        if (chatInput) {
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage(0, 'enter');
                }
            });

            chatInput.addEventListener('input', (e) => {
                this.updateCharCount(e.target.value.length);
                this.autoResizeTextarea(e.target);
            });
        }
    }

    toggleChat() {
        if (this.isMinimized) {
            this.openChat();
        } else {
            this.minimizeChat();
        }
    }

    openChat() {
        const chatBody = document.getElementById('aiChatBody');
        const widget = document.getElementById('aiCarChatWidget');
        const toggleIcon = document.getElementById('aiChatToggleIcon');
        const minimizedBtn = document.getElementById('aiChatMinimized');

        if (chatBody && widget) {
            chatBody.style.display = 'flex';
            widget.classList.remove('minimized');
            if (minimizedBtn) {
                minimizedBtn.style.display = 'none';
            }
            this.isMinimized = false;
            this.isOpen = true;

            if (toggleIcon) {
                toggleIcon.className = 'fas fa-times';
            }

            // Focus input
            const chatInput = document.getElementById('aiChatInput');
            if (chatInput) {
                setTimeout(() => chatInput.focus(), 100);
            }
        }
    }

    minimizeChat() {
        const chatBody = document.getElementById('aiChatBody');
        const widget = document.getElementById('aiCarChatWidget');
        const toggleIcon = document.getElementById('aiChatToggleIcon');
        const minimizedBtn = document.getElementById('aiChatMinimized');

        if (chatBody && widget) {
            chatBody.style.display = 'none';
            widget.classList.add('minimized');
            if (minimizedBtn) {
                minimizedBtn.style.display = 'flex';
            }
            this.isMinimized = true;
            this.isOpen = false;

            if (toggleIcon) {
                toggleIcon.className = 'fas fa-comments';
            }
        }
    }

    updateCharCount(count) {
        const charCount = document.getElementById('aiChatCharCount');
        if (charCount) {
            charCount.textContent = count;
            if (count > 450) {
                charCount.style.color = '#f44336';
            } else if (count > 400) {
                charCount.style.color = '#ff9800';
            } else {
                charCount.style.color = '#999';
            }
        }
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    }

    async sendMessage(retryAttempt = 0, triggerSource = 'button') {
        // Check authentication before sending
        if (!this.currentUser) {
            this.showError('Please log in to use MotorLink AI Assistant.');
            const login = confirm('You need to be logged in to use MotorLink AI Assistant. Would you like to go to the login page?');
            if (login) {
                window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
            }
            return;
        }

        const input = document.getElementById('aiChatInput');
        const sendBtn = document.getElementById('aiChatSendBtn');

        if (!input) return;

        const message = input.value.trim();

        if (!message) return;

        // Prevent multiple simultaneous sends (unless it's a retry)
        if (this.isSending && retryAttempt === 0) {
            return;
        }
        
        // Clear any existing retry timeout when starting a new send
        if (this.currentRetryTimeout && retryAttempt === 0) {
            clearTimeout(this.currentRetryTimeout);
            this.currentRetryTimeout = null;
        }

        // Only clear input and add to UI on first attempt
        if (retryAttempt === 0) {
            // Clear input
            input.value = '';
            this.updateCharCount(0);
            this.autoResizeTextarea(input);

            // Add user message to UI
            this.addMessage('user', message);

            // Add to conversation history
            this.conversationHistory.push({ role: 'user', content: message });
        }

        // Disable input while sending
        input.disabled = true;
        if (sendBtn) sendBtn.disabled = true;
        this.isSending = true;

        // Show compact in-chat typing indicator
        this.showTypingIndicator();

        try {
            const controller = new AbortController();
            // Increase timeout for retries to give more time
            const timeoutDuration = retryAttempt > 0 ? 90000 : 60000; // 90s for retries, 60s for initial
            const timeoutId = setTimeout(() => controller.abort('Request timeout'), timeoutDuration);

            const response = await fetch(`${CONFIG.API_URL}?action=ai_car_chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Prevent global page loader for Enter-triggered chatbot sends.
                    ...(triggerSource === 'enter' ? { 'X-Skip-Global-Loader': '1' } : {})
                },
                credentials: 'include',
                signal: controller.signal,
                body: JSON.stringify({
                    message: message,
                    conversation_history: this.conversationHistory.slice(-10) // Last 10 messages for context
                })
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            this.hideTypingIndicator();
            // Only re-enable input if we're not retrying
            if (retryAttempt === 0) {
                this.isSending = false;
                input.disabled = false;
                if (sendBtn) sendBtn.disabled = false;
            }
            this.retryCount = 0;

            if (data.success && data.response) {
                // Check if this is a search result
                if (data.search_results && data.search_results.length > 0) {
                    // Car listings search results (for sale)
                    this.addMessage('ai', data.response, data.search_results, data.total_results);
                } else if (data.car_hire_companies && data.car_hire_companies.length > 0) {
                    // Car hire search results
                    this.addMessage('ai', data.response, null, data.total_results, null, data.car_hire_companies);
                } else if (data.garages && data.garages.length > 0) {
                    // Garage search results
                    this.addMessage('ai', data.response, null, data.total_results, data.garages);
                } else {
                    // Regular AI response
                    this.addMessage('ai', data.response);
                }

                // Add to conversation history
                this.conversationHistory.push({ role: 'assistant', content: data.response });
                
                // Update usage indicator after successful message
                if (this.updateUsageAfterMessage) {
                    await this.loadUsageIndicator();
                }
            } else {
                // Check if it's an authentication error
                if (response.status === 401 || (data.message && data.message.includes('Authentication required'))) {
                    this.currentUser = null;
                    this.setupWidgetVisibility();
                    this.showError('Your session has expired. Please log in again.');
                    setTimeout(() => {
                        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
                    }, 2000);
                } else if (response.status === 403) {
                    // User's AI chat is disabled - show the reason
                    const reason = data.message || 'Your access to MotorLink AI Assistant has been temporarily disabled. Please contact support for assistance.';
                    this.showError(reason, true); // true = persistent error, don't auto-hide
                    this.isSending = false;
                    input.disabled = false;
                    if (sendBtn) sendBtn.disabled = false;
                } else if (response.status === 429) {
                    // Rate limit exceeded - don't retry, show clear message
                    const rateLimitMessage = data.message || 'You\'ve reached your rate limit for AI chat requests. Please wait a bit before trying again.';
                    this.showError(rateLimitMessage, true); // true = persistent error, don't auto-hide
                    this.isSending = false;
                    input.disabled = false;
                    if (sendBtn) sendBtn.disabled = false;
                    this.retryCount = 0; // Reset retry count
                } else {
                    // Handle API errors with retry logic
                    const isRetryableError = response.status === 503 || response.status >= 500;
                    
                    if (isRetryableError) {
                        // For retryable errors, keep retrying with exponential backoff
                        if (retryAttempt < this.maxRetries) {
                            // Exponential backoff with jitter: baseDelay * 2^attempt + random(0-1000ms)
                            const exponentialDelay = this.baseRetryDelay * Math.pow(2, Math.min(retryAttempt, 5)); // Cap exponential growth
                            const jitter = Math.random() * 1000;
                            const delay = Math.min(exponentialDelay + jitter, this.maxRetryDelay);
                            
                            const retryMessage = retryAttempt === 0 
                                ? `Service temporarily unavailable. Retrying automatically...`
                                : `Still retrying... (attempt ${retryAttempt + 1}/${this.maxRetries})`;
                            
                            this.showError(retryMessage);
                            
                            // Clear any existing timeout
                            if (this.currentRetryTimeout) {
                                clearTimeout(this.currentRetryTimeout);
                            }
                            
                            // Retry after delay
                            this.currentRetryTimeout = setTimeout(() => {
                                this.currentRetryTimeout = null;
                                this.sendMessage(retryAttempt + 1, triggerSource);
                            }, delay);
                            
                            return; // Don't re-enable input, keep it disabled during retries
                        } else {
                            // Max retries reached, but still auto-retry after longer delay
                            this.showError('Service is experiencing high demand. Retrying automatically in 30 seconds...');
                            
                            // Auto-retry after a longer delay (30 seconds)
                            if (this.currentRetryTimeout) {
                                clearTimeout(this.currentRetryTimeout);
                            }
                            
                            this.currentRetryTimeout = setTimeout(() => {
                                this.currentRetryTimeout = null;
                                if (!this.isSending) {
                                    this.showError('Retrying automatically...');
                                    this.sendMessage(0, triggerSource); // Start fresh retry cycle
                                }
                            }, 30000);
                            // Don't re-enable input - keep retrying
                        }
                    } else {
                        // Handle non-retryable errors - re-enable input
                        if (this.currentRetryTimeout) {
                            clearTimeout(this.currentRetryTimeout);
                            this.currentRetryTimeout = null;
                        }
                        this.isSending = false;
                        input.disabled = false;
                        if (sendBtn) sendBtn.disabled = false;
                        const errorMessage = data.message || 'Failed to get response from AI Assistant. Please try again.';
                        this.showError(errorMessage);
                        this.retryCount = 0;
                    }
                }
            }
        } catch (error) {
            this.hideTypingIndicator();
            console.error('AI Chat Error:', error);

            // Check if it's a timeout
            if (error.name === 'AbortError') {
                if (retryAttempt < this.maxRetries) {
                    const exponentialDelay = this.baseRetryDelay * Math.pow(2, Math.min(retryAttempt, 5));
                    const jitter = Math.random() * 1000;
                    const delay = Math.min(exponentialDelay + jitter, this.maxRetryDelay);
                    
                    this.showError(`Request timed out. Retrying automatically... (attempt ${retryAttempt + 1}/${this.maxRetries})`);
                    
                    if (this.currentRetryTimeout) {
                        clearTimeout(this.currentRetryTimeout);
                    }
                    
                    this.currentRetryTimeout = setTimeout(() => {
                        this.currentRetryTimeout = null;
                        this.sendMessage(retryAttempt + 1, triggerSource);
                    }, delay);
                    return;
                } else {
                    // Max retries reached, but keep trying
                    this.showError('Request timed out. Retrying automatically in 30 seconds...');
                    if (this.currentRetryTimeout) {
                        clearTimeout(this.currentRetryTimeout);
                    }
                    this.currentRetryTimeout = setTimeout(() => {
                        this.currentRetryTimeout = null;
                        if (!this.isSending) {
                            this.sendMessage(0, triggerSource); // Start fresh retry cycle
                        }
                    }, 30000);
                    return;
                }
            }

            // Check if it's a network error
            if (error.name === 'TypeError' || error.name === 'NetworkError' || error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
                if (retryAttempt < this.maxRetries) {
                    // Retry network errors with exponential backoff
                    const exponentialDelay = this.baseRetryDelay * Math.pow(2, Math.min(retryAttempt, 5));
                    const jitter = Math.random() * 1000;
                    const delay = Math.min(exponentialDelay + jitter, this.maxRetryDelay);
                    
                    this.showError(`Network error. Retrying automatically... (attempt ${retryAttempt + 1}/${this.maxRetries})`);
                    
                    if (this.currentRetryTimeout) {
                        clearTimeout(this.currentRetryTimeout);
                    }
                    
                    this.currentRetryTimeout = setTimeout(() => {
                        this.currentRetryTimeout = null;
                        this.sendMessage(retryAttempt + 1, triggerSource);
                    }, delay);
                    return;
                } else {
                    // Max retries reached, but keep trying
                    this.showError('Network error. Retrying automatically in 30 seconds...');
                    if (this.currentRetryTimeout) {
                        clearTimeout(this.currentRetryTimeout);
                    }
                    this.currentRetryTimeout = setTimeout(() => {
                        this.currentRetryTimeout = null;
                        if (!this.isSending) {
                            this.sendMessage(0, triggerSource); // Start fresh retry cycle
                        }
                    }, 30000);
                    return;
                }
            }

            // Other errors - don't retry, just show error
            // Clear retry timeout if exists
            if (this.currentRetryTimeout) {
                clearTimeout(this.currentRetryTimeout);
                this.currentRetryTimeout = null;
            }
            
            this.isSending = false;
            input.disabled = false;
            if (sendBtn) sendBtn.disabled = false;
            this.showError('An unexpected error occurred. Please try again.');
            this.retryCount = 0;
        }
    }
    
    /**
     * Cancel any pending retries
     */
    cancelRetries() {
        if (this.currentRetryTimeout) {
            clearTimeout(this.currentRetryTimeout);
            this.currentRetryTimeout = null;
        }
        this.retryCount = 0;
    }

    addMessage(role, content, searchResults = null, totalResults = 0, garages = null, carHireCompanies = null) {
        const messagesContainer = document.getElementById('aiChatMessages');
        if (!messagesContainer) return;

        // Remove welcome message if present
        const welcome = messagesContainer.querySelector('.ai-chat-welcome');
        if (welcome) {
            welcome.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-chat-message ${role}`;

        const time = new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        const avatarIcon = role === 'user' ? 'fas fa-user' : 'fas fa-robot';

        // Format content with markdown links and line breaks
        let formattedContent = this.formatMessageContent(content);
        
        // Add garage results if available
        if (garages && garages.length > 0) {
            formattedContent += '<div class="ai-chat-search-results" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.1);">';
            formattedContent += `<div style="font-weight: 600; margin-bottom: 8px; font-size: 13px;">Found ${totalResults} garage${totalResults > 1 ? 's' : ''}:</div>`;
            
            garages.slice(0, 5).forEach(garage => {
                const garageId = garage.id || '';
                const garageName = this.escapeHtml(garage.name || '');
                const location = garage.location_name ? this.escapeHtml(garage.location_name) : '';
                const phone = garage.phone ? this.escapeHtml(garage.phone) : '';
                
                // Parse services
                let servicesList = [];
                if (garage.services_list) {
                    servicesList = Array.isArray(garage.services_list) ? garage.services_list : [];
                } else if (garage.services) {
                    try {
                        servicesList = typeof garage.services === 'string' ? JSON.parse(garage.services) : garage.services;
                        if (!Array.isArray(servicesList)) servicesList = [];
                    } catch (e) {
                        servicesList = [];
                    }
                }
                const servicesStr = servicesList.slice(0, 3).map(s => this.escapeHtml(s)).join(', ');
                
                formattedContent += `
                    <div class="ai-chat-search-result-item" 
                         data-garage-id="${garageId}"
                         style="margin-bottom: 10px; padding: 10px; background: rgba(0, 200, 83, 0.05); border-radius: 8px; cursor: pointer; transition: background 0.2s ease;">
                        <div style="font-weight: 600; color: #00c853; margin-bottom: 4px;">
                            ${garageName}
                        </div>
                        ${location ? `<div style="font-size: 12px; color: #999; margin-bottom: 4px;">📍 ${location}</div>` : ''}
                        ${phone ? `<div style="font-size: 12px; color: #666; margin-bottom: 4px;">📞 ${phone}</div>` : ''}
                        ${servicesStr ? `<div style="font-size: 12px; color: #666;">🔧 ${servicesStr}${servicesList.length > 3 ? ' and more' : ''}</div>` : ''}
                    </div>
                `;
            });
            
            if (totalResults > 5) {
                formattedContent += `<div style="margin-top: 8px; text-align: center; font-size: 12px; color: #00c853; cursor: pointer; text-decoration: underline;" class="ai-chat-view-more-garages">View all ${totalResults} garages on website →</div>`;
            }
            
            formattedContent += '</div>';
        }
        
        // Add car hire company results if available
        if (carHireCompanies && carHireCompanies.length > 0) {
            formattedContent += '<div class="ai-chat-search-results" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.1);">';
            formattedContent += `<div style="font-weight: 600; margin-bottom: 8px; font-size: 13px;">Found ${totalResults} car hire compan${totalResults > 1 ? 'ies' : 'y'}:</div>`;
            
            carHireCompanies.slice(0, 5).forEach(company => {
                const companyId = company.id || '';
                const companyName = this.escapeHtml(company.business_name || '');
                const location = company.location_name ? this.escapeHtml(company.location_name) : '';
                const phone = company.phone ? this.escapeHtml(company.phone) : '';
                
                // Show matching vehicles if available
                let vehiclesInfo = '';
                if (company.matching_vehicles && company.matching_vehicles.length > 0) {
                    const vehicleCount = company.matching_vehicles.length;
                    vehiclesInfo = `<div style="font-size: 12px; color: #666; margin-top: 4px;">🚗 ${vehicleCount} vehicle${vehicleCount > 1 ? 's' : ''} available`;
                    if (company.matching_vehicles[0].daily_rate) {
                        vehiclesInfo += ' from MWK ' + parseInt(company.matching_vehicles[0].daily_rate).toLocaleString() + '/day';
                    }
                    vehiclesInfo += '</div>';
                } else if (company.total_vehicles > 0) {
                    vehiclesInfo = `<div style="font-size: 12px; color: #666; margin-top: 4px;">🚗 ${company.total_vehicles} vehicle${company.total_vehicles > 1 ? 's' : ''} available</div>`;
                }
                
                formattedContent += `
                    <div class="ai-chat-search-result-item" 
                         data-car-hire-id="${companyId}"
                         style="margin-bottom: 10px; padding: 10px; background: rgba(0, 200, 83, 0.05); border-radius: 8px; cursor: pointer; transition: background 0.2s ease;">
                        <div style="font-weight: 600; color: #00c853; margin-bottom: 4px;">
                            ${companyName}
                        </div>
                        ${location ? `<div style="font-size: 12px; color: #999; margin-bottom: 4px;">📍 ${location}</div>` : ''}
                        ${phone ? `<div style="font-size: 12px; color: #666; margin-bottom: 4px;">📞 ${phone}</div>` : ''}
                        ${vehiclesInfo}
                    </div>
                `;
            });
            
            if (totalResults > 5) {
                formattedContent += `<div style="margin-top: 8px; text-align: center; font-size: 12px; color: #00c853; cursor: pointer; text-decoration: underline;" class="ai-chat-view-more-car-hire">View all ${totalResults} car hire companies on website →</div>`;
            }
            
            formattedContent += '</div>';
        }
        
        // Add search results if available
        if (searchResults && searchResults.length > 0) {
            formattedContent += '<div class="ai-chat-search-results" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.1);">';
            formattedContent += `<div style="font-weight: 600; margin-bottom: 8px; font-size: 13px;">Found ${totalResults} result${totalResults > 1 ? 's' : ''}:</div>`;
            
            searchResults.slice(0, 5).forEach(listing => {
                const listingId = listing.id || '';
                const makeName = this.escapeHtml(listing.make_name || '');
                const modelName = this.escapeHtml(listing.model_name || '');
                const year = listing.year || 'N/A';
                const price = parseInt(listing.price || 0).toLocaleString();
                const location = listing.location_name ? this.escapeHtml(listing.location_name) : '';
                
                formattedContent += `
                    <div class="ai-chat-search-result-item" 
                         data-listing-id="${listingId}"
                         style="margin-bottom: 10px; padding: 12px; background: rgba(0, 200, 83, 0.05); border-radius: 8px; transition: background 0.2s ease;">
                        <div style="font-weight: 600; color: #00c853; margin-bottom: 4px;">
                            ${makeName} ${modelName} (${year})
                        </div>
                        <div style="font-size: 13px; color: #666; margin-bottom: 4px;">
                            MWK ${price}
                        </div>
                        ${location ? `<div style="font-size: 12px; color: #999; margin-bottom: 8px;">📍 ${location}</div>` : ''}
                        <div class="ai-chat-quick-actions" style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px;">
                            <button class="ai-chat-action-btn" data-action="view" data-listing-id="${listingId}" 
                                    style="flex: 1; min-width: 80px; padding: 6px 10px; background: #00c853; color: white; border: none; border-radius: 6px; font-size: 11px; cursor: pointer; transition: background 0.2s;">
                                <i class="fas fa-eye"></i> View
                            </button>
                            <button class="ai-chat-action-btn" data-action="save" data-listing-id="${listingId}" 
                                    style="flex: 1; min-width: 80px; padding: 6px 10px; background: #2196F3; color: white; border: none; border-radius: 6px; font-size: 11px; cursor: pointer; transition: background 0.2s;">
                                <i class="fas fa-bookmark"></i> Save
                            </button>
                            <button class="ai-chat-action-btn" data-action="contact" data-listing-id="${listingId}" 
                                    style="flex: 1; min-width: 80px; padding: 6px 10px; background: #FF9800; color: white; border: none; border-radius: 6px; font-size: 11px; cursor: pointer; transition: background 0.2s;">
                                <i class="fas fa-phone"></i> Contact
                            </button>
                        </div>
                    </div>
                `;
            });
            
            if (totalResults > 5) {
                formattedContent += `<div style="margin-top: 8px; text-align: center; font-size: 12px; color: #00c853; cursor: pointer; text-decoration: underline;" class="ai-chat-view-more">View all ${totalResults} results on website →</div>`;
            }
            
            formattedContent += '</div>';
        }

        messageDiv.innerHTML = `
            <div class="ai-chat-message-avatar">
                <i class="${avatarIcon}"></i>
            </div>
            <div class="ai-chat-message-content">
                <div class="ai-chat-message-bubble">${formattedContent}</div>
                <div class="ai-chat-message-time">${time}</div>
                ${role === 'ai' ? `
                    <div class="ai-chat-feedback" style="margin-top: 8px; display: flex; gap: 8px; align-items: center;">
                        <span style="font-size: 11px; color: #999;">Was this helpful?</span>
                        <button class="ai-chat-feedback-btn" data-feedback="helpful" data-message-id="${Date.now()}" 
                                style="padding: 4px 8px; background: transparent; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 11px; color: #666; transition: all 0.2s;">
                            <i class="fas fa-thumbs-up"></i> Yes
                        </button>
                        <button class="ai-chat-feedback-btn" data-feedback="not-helpful" data-message-id="${Date.now()}" 
                                style="padding: 4px 8px; background: transparent; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 11px; color: #666; transition: all 0.2s;">
                            <i class="fas fa-thumbs-down"></i> No
                        </button>
                    </div>
                ` : ''}
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        
        // Add click handlers for quick action buttons
        const actionButtons = messageDiv.querySelectorAll('.ai-chat-action-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent item click
                const action = btn.getAttribute('data-action');
                const listingId = btn.getAttribute('data-listing-id');
                this.handleQuickAction(action, listingId);
            });
            btn.addEventListener('mouseenter', () => {
                btn.style.opacity = '0.8';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.opacity = '1';
            });
        });
        
        // Add click handlers for feedback buttons
        const feedbackButtons = messageDiv.querySelectorAll('.ai-chat-feedback-btn');
        feedbackButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const feedback = btn.getAttribute('data-feedback');
                const messageId = btn.getAttribute('data-message-id');
                this.handleFeedback(feedback, messageId, messageDiv);
            });
            btn.addEventListener('mouseenter', () => {
                btn.style.background = '#f5f5f5';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'transparent';
            });
        });
        
        // Add click handlers for search results
        if (searchResults && searchResults.length > 0) {
            const resultItems = messageDiv.querySelectorAll('.ai-chat-search-result-item');
            resultItems.forEach((item, index) => {
                const listingId = item.getAttribute('data-listing-id');
                if (listingId) {
                    // Only make item clickable if no action buttons clicked
                    item.addEventListener('click', (e) => {
                        // Don't open if clicking on action buttons
                        if (!e.target.closest('.ai-chat-action-btn')) {
                            window.open(`car.html?id=${listingId}`, '_blank');
                        }
                    });
                    item.addEventListener('mouseenter', () => {
                        item.style.background = 'rgba(0, 200, 83, 0.1)';
                    });
                    item.addEventListener('mouseleave', () => {
                        item.style.background = 'rgba(0, 200, 83, 0.05)';
                    });
                }
            });
            
            // Handle "view more" link
            const viewMore = messageDiv.querySelector('.ai-chat-view-more');
            if (viewMore) {
                viewMore.addEventListener('click', () => {
                    // Build search URL - use first listing's make/model if available
                    const firstListing = searchResults[0];
                    const params = new URLSearchParams();
                    if (firstListing.make_id) params.append('make', firstListing.make_id);
                    if (firstListing.model_id) params.append('model', firstListing.model_id);
                    window.open(`index.html?${params.toString()}`, '_blank');
                });
            }
        }
        
        // Add click handlers for garage results
        if (garages && garages.length > 0) {
            const garageItems = messageDiv.querySelectorAll('.ai-chat-search-result-item[data-garage-id]');
            garageItems.forEach((item) => {
                const garageId = item.getAttribute('data-garage-id');
                if (garageId) {
                    item.addEventListener('click', () => {
                        window.open(`garages.html?id=${garageId}`, '_blank');
                    });
                    item.addEventListener('mouseenter', () => {
                        item.style.background = 'rgba(0, 200, 83, 0.1)';
                    });
                    item.addEventListener('mouseleave', () => {
                        item.style.background = 'rgba(0, 200, 83, 0.05)';
                    });
                }
            });
            
            // Handle "View all garages" click
            const viewMoreGarages = messageDiv.querySelector('.ai-chat-view-more-garages');
            if (viewMoreGarages) {
                viewMoreGarages.addEventListener('click', () => {
                    window.open('garages.html', '_blank');
                });
            }
        }
        
        // Add click handlers for car hire results
        if (carHireCompanies && carHireCompanies.length > 0) {
            const carHireItems = messageDiv.querySelectorAll('.ai-chat-search-result-item[data-car-hire-id]');
            carHireItems.forEach((item) => {
                const companyId = item.getAttribute('data-car-hire-id');
                if (companyId) {
                    item.addEventListener('click', () => {
                        window.open(`car-hire-company.html?id=${companyId}`, '_blank');
                    });
                    item.addEventListener('mouseenter', () => {
                        item.style.background = 'rgba(0, 200, 83, 0.1)';
                    });
                    item.addEventListener('mouseleave', () => {
                        item.style.background = 'rgba(0, 200, 83, 0.05)';
                    });
                }
            });
            
            // Handle "View all car hire companies" click
            const viewMoreCarHire = messageDiv.querySelector('.ai-chat-view-more-car-hire');
            if (viewMoreCarHire) {
                viewMoreCarHire.addEventListener('click', () => {
                    window.open('car-hire.html', '_blank');
                });
            }
        }
        
        this.scrollToBottom();
    }

    showLoading() {
        const messagesContainer = document.getElementById('aiChatMessages');
        if (!messagesContainer) return;

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'ai-chat-message ai';
        loadingDiv.id = 'aiChatLoading';
        loadingDiv.innerHTML = `
            <div class="ai-chat-message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="ai-chat-message-content">
                <div class="ai-chat-message-bubble">
                    <div class="ai-chat-loading">
                        <div class="ai-chat-loading-dot"></div>
                        <div class="ai-chat-loading-dot"></div>
                        <div class="ai-chat-loading-dot"></div>
                    </div>
                </div>
            </div>
        `;

        messagesContainer.appendChild(loadingDiv);
        this.scrollToBottom();
    }

    hideLoading() {
        const loading = document.getElementById('aiChatLoading');
        if (loading) {
            loading.remove();
        }
    }

    showError(message, persistent = false) {
        const messagesContainer = document.getElementById('aiChatMessages');
        if (!messagesContainer) return;

        // Remove existing errors first
        const existingErrors = messagesContainer.querySelectorAll('.ai-chat-error');
        existingErrors.forEach(err => err.remove());

        const errorDiv = document.createElement('div');
        errorDiv.className = 'ai-chat-error';
        
        // Check if it's a retry message
        const isRetryMessage = message.includes('Retrying') || message.includes('retrying') || message.includes('attempt');
        
        if (isRetryMessage) {
            // Add loading indicator for retry messages
            errorDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="ai-chat-loading" style="padding: 0;">
                        <div class="ai-chat-loading-dot"></div>
                        <div class="ai-chat-loading-dot"></div>
                        <div class="ai-chat-loading-dot"></div>
                    </div>
                    <span>${message}</span>
                </div>
            `;
        } else {
            // For persistent errors (like disabled access), add an icon and make it more prominent
            if (persistent) {
                errorDiv.innerHTML = `
                    <div style="display: flex; align-items: flex-start; gap: 10px;">
                        <i class="fas fa-exclamation-triangle" style="color: #ff6b6b; font-size: 18px; margin-top: 2px;"></i>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; margin-bottom: 4px;">Access Restricted</div>
                            <div>${this.escapeHtml(message)}</div>
                        </div>
                    </div>
                `;
            } else {
                errorDiv.textContent = message;
            }
        }

        messagesContainer.appendChild(errorDiv);
        this.scrollToBottom();

        // Don't auto-remove retry messages or persistent errors
        if (!isRetryMessage && !persistent) {
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.remove();
                }
            }, 8000);
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('aiChatMessages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Show typing indicator when bot is processing
     */
    showTypingIndicator() {
        const messagesContainer = document.getElementById('aiChatMessages');
        if (!messagesContainer) return;
        
        // Remove existing typing indicator
        const existing = document.getElementById('aiChatTypingIndicator');
        if (existing) existing.remove();
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-chat-message ai';
        typingDiv.id = 'aiChatTypingIndicator';
        typingDiv.innerHTML = `
            <div class="ai-chat-message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="ai-chat-message-content">
                <div class="ai-chat-message-bubble ai-chat-typing-indicator">
                    <span class="ai-chat-typing-label">MotorLink AI is typing</span>
                    <div class="ai-chat-typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
        
    }
    
    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        const typing = document.getElementById('aiChatTypingIndicator');
        if (typing) {
            typing.remove();
        }
    }
    
    /**
     * Handle quick action buttons
     */
    async handleQuickAction(action, listingId) {
        if (!listingId) return;
        
        try {
            switch(action) {
                case 'view':
                    window.open(`car.html?id=${listingId}`, '_blank');
                    break;
                    
                case 'save':
                    // Save to favorites
                    const saveResponse = await fetch(`${CONFIG.API_URL}?action=save_listing`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ listing_id: listingId })
                    });
                    
                    const saveData = await saveResponse.json();
                    if (saveData.success) {
                        this.showToast('Car saved to favorites!', 'success');
                    } else {
                        this.showToast(saveData.message || 'Failed to save car', 'error');
                    }
                    break;
                    
                case 'contact':
                    // Open contact modal or redirect to listing
                    window.open(`car.html?id=${listingId}#contact`, '_blank');
                    break;
                    
                default:
                    console.warn('Unknown action:', action);
            }
        } catch (error) {
            console.error('Error handling quick action:', error);
            this.showToast('An error occurred. Please try again.', 'error');
        }
    }
    
    /**
     * Handle user feedback
     */
    async handleFeedback(feedback, messageId, messageElement) {
        // Update button states
        const feedbackContainer = messageElement.querySelector('.ai-chat-feedback');
        if (feedbackContainer) {
            const buttons = feedbackContainer.querySelectorAll('.ai-chat-feedback-btn');
            buttons.forEach(btn => {
                btn.disabled = true;
                if (btn.getAttribute('data-feedback') === feedback) {
                    btn.style.background = feedback === 'helpful' ? '#4CAF50' : '#f44336';
                    btn.style.color = 'white';
                    btn.style.border = 'none';
                } else {
                    btn.style.opacity = '0.5';
                }
            });
            
            // Show thank you message
            const thankYou = document.createElement('span');
            thankYou.style.cssText = 'font-size: 11px; color: #4CAF50; margin-left: 8px;';
            thankYou.textContent = 'Thank you for your feedback!';
            feedbackContainer.appendChild(thankYou);
            
            // Remove thank you after 3 seconds
            setTimeout(() => {
                thankYou.remove();
            }, 3000);
        }
        
        // Send feedback to server (optional - for analytics)
        try {
            await fetch(`${CONFIG.API_URL}?action=ai_chat_feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    feedback: feedback,
                    message_id: messageId
                })
            });
        } catch (error) {
            // Silently fail - feedback is optional
            console.log('Feedback logging failed:', error);
        }
    }
    
    async loadUsageIndicator() {
        if (!this.currentUser) {
            return;
        }
        
        try {
            const response = await fetch(`${CONFIG.API_URL}?action=get_ai_chat_usage_remaining`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.usage) {
                    const usage = data.usage;
                    const usageIndicator = document.getElementById('aiUsageIndicator');
                    const usageText = document.getElementById('aiUsageText');
                    
                    if (usageIndicator && usageText) {
                        const remaining = usage.remaining;
                        const limit = usage.daily_limit;
                        const percentage = usage.percentage_used;
                        
                        // Color coding: green (>50% left), orange (25-50%), red (<25%)
                        let color = '#4caf50'; // Green
                        let bgColor = '#e8f5e9'; // Light green background
                        let icon = '✓';
                        
                        if (percentage >= 75) {
                            color = '#f44336'; // Red
                            bgColor = '#ffebee'; // Light red background
                            icon = '⚠';
                        } else if (percentage >= 50) {
                            color = '#ff9800'; // Orange
                            bgColor = '#fff3e0'; // Light orange background
                            icon = '⚠';
                        }
                        
                        // Update text with icon
                        usageText.innerHTML = `<span style="font-weight: 600; color: ${color};">${icon}</span> <span style="color: ${color};">${remaining}</span> / <span style="color: #666;">${limit}</span> requests left`;
                        
                        // Apply styling to the indicator container
                        usageIndicator.style.cssText = `
                            font-size: 11px;
                            margin-top: 6px;
                            padding: 4px 8px;
                            background: ${bgColor};
                            border-radius: 12px;
                            display: inline-block;
                            border: 1px solid ${color}40;
                            font-weight: 500;
                        `;
                        
                        // Update after each message is sent
                        this.updateUsageAfterMessage = true;
                    }
                }
            }
        } catch (error) {
            console.error('Error loading usage indicator:', error);
            // Hide usage indicator on error
            const usageIndicator = document.getElementById('aiUsageIndicator');
            if (usageIndicator) {
                usageIndicator.style.display = 'none';
            }
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10001;
            font-size: 14px;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        
        // Add animation if not exists
        if (!document.getElementById('aiChatToastAnimation')) {
            const style = document.createElement('style');
            style.id = 'aiChatToastAnimation';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(-100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(-100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
    }

    /**
     * Format message content: parse markdown links and convert to HTML
     */
    formatMessageContent(content) {
        // First escape HTML to prevent XSS
        let formatted = this.escapeHtml(content);
        
        // Parse markdown links: [text](url)
        // This regex matches [text](url) patterns
        formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
            // Ensure URL is properly formatted
            let fullUrl = url;
            
            // If URL is relative, make it absolute
            if (url.startsWith('/')) {
                fullUrl = window.location.origin + url;
            } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
                // Relative URL without leading slash
                const baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
                fullUrl = baseUrl + (url.startsWith('./') ? url.substring(1) : '/' + url);
            }
            
            // Return styled clickable link
            return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="ai-chat-link">${text}</a>`;
        });
        
        // Convert line breaks to <br>
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
    }
}

// Initialize AI Chat when DOM is ready
let aiCarChat;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        aiCarChat = new AICarChat();
    });
} else {
    aiCarChat = new AICarChat();
}
