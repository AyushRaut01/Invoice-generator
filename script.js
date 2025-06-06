document.addEventListener('DOMContentLoaded', function() {
    // Tab Navigation
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Add input validation for phone fields
    const phoneFields = document.querySelectorAll('input[type="tel"]');
    phoneFields.forEach(field => {
        field.addEventListener('input', function() {
            // Only allow digits
            this.value = this.value.replace(/\D/g, '');
            
            // If more than 10 digits, truncate
            if (this.value.length > 10) {
                this.value = this.value.slice(0, 10);
            }
            
            
            if (this.value && this.value.length !== 10) {
                this.classList.add('invalid');
                this.setCustomValidity("Please enter 10 digits phone number");
            } else {
                this.classList.remove('invalid');
                this.setCustomValidity("");
            }
        });
        
        // Also validate on blur to handle partial entries
        field.addEventListener('blur', function() {
            if (this.value && this.value.length !== 10) {
                this.classList.add('invalid');
                this.setCustomValidity("Please enter 10 digits phone number");
                this.reportValidity();
            } else {
                this.classList.remove('invalid');
                this.setCustomValidity("");
            }
        });
    });
    
    // Next & Previous Buttons
    const nextButtons = document.querySelectorAll('.next-btn');
    const prevButtons = document.querySelectorAll('.prev-btn');
    
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentTab = document.querySelector('.tab.active');
            const nextTab = currentTab.nextElementSibling;
            
            // Check if all required fields in the current tab are filled
            const currentTabContent = document.getElementById(currentTab.getAttribute('data-tab'));
            const requiredFields = currentTabContent.querySelectorAll('input[required], select[required], textarea[required]');
            
            let allFieldsValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value) {
                    field.classList.add('invalid');
                    allFieldsValid = false;
                    field.reportValidity(); // Show browser validation message
                } else {
                    // Additional validation for specific field types
                    if (field.type === 'email' && !isValidEmail(field.value)) {
                        field.classList.add('invalid');
                        allFieldsValid = false;
                        field.setCustomValidity("Please enter a valid email address");
                        field.reportValidity();
                    } else if (field.type === 'tel' && field.value && !isValidPhone(field.value)) {
                        field.classList.add('invalid');
                        allFieldsValid = false;
                        field.setCustomValidity("Please enter 10 digits phone number");
                        field.reportValidity();
                    } else {
                        field.classList.remove('invalid');
                        field.setCustomValidity(""); // Clear any custom validation message
                    }
                }
            });
            
            // Also check non-required phone fields in this tab
            const phoneFields = currentTabContent.querySelectorAll('input[type="tel"]:not([required])');
            phoneFields.forEach(field => {
                if (field.value && !isValidPhone(field.value)) {
                    field.classList.add('invalid');
                    allFieldsValid = false;
                    field.setCustomValidity("Please enter 10 digits phone number");
                    field.reportValidity();
                }
            });
            
            if (allFieldsValid && nextTab) {
                nextTab.click();
            }
        });
    });
    
    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentTab = document.querySelector('.tab.active');
            const prevTab = currentTab.previousElementSibling;
            
            if (prevTab) {
                prevTab.click();
            }
        });
    });
    
    // Logo Upload
    const logoUpload = document.querySelector('.logo-upload');
    const logoInput = document.getElementById('business-logo');
    const logoImage = document.getElementById('logo-image');
    
    logoUpload.addEventListener('click', () => {
        logoInput.click();
    });
    
    logoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                logoImage.src = event.target.result;
                logoImage.style.display = 'block'; // Make sure the image is visible
                logoImage.onload = function() {
                    // Ensure the image is completely loaded
                    URL.revokeObjectURL(logoImage.src); // Clean up the object URL
                };
            }
            reader.readAsDataURL(file);
        }
    });
    
    // Invoice Items
    const addItemButton = document.getElementById('add-item');
    const itemsContainer = document.getElementById('items-container');
    let itemCounter = 1;
    
    addItemButton.addEventListener('click', () => {
        itemCounter++;
        
        const newItem = document.createElement('div');
        newItem.className = 'item-row';
        newItem.setAttribute('data-item-id', itemCounter);
        
        newItem.innerHTML = `
            <div class="col description">
                <input type="text" name="item-description-${itemCounter}" class="item-description" required>
            </div>
            <div class="col quantity">
                <input type="number" name="item-quantity-${itemCounter}" class="item-quantity" value="1" min="1" required>
            </div>
            <div class="col price">
                <input type="number" name="item-price-${itemCounter}" class="item-price" value="0" min="0" step="0.01" required>
            </div>
            <div class="col tax">
                <input type="number" name="item-tax-${itemCounter}" class="item-tax" value="0" min="0">
            </div>
            <div class="col total">
                <span class="item-total">0.00</span>
            </div>
            <div class="col action">
                <button type="button" class="remove-item">×</button>
            </div>
        `;
        
        itemsContainer.appendChild(newItem);
        
        // Add event listeners to the new inputs
        const newInputs = newItem.querySelectorAll('input');
        newInputs.forEach(input => {
            input.addEventListener('input', updateTotals);
        });
        
        // Add event listener to remove button
        const removeButton = newItem.querySelector('.remove-item');
        removeButton.addEventListener('click', () => {
            newItem.remove();
            updateTotals();
        });
    });
    
    // Add event listener to global discount
    const globalDiscount = document.getElementById('global-discount');
    globalDiscount.addEventListener('input', updateTotals);
    
    // Add event listeners to existing inputs
    const initialInputs = itemsContainer.querySelectorAll('input');
    initialInputs.forEach(input => {
        input.addEventListener('input', updateTotals);
    });
    
    // Add event listener to initial remove button
    const initialRemoveButton = itemsContainer.querySelector('.remove-item');
    initialRemoveButton.addEventListener('click', (e) => {
        // Don't remove if it's the only item
        if (itemsContainer.querySelectorAll('.item-row').length > 1) {
            e.target.closest('.item-row').remove();
            updateTotals();
        }
    });
    
    // Update totals when inputs change
    function updateTotals() {
        let baseSubtotal = 0;
        let taxTotal = 0;
        
        const itemRows = document.querySelectorAll('.item-row');
        
        // Calculate the item totals first
        itemRows.forEach(row => {
            const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            const taxRate = parseFloat(row.querySelector('.item-tax').value) || 0;
            
            const baseAmount = quantity * price;
            const taxAmount = baseAmount * (taxRate / 100);
            const lineTotal = baseAmount + taxAmount;
            
            row.querySelector('.item-total').textContent = lineTotal.toFixed(2);
            
            baseSubtotal += baseAmount;
            taxTotal += taxAmount;
        });
        
        // Calculate global discount
        const discountRate = parseFloat(document.getElementById('global-discount').value) || 0;
        const discountAmount = baseSubtotal * (discountRate / 100);
        
        // Calculate final totals
        const subtotal = baseSubtotal - discountAmount;
        const grandTotal = subtotal + taxTotal;
        
        document.getElementById('subtotal').textContent = baseSubtotal.toFixed(2);
        document.getElementById('discount-total').textContent = discountAmount.toFixed(2);
        document.getElementById('tax-total').textContent = taxTotal.toFixed(2);
        document.getElementById('grand-total').textContent = grandTotal.toFixed(2);
    }
    
    // Set default dates
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 30); // Due date 30 days from now
    
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    document.getElementById('invoice-date').value = formatDate(today);
    document.getElementById('due-date').value = formatDate(dueDate);
    
    // Preview & Download
    const previewTab = document.querySelector('.tab[data-tab="preview"]');
    
    previewTab.addEventListener('click', updatePreview);
    
    function updatePreview() {
        // Logo
        const logoImage = document.getElementById('logo-image');
        const previewLogo = document.getElementById('preview-logo');
        
        // Only set the logo if it has a valid source
        if (logoImage.src && logoImage.src !== window.location.href && logoImage.src !== "") {
            previewLogo.src = logoImage.src;
            previewLogo.style.display = 'block';
        } else {
            previewLogo.style.display = 'none';
        }
        
        // Business Info
        const businessName = document.getElementById('business-name').value;
        document.getElementById('billing-business-name').textContent = businessName;
        
        const businessStreet = document.getElementById('business-street').value;
        const businessApartment = document.getElementById('business-apartment').value;
        const businessCity = document.getElementById('business-city').value;
        const businessZip = document.getElementById('business-zip').value;
        const businessCountry = document.getElementById('business-country');
        const selectedCountry = businessCountry.options[businessCountry.selectedIndex] ? 
                                businessCountry.options[businessCountry.selectedIndex].text : '';
        
        let businessAddress = '';
        if (businessStreet) businessAddress += businessStreet + ', ';
        if (businessApartment) businessAddress += businessApartment + ', ';
        if (businessCity) businessAddress += businessCity + ', ';
        if (businessZip) businessAddress += businessZip + ', ';
        if (selectedCountry && selectedCountry !== 'Select a country') businessAddress += selectedCountry;
        
        document.getElementById('billing-business-address').textContent = businessAddress;
        
        const businessEmail = document.getElementById('business-email').value;
        const businessPhone = document.getElementById('business-phone').value;
        
        let businessContact = '';
        if (businessEmail) businessContact += 'Email: ' + businessEmail;
        if (businessEmail && businessPhone) businessContact += ' | ';
        if (businessPhone) businessContact += 'Phone: ' + businessPhone;
        
        document.getElementById('billing-business-contact').textContent = businessContact;
        
        const businessId = document.getElementById('business-id').value;
        const taxId = document.getElementById('tax-id').value;
        
        document.getElementById('billing-business-id').textContent = businessId ? 'Business ID: ' + businessId : '';
        document.getElementById('billing-tax-id').textContent = taxId ? 'Tax ID: ' + taxId : '';
        
        // Client Info
        const clientName = document.getElementById('client-name').value;
        document.getElementById('billing-client-name').textContent = clientName;
        
        const clientStreet = document.getElementById('client-street').value;
        const clientApartment = document.getElementById('client-apartment').value;
        const clientCity = document.getElementById('client-city').value;
        const clientZip = document.getElementById('client-zip').value;
        const clientCountry = document.getElementById('client-country');
        const selectedClientCountry = clientCountry.options[clientCountry.selectedIndex] ? 
                                      clientCountry.options[clientCountry.selectedIndex].text : '';
        
        let clientAddress = '';
        if (clientStreet) clientAddress += clientStreet + ', ';
        if (clientApartment) clientAddress += clientApartment + ', ';
        if (clientCity) clientAddress += clientCity + ', ';
        if (clientZip) clientAddress += clientZip + ', ';
        if (selectedClientCountry && selectedClientCountry !== 'Select a country') clientAddress += selectedClientCountry;
        
        document.getElementById('billing-client-address').textContent = clientAddress;
        
        const clientEmail = document.getElementById('client-email').value;
        const clientPhone = document.getElementById('client-phone').value;
        
        let clientContact = '';
        if (clientEmail) clientContact += 'Email: ' + clientEmail;
        if (clientEmail && clientPhone) clientContact += ' | ';
        if (clientPhone) clientContact += 'Phone: ' + clientPhone;
        
        document.getElementById('billing-client-contact').textContent = clientContact;
        
        // Invoice Details
        const invoiceNumber = document.getElementById('invoice-number').value;
        document.getElementById('preview-invoice-number').textContent = invoiceNumber;
        
        const invoiceDate = document.getElementById('invoice-date').value;
        const dueDateValue = document.getElementById('due-date').value;
        
        const formatDisplayDate = (dateString) => {
            if (!dateString) return '';
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        };
        
        document.getElementById('preview-invoice-date').textContent = formatDisplayDate(invoiceDate);
        document.getElementById('preview-due-date').textContent = formatDisplayDate(dueDateValue);
        
        // Currency
        const currency = document.getElementById('currency');
        const selectedCurrency = currency.options[currency.selectedIndex].value;
        const currencySymbol = getCurrencySymbol(selectedCurrency);
        
        // Payment Info
        const paymentMethod = document.getElementById('payment-method').value;
        document.getElementById('preview-payment-method').textContent = paymentMethod ? 'Method: ' + paymentMethod : '';
        
        const paymentStatus = document.getElementById('payment-status');
        const selectedStatus = paymentStatus.options[paymentStatus.selectedIndex].text;
        document.getElementById('preview-payment-status').textContent = 'Status: ' + selectedStatus;
        
        const shippingStatus = document.getElementById('shipping-status');
        const selectedShippingStatus = shippingStatus.options[shippingStatus.selectedIndex].text;
        document.getElementById('preview-shipping-status').textContent = 'Shipping: ' + selectedShippingStatus;
        
        const bankInfo = document.getElementById('bank-info').value;
        document.getElementById('preview-bank-info').textContent = bankInfo;
        
        // Notes
        const notes = document.getElementById('notes').value;
        document.getElementById('preview-notes').textContent = notes;
        
        // Items
        const itemsContainer = document.getElementById('preview-items-container');
        itemsContainer.innerHTML = '';
        
        const itemRows = document.querySelectorAll('.item-row');
        
        itemRows.forEach(row => {
            const description = row.querySelector('.item-description').value;
            const quantity = row.querySelector('.item-quantity').value;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            const taxRate = row.querySelector('.item-tax').value;
            const total = parseFloat(row.querySelector('.item-total').textContent) || 0;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${description || 'Item'}</td>
                <td class="text-center">${quantity}</td>
                <td class="text-end">${currencySymbol}${price.toFixed(2)}</td>
                <td class="text-center">${taxRate}%</td>
                <td class="text-end">${currencySymbol}${total.toFixed(2)}</td>
            `;
            
            itemsContainer.appendChild(tr);
        });
        
        // Totals
        const subtotal = document.getElementById('subtotal').textContent;
        const discountTotal = document.getElementById('discount-total').textContent;
        const taxTotal = document.getElementById('tax-total').textContent;
        const grandTotal = document.getElementById('grand-total').textContent;
        
        document.getElementById('preview-subtotal').textContent = subtotal;
        document.getElementById('preview-discount-total').textContent = discountTotal;
        document.getElementById('preview-tax-total').textContent = taxTotal;
        document.getElementById('preview-grand-total').textContent = grandTotal;
        
        // Update currency symbols in preview
        document.querySelectorAll('.preview-currency').forEach(el => {
            el.textContent = currencySymbol;
        });

        // Add information about the global discount to the print template
        const discountInfo = document.createElement('div');
        discountInfo.className = 'global-discount-info';
        discountInfo.innerHTML = `
            <div class="discount-rate">Discount Rate: ${document.getElementById('global-discount').value}%</div>
        `;
        const previewDiscount = document.createElement('span');
        previewDiscount.id = 'preview-discount-rate';
        previewDiscount.textContent = document.getElementById('global-discount').value + '%';
        
        // Update preview discount info
        const discountInfoContainer = document.querySelector('.gst-split tr:nth-child(2) td:first-child');
        if (discountInfoContainer) {
            discountInfoContainer.innerHTML = `Discount <span class="small">(${document.getElementById('global-discount').value}%)</span>`;
        }
    }
    
    function getCurrencySymbol(currencyCode) {
        const currencies = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'JPY': '¥',
            // Add more currencies as needed
        };
        return currencies[currencyCode] || '$';
    }
    
    // Download PDF / Print Invoice
    const downloadButton = document.getElementById('download-pdf');
    
    downloadButton.addEventListener('click', () => {
        // Check if all required fields are filled
        const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
        let allFieldsValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value) {
                field.classList.add('invalid');
                allFieldsValid = false;
            } else {
                // Additional validation for specific field types
                if (field.type === 'email' && !isValidEmail(field.value)) {
                    field.classList.add('invalid');
                    allFieldsValid = false;
                    field.setCustomValidity("Please enter a valid email address");
                    field.reportValidity();
                } else {
                    field.classList.remove('invalid');
                    field.setCustomValidity(""); // Clear any custom validation message
                }
            }
        });
        
        // Also check phone fields even if they're not required
        const phoneFields = document.querySelectorAll('input[type="tel"]');
        phoneFields.forEach(field => {
            if (field.value && !isValidPhone(field.value)) {
                field.classList.add('invalid');
                allFieldsValid = false;
                field.setCustomValidity("Please enter 10 digits phone number");
                field.reportValidity();
            }
        });
        
        if (!allFieldsValid) {
            alert('Please check all fields for valid input before generating the invoice.');
            return;
        }
        
        // Prepare the invoice for printing
        const element = document.getElementById('invoice-to-pdf');
        const originalContent = document.body.innerHTML;
        
        
        element.classList.add('print-mode');
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        
        // Create a properly formatted page for printing
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice ${document.getElementById('invoice-number').value}</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        padding: 20px;
                        color: #333;
                    }
                    .invoice-container {
                        max-width: 800px;
                        margin: 0 auto;
                        background: white;
                        padding: 30px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    }
                    .header-section {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 15px;
                    }
                    .header-left {
                        flex: 1;
                    }
                    .header-center {
                        flex: 1;
                        display: flex;
                        justify-content: center;
                        align-items: flex-start;
                        padding-top: 15px;
                    }
                    .header-center h2 {
                        font-size: 2.5rem;
                        color: #3498db;
                        margin-bottom: 10px;
                        text-align: center;
                    }
                    .header-right {
                        flex: 1;
                        text-align: right;
                    }
                    .date-status-section {
                        display: flex;
                        justify-content: flex-end;
                        align-items: center;
                        margin-bottom: 20px;
                    }
                    .date-section {
                        display: flex;
                        gap: 30px;
                        margin-right: 20px;
                    }
                    .date-container {
                        text-align: left;
                        margin-bottom: 10px;
                    }
                    .status-container {
                        display: flex;
                        flex-direction: column;
                        gap: 5px;
                    }
                    .business-logo-container {
                        width: 150px;
                        height: 100px;
                        display: flex;
                        align-items: center;
                        margin-bottom: 15px;
                    }
                    .business-logo-container img {
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain;
                    }
                    .client-main-info {
                        margin-bottom: 10px;
                    }
                    .bold {
                        font-weight: 700;
                        margin-bottom: 5px;
                    }
                    .customer-info {
                        margin-bottom: 30px;
                    }
                    .items-preview-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 30px;
                    }
                    .items-preview-table th {
                        background-color: #f5f5f5;
                        padding: 12px;
                        text-align: left;
                        border: 1px solid #ddd;
                    }
                    .items-preview-table td {
                        padding: 12px;
                        border: 1px solid #ddd;
                    }
                    .items-preview-table td:nth-child(2),
                    .items-preview-table td:nth-child(4),
                    .items-preview-table td:nth-child(5) {
                        text-align: center;
                    }
                    .items-preview-table td:nth-child(3),
                    .items-preview-table td:nth-child(6) {
                        text-align: right;
                    }
                    .gst-split {
                        margin-top: 20px;
                        width: 100%;
                    }
                    .gst-split table {
                        width: 300px;
                        margin-left: auto;
                        border-collapse: collapse;
                    }
                    .gst-split td {
                        padding: 8px;
                        border-bottom: 1px solid #dee2e6;
                    }
                    .gst-split td:last-child {
                        text-align: right;
                    }
                    .total-row td {
                        font-weight: bold;
                        border-top: 2px solid #000;
                        border-bottom: none !important;
                    }
                    .bank-info {
                        white-space: pre-line;
                        font-family: monospace;
                        background-color: #f9f9f9;
                        padding: 10px;
                        border-radius: 4px;
                        margin-top: 10px;
                    }
                    .text-end {
                        text-align: right;
                    }
                    .text-center {
                        text-align: center;
                    }
                    .mb-4 {
                        margin-bottom: 1.5rem;
                    }
                    .mt-4 {
                        margin-top: 1.5rem;
                    }
                    .row {
                        display: flex;
                        flex-wrap: wrap;
                        margin-right: -15px;
                        margin-left: -15px;
                    }
                    .col-md-6 {
                        flex: 0 0 50%;
                        max-width: 50%;
                        padding-right: 15px;
                        padding-left: 15px;
                    }
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                    @media print {
                        body {
                            padding: 0;
                        }
                        .invoice-container {
                            box-shadow: none;
                            padding: 0;
                        }
                    }
                    .small {
                        font-size: 85%;
                        opacity: 0.8;
                    }
                    .billing-section {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 30px;
                        padding-top: 10px;
                        border-top: 1px solid #eee;
                    }
                    
                    .billing-from,
                    .billing-to {
                        flex: 1;
                        max-width: 48%;
                    }
                    
                    .billing-to {
                        text-align: right;
                    }
                    
                    .billing-from h5,
                    .billing-to h5 {
                        margin-bottom: 10px;
                        padding-bottom: 5px;
                        border-bottom: 1px solid #eee;
                    }
                </style>
            </head>
            <body>
                <div class="invoice-container">
                    ${element.innerHTML}
                </div>
                <script>
                    window.onload = function() {
                        // Automatically open print dialog when the page loads
                        window.print();
                        // Close the window after printing (optional)
                        window.onafterprint = function() {
                            window.close();
                        };
                    }
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        
        // Clean up
        element.classList.remove('print-mode');
    });
    
    // Initial calculations
    updateTotals();

    // Fix missing logo in PDF
    if (!logoImage.src || logoImage.src === window.location.href || logoImage.src === "") {
        logoImage.style.display = 'none';
    }
    
    // Fix any layout issues on window resize
    window.addEventListener('resize', function() {
        if (document.querySelector('.tab[data-tab="preview"]').classList.contains('active')) {
            updatePreview();
        }
    });

    // Function to validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    
    function isValidPhone(phone) {
       
        return /^\d{10}$/.test(phone);
    }
}); 

