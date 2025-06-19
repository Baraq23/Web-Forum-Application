/**
 * Category Manager - Handles category fetching, rendering, and filtering
 */

import { ApiUtils } from '../utils/ApiUtils.mjs';

export class CategoryManager {
    constructor(onCategoryFilter) {
        this.categories = [];
        this.onCategoryFilter = onCategoryFilter;
        this.categoryContainer = document.getElementById("categoryFilter");
        this.router = null; // Will be set by the app
    }

    /**
     * Fetch and render categories
     */
    async renderCategories() {
        try {
            this.categories = await ApiUtils.get("/api/categories");
            this.renderCategoryList();
            this.setupCategoryFilters();
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }

    /**
     * Render the category list in the sidebar
     */
    renderCategoryList() {
        this.categoryContainer.innerHTML = `
            <h3>Categories</h3>
            <div class="menu-item active" category-id="0">
                <i class="fas fa-tag"></i> All
            </div>
        `;

        this.categories.forEach(category => {
            const categoryItem = document.createElement("div");
            categoryItem.classList.add("menu-item");
            categoryItem.setAttribute("category-id", `${category.id}`);
            categoryItem.innerHTML = `<i class="fas fa-tag"></i> ${category.name}`;
            this.categoryContainer.appendChild(categoryItem);
        });
    }

    /**
     * Setup category filter event listeners
     */
    setupCategoryFilters() {
        const categoryBtns = document.querySelectorAll("#categoryFilter .menu-item");

        categoryBtns.forEach(btn => {
            btn.addEventListener('click', async (event) => {
                event.preventDefault();

                // Remove active class from all buttons
                categoryBtns.forEach(b => b.classList.remove('active'));

                // Add active class to clicked button
                event.currentTarget.classList.add('active');

                const catId = parseInt(event.currentTarget.getAttribute('category-id'));

                console.log('CategoryManager: Category clicked:', catId);

                try {
                    // Scroll to top smoothly
                    window.scrollTo({ top: 0, behavior: 'smooth' });

                    // Use router for navigation if available
                    if (this.router) {
                        if (catId === 0) {
                            // Navigate to home for "All" categories
                            console.log('CategoryManager: Navigating to home (all categories)');
                            this.router.navigate('/');
                        } else {
                            // Navigate to category-specific route
                            console.log('CategoryManager: Navigating to category:', catId);
                            this.router.navigate(`/category/${catId}`);
                        }
                    } else {
                        // Fallback to callback approach for backward compatibility
                        console.log('CategoryManager: Using callback approach');
                        if (this.onCategoryFilter) {
                            await this.onCategoryFilter(catId);
                        }
                    }
                } catch (error) {
                    console.error("Error handling category filter:", error);
                }
            });
        });
    }

    /**
     * Setup category dropdown for post creation
     */
    setupCategoryDropdown() {
        // Toggle dropdown
        const dropdownToggle = document.getElementById("dropdownToggle");
        const dropdownMenu = document.getElementById("dropdownMenu");
        
        if (dropdownToggle) {
            dropdownToggle.addEventListener("click", () => {
                dropdownMenu.classList.toggle("hidden");
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener("click", (e) => {
            const dropdown = document.getElementById("categoryDropdown");
            if (dropdown && !dropdown.contains(e.target)) {
                dropdownMenu.classList.add("hidden");
            }
        });

        // Load categories dynamically
        this.loadCategoriesForDropdown();
    }

    /**
     * Load categories for the post creation dropdown
     */
    async loadCategoriesForDropdown() {
        try {
            const categories = await ApiUtils.get('/api/categories');
            const menu = document.getElementById("dropdownMenu");
            
            if (!menu) return;
            
            menu.innerHTML = "";
            categories.forEach(cat => {
                const item = document.createElement("label");
                item.style.display = "block";
                item.style.padding = "5px 10px";
                item.innerHTML = `
                    <input type="checkbox" name="category_names[]" value="${cat.name}" />
                    ${cat.name}
                `;
                menu.appendChild(item);
            });
        } catch (error) {
            console.error("Failed to load categories:", error);
        }
    }

    /**
     * Get selected categories from dropdown
     * @returns {Array} - Array of selected category names
     */
    getSelectedCategories() {
        const form = document.getElementById("postForm");
        if (!form) return [];
        
        return Array.from(form.querySelectorAll('input[name="category_names[]"]:checked'))
            .map(cb => cb.value);
    }

    /**
     * Reset category dropdown selection
     */
    resetCategoryDropdown() {
        const dropdownMenu = document.getElementById("dropdownMenu");
        if (dropdownMenu) {
            dropdownMenu.classList.add("hidden");
            
            // Uncheck all checkboxes
            const checkboxes = dropdownMenu.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = false);
        }
    }

    /**
     * Get all categories
     * @returns {Array} - Array of category objects
     */
    getCategories() {
        return this.categories;
    }

    /**
     * Set router reference for navigation
     * @param {Router} router - Router instance
     */
    setRouter(router) {
        this.router = router;
        console.log('CategoryManager: Router set:', !!this.router);
    }

    /**
     * Update active category based on current route
     * @param {number} categoryId - Current category ID (0 for all)
     */
    updateActiveCategory(categoryId) {
        const categoryBtns = document.querySelectorAll("#categoryFilter .menu-item");

        categoryBtns.forEach(btn => {
            btn.classList.remove('active');
            const btnCategoryId = parseInt(btn.getAttribute('category-id'));

            if (btnCategoryId === categoryId) {
                btn.classList.add('active');
            }
        });
    }
}
