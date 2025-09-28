// ===========================================
// AUTHENTICATION & REDIRECT FUNCTIONALITY
// ===========================================

// Auto-login functionality for users with "sumit" in email
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = document.getElementById("email").value.toLowerCase();
      const password = document.getElementById("password").value;

      // Check if email contains "sumit" and "@"
      if (email.includes("sumit") && email.includes("@")) {
        // Auto-login for any email containing "sumit" and "@"
        window.location.href = "/dashboard";
      } else if (email === "sumit@gmail.com" && password === "1234") {
        // Fallback for specific credentials
        window.location.href = "/dashboard";
      } else {
        alert("Invalid email or password! For demo: use any email containing 'sumit' and '@'");
      }
    });
  }
});

// ===========================================
// MAIN APPLICATION FUNCTIONALITY
// ===========================================

document.addEventListener('DOMContentLoaded', () => {
    const selectedItemsList = document.getElementById('selected-items-list');
    const dailyTotalSpan = document.getElementById('daily-total-calories');
    const chartCanvas = document.getElementById('calorie-chart');
    const datePicker = document.getElementById('date-picker');
    const saveDailyButton = document.getElementById('save-daily-calories');
    let calorieChart = null;

    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const htmlElement = document.documentElement;

    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', currentTheme);
    
    // Only update theme icon if it exists (for login/signup pages)
    if (themeIcon) {
        themeIcon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    }

    // Theme toggle event listener (only if toggle button exists)
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            htmlElement.setAttribute('data-theme', newTheme);
            
            // Only update theme icon if it exists
            if (themeIcon) {
                themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
            }
            
            // Save theme preference
            localStorage.setItem('theme', newTheme);
            
            // Update chart colors based on theme (only if chart exists)
            if (calorieChart) {
                updateChart();
            }
        });
    }

    // Initialize date picker with today's date
    if (datePicker) {
        const today = new Date().toISOString().split('T')[0];
        datePicker.value = today;
        
        // Load data for selected date
        loadDailyData(today);
        
        // Listen for date changes
        datePicker.addEventListener('change', (e) => {
            loadDailyData(e.target.value);
        });
    }

    // Save daily calories functionality
    if (saveDailyButton) {
        saveDailyButton.addEventListener('click', () => {
            saveDailyCalories();
        });
    }

    // Load daily data for a specific date
    function loadDailyData(date) {
        const dailyData = JSON.parse(localStorage.getItem('dailyCalories') || '{}');
        const dayData = dailyData[date] || { items: [], total: 0 };
        
        // Clear current items
        if (selectedItemsList) {
            selectedItemsList.innerHTML = '';
        }
        
        // Load items for this date
        dayData.items.forEach(item => {
            // Calculate base calories per 100g from stored data
            const baseCaloriesPer100g = (item.calories / item.quantity) * 100;
            addItemToList(item.name, baseCaloriesPer100g, item.quantity, false);
        });
        
        // Update daily total
        if (dailyTotalSpan) {
            dailyTotalSpan.textContent = dayData.total.toFixed(2);
        }
        
        // Update chart
        updateChart();
    }

    // Save daily calories to localStorage
    function saveDailyCalories() {
        if (!datePicker) return;
        
        const date = datePicker.value;
        const totalCalories = calculateDailyTotal();
        
        const dailyData = JSON.parse(localStorage.getItem('dailyCalories') || '{}');
        const items = [];
        
        // Collect all items for this date
        document.querySelectorAll('#selected-items-list li').forEach(li => {
            const name = li.querySelector('span:first-child').textContent;
            const calories = parseFloat(li.querySelector('.item-calories').textContent);
            const quantity = parseFloat(li.querySelector('.quantity-input').value) || 100;
            items.push({ name, calories, quantity });
        });
        
        dailyData[date] = {
            items: items,
            total: totalCalories
        };
        
        localStorage.setItem('dailyCalories', JSON.stringify(dailyData));
        
        // Show success message
        const originalText = saveDailyButton.textContent;
        saveDailyButton.textContent = 'Saved!';
        saveDailyButton.classList.remove('btn-success');
        saveDailyButton.classList.add('btn-outline-success');
        
        setTimeout(() => {
            saveDailyButton.textContent = originalText;
            saveDailyButton.classList.remove('btn-outline-success');
            saveDailyButton.classList.add('btn-success');
        }, 2000);
        
        updateChart();
    }

    // Calculate total calories for current day
    function calculateDailyTotal() {
        let total = 0;
        document.querySelectorAll('.item-calories').forEach(span => {
            total += parseFloat(span.textContent) || 0;
        });
        return total;
    }

    // Add item to the list (for current day)
    function addItemToList(itemName, baseCaloriesPer100g, quantity = 100, updateTotal = true) {
        if (!selectedItemsList) return;
        
        const calculatedCalories = (quantity / 100) * baseCaloriesPer100g;
        
        const newListItem = document.createElement('li');
        newListItem.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="me-2">${itemName}</span>
                <input type="number" class="form-control form-control-sm quantity-input rounded-pill" placeholder="grams" value="${quantity}" min="0">
                <span class="ms-2">g</span>
            </div>
            <div>
                <span class="item-calories">${calculatedCalories.toFixed(2)}</span> calories
                <button class="btn btn-sm btn-outline-danger ms-2 rounded-pill remove-item">x</button>
            </div>
        `;
        selectedItemsList.appendChild(newListItem);

        const quantityInput = newListItem.querySelector('.quantity-input');
        const itemCaloriesSpan = newListItem.querySelector('.item-calories');
        const removeButton = newListItem.querySelector('.remove-item');

        function updateItemCalories() {
            const qty = parseFloat(quantityInput.value) || 0;
            const calculatedCalories = (qty / 100) * baseCaloriesPer100g;
            itemCaloriesSpan.textContent = calculatedCalories.toFixed(2);
            if (updateTotal) {
                updateDailyTotal();
            }
        }

        quantityInput.addEventListener('input', updateItemCalories);
        removeButton.addEventListener('click', () => {
            newListItem.remove();
            if (updateTotal) {
                updateDailyTotal();
            }
        });

        if (updateTotal) {
            updateDailyTotal();
        }
    }

    // Update daily total display
    function updateDailyTotal() {
        if (dailyTotalSpan) {
            const total = calculateDailyTotal();
            dailyTotalSpan.textContent = total.toFixed(2);
        }
    }

    function updateChart() {
        if (!chartCanvas) return;
        
        if (calorieChart) {
            calorieChart.destroy();
        }

        // Get all saved daily data
        const dailyData = JSON.parse(localStorage.getItem('dailyCalories') || '{}');
        const dates = Object.keys(dailyData).sort();
        const totals = dates.map(date => dailyData[date].total);

        // Get current theme for chart colors
        const isDarkMode = htmlElement.getAttribute('data-theme') === 'dark';
        const textColor = isDarkMode ? '#ffffff' : '#212529';
        const gridColor = isDarkMode ? '#495057' : '#dee2e6';

        calorieChart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: dates.map(date => new Date(date).toLocaleDateString()),
                datasets: [{
                    label: 'Daily Calories',
                    data: totals,
                    borderColor: 'rgba(13, 110, 253, 1)',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(13, 110, 253, 1)',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        ticks: {
                            color: textColor,
                            maxTicksLimit: 7
                        },
                        grid: {
                            color: gridColor
                        },
                        title: {
                            display: true,
                            text: 'Date',
                            color: textColor
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: textColor
                        },
                        grid: {
                            color: gridColor
                        },
                        title: {
                            display: true,
                            text: 'Calories',
                            color: textColor
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: textColor
                        }
                    },
                    tooltip: {
                        backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: gridColor,
                        borderWidth: 1
                    }
                }
            }
        });
    }

    // ===========================================
    // LIVE SEARCH FUNCTIONALITY
    // ===========================================
    
    let searchTimeout;
    const searchInput = document.getElementById('food-search-input');
    const searchResults = document.getElementById('search-results');
    const loadingSpinner = document.getElementById('loading-spinner');
    const noResults = document.getElementById('no-results');
    const resultsList = document.getElementById('results-list');
    const foodItemsList = document.getElementById('food-items-list');

    if (searchInput) {
        // Search input events
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('focus', showSearchResults);
        searchInput.addEventListener('blur', hideSearchResultsDelayed);
        
        // Click outside to close search results
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.position-relative')) {
                hideSearchResults();
            }
        });
    }

    // Handle search input
    function handleSearchInput(e) {
        const query = e.target.value.trim();
        
        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // If query is empty, hide results and show placeholder
        if (!query) {
            hideSearchResults();
            showPlaceholderMessage();
            return;
        }
        
        // Debounce search - wait 300ms after user stops typing
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    }

    // Perform search
    async function performSearch(query) {
        try {
            showLoadingSpinner();
            
            const response = await fetch(`/dashboard/search?q=${encodeURIComponent(query)}&limit=20`);
            const data = await response.json();
            
            hideLoadingSpinner();
            
            if (data.success) {
                displaySearchResults(data.results);
            } else {
                displayError(data.error || 'Search failed');
            }
            
        } catch (error) {
            hideLoadingSpinner();
            displayError('Network error occurred');
            console.error('Search error:', error);
        }
    }

    // Display search results in the main food list
    function displaySearchResults(results) {
        foodItemsList.innerHTML = '';
        
        if (results.length === 0) {
            foodItemsList.innerHTML = '<li class="dropdown-item text-center text-muted py-3"><em>No food items found</em></li>';
            return;
        }
        
        results.forEach(food => {
            const resultItem = createFoodItem(food);
            foodItemsList.appendChild(resultItem);
        });
    }

    // Create food item element for the main list
    function createFoodItem(food) {
        const item = document.createElement('li');
        item.className = 'dropdown-item d-flex align-items-center gap-2 py-2';
        item.setAttribute('data-calories', food.calories_per_100g);
        item.setAttribute('data-name', food.name);
        
        // Determine color based on calories
        let colorClass = 'bg-success'; // Low calorie (green)
        if (food.calories_per_100g > 200) {
            colorClass = 'bg-danger'; // High calorie (red)
        } else if (food.calories_per_100g > 100) {
            colorClass = 'bg-warning'; // Medium calorie (yellow)
        }
        
        item.innerHTML = `
            <span class="d-inline-block ${colorClass} rounded-circle p-1"></span>
            ${escapeHtml(food.name)}
            <span class="calorie-tooltip">${food.calories_per_100g} calories / 100g</span>
        `;
        
        // Add click handler
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('calorie-tooltip')) {
                return;
            }
            const itemName = food.name;
            const baseCalories = food.calories_per_100g;
            
            // Add item to current day's list
            addItemToList(itemName, baseCalories, 100, true);
        });
        
        return item;
    }

    // Show/hide search results dropdown
    function showSearchResults() {
        if (searchResults) {
            searchResults.style.display = 'block';
        }
    }

    function hideSearchResults() {
        if (searchResults) {
            searchResults.style.display = 'none';
        }
    }

    function hideSearchResultsDelayed() {
        // Delay hiding to allow for clicks on results
        setTimeout(hideSearchResults, 200);
    }

    // Show/hide loading spinner
    function showLoadingSpinner() {
        if (loadingSpinner) {
            loadingSpinner.style.display = 'block';
        }
        if (noResults) {
            noResults.style.display = 'none';
        }
    }

    function hideLoadingSpinner() {
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
    }

    // Show placeholder message
    function showPlaceholderMessage() {
        if (foodItemsList) {
            foodItemsList.innerHTML = '<li class="dropdown-item text-center text-muted py-3"><em>Start typing to search for food items...</em></li>';
        }
    }

    // Display error message
    function displayError(message) {
        if (foodItemsList) {
            foodItemsList.innerHTML = `<li class="dropdown-item text-center text-danger py-3"><em>Error: ${escapeHtml(message)}</em></li>`;
        }
    }

    // Utility function to escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Only initialize chart if we're on the main page
    if (chartCanvas) {
        updateChart();
    }
});