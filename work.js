// Define keys for local storage
const INVENTORY_KEY = 'inventory';
const ORDERS_KEY = 'orders';
const RECENT_ORDERS_KEY = 'recent_orders';

let inventory = [];
let orders = [];
let recentOrders = [];

// Load data from localStorage
function loadData() {
    try {
        inventory = JSON.parse(localStorage.getItem(INVENTORY_KEY)) || [];
        orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
        recentOrders = JSON.parse(localStorage.getItem(RECENT_ORDERS_KEY)) || [];
    } catch (error) {
        console.error("Error loading data:", error);
        inventory = [];
        orders = [];
        recentOrders = [];
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(recentOrders));
}

// Display Inventory
function showInventory() {
    const inventoryList = document.getElementById('inventory-list');
    inventoryList.innerHTML = '';

    inventory.forEach(product => {
        const productItem = document.createElement('li');
        productItem.textContent = `ID: ${product.id}, Name: ${product.name}, Quantity: ${product.quantity}, Expiry: ${product.expiration_date}, Threshold: ${product.threshold}`;
        inventoryList.appendChild(productItem);

        // Alert if stock is below threshold
        if (product.quantity < product.threshold) {
            setTimeout(() => {
                const reorderAmount = parseInt(prompt(`Stock for ${product.name} is low (${product.quantity}). Reorder quantity?`), 10);
                if (!isNaN(reorderAmount) && reorderAmount > 0) {
                    product.quantity += reorderAmount;
                    saveData();
                    showInventory();
                    alert(`${reorderAmount} units added to inventory.`);
                }
            }, 500);
        }
    });
}

// Display Orders
function showOrders() {
    const orderList = document.getElementById('order-list');
    orderList.innerHTML = '';

    orders.forEach((order, index) => {
        const orderItem = document.createElement('li');
        orderItem.innerHTML = `
            Order ID: ${order.order_id}, 
            Customer ID: ${order.customer_id}, 
            Items: ${order.num_items}, 
            Status: ${order.status} 
            <button onclick="completeOrder(${index})">✅ Complete</button>
        `;
        orderList.appendChild(orderItem);
    });
}

// Display Recent Orders
function showRecentOrders() {
    const recentOrdersList = document.getElementById('recent-orders-list');
    recentOrdersList.innerHTML = '';

    recentOrders.forEach(order => {
        const orderItem = document.createElement('li');
        orderItem.classList.add('completed');
        orderItem.textContent = `Order ID: ${order.order_id}, Customer ID: ${order.customer_id}, Items: ${order.num_items}, Status: ${order.status}`;
        recentOrdersList.appendChild(orderItem);
    });
}

// Generate unique order ID
function generateOrderId() {
    return orders.length > 0 ? Math.max(...orders.map(order => order.order_id)) + 1 : 1000;
}

// Create a new order
function createOrder() {
    const customerId = parseInt(prompt('Enter Customer ID:'), 10);
    const numItems = parseInt(prompt('Enter number of items:'), 10);
    const orderId = generateOrderId();

    let order = {
        order_id: orderId,
        customer_id: customerId,
        num_items: numItems,
        status: 'Pending',
        ordered_items: []
    };

    for (let i = 0; i < numItems; i++) {
        const productId = parseInt(prompt(`Enter Product ID for item ${i + 1}:`), 10);
        const quantity = parseInt(prompt('Enter quantity for this item:'), 10);

        const product = inventory.find(item => item.id === productId);

        if (product && quantity <= product.quantity) {
            product.quantity -= quantity;
            order.ordered_items.push({ id: product.id, quantity, expiration_date: product.expiration_date });
        } else {
            alert('Not enough stock for this product.');
            i--;
        }
    }

    orders.push(order);
    saveData();
    alert(`Order #${orderId} created successfully!`);
    showInventory();
    showOrders();
}

// Process an order (update order status)
function processOrder() {
    const orderId = parseInt(prompt('Enter Order ID to update:'), 10);
    const order = orders.find(o => o.order_id === orderId);

    if (order) {
        const newStatus = prompt('Enter new status (Processing, Out for Shipping, Out for Delivery, Error):').trim();
        if (["Processing", "Out for Shipping", "Out for Delivery", "Error"].includes(newStatus)) {
            order.status = newStatus;
            saveData();
            alert(`Order #${orderId} status updated to ${newStatus}.`);
            showOrders();
        } else {
            alert('Invalid status.');
        }
    } else {
        alert('Order not found.');
    }
}

// Mark an order as completed and move it to recent orders
function completeOrder(index) {
    const completedOrder = orders.splice(index, 1)[0];
    completedOrder.status = "Completed";
    recentOrders.push(completedOrder);

    saveData();
    showOrders();
    showRecentOrders();
}

// Add product to inventory
function addProduct() {
    const id = parseInt(prompt('Enter Product ID:'), 10);
    const name = prompt('Enter Product Name:');
    const quantity = parseInt(prompt('Enter Product Quantity:'), 10);
    const expiration_date = prompt('Enter Expiration Date (YYYY-MM-DD):');
    const threshold = parseInt(prompt('Enter threshold value of product:'), 10);

    const existingProduct = inventory.find(product => product.id === id);
    if (existingProduct) {
        existingProduct.quantity += quantity;
        alert('Product exists. Updated quantity.');
    } else {
        if (new Date(expiration_date) < new Date()) {
            alert('Warning: Product batch is expired. Not added to inventory.');
            return;
        }
        inventory.push({ id, name, quantity, expiration_date, threshold });
        alert('New product added.');
    }

    saveData();
    showInventory();
}

// Delete product from inventory
function deleteProduct() {
    const productId = parseInt(prompt('Enter Product ID to delete:'), 10);
    const index = inventory.findIndex(product => product.id === productId);

    if (index !== -1) {
        inventory.splice(index, 1);
        saveData();
        alert('Product deleted.');
        showInventory();
    } else {
        alert('Product not found.');
    }
}

// Dark Mode Toggle
const themeToggle = document.getElementById('theme-toggle');

if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = "☀ Light Mode";
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        themeToggle.textContent = "☀ Light Mode";
    } else {
        localStorage.setItem('theme', 'light');
        themeToggle.textContent = "🌙 Dark Mode";
    }
});

// Load initial data
document.addEventListener("DOMContentLoaded", function () {
    loadData();
    showInventory();
    showOrders();
    showRecentOrders();

    document.getElementById('create-order-btn').onclick = createOrder;
    document.getElementById('process-order-btn').onclick = processOrder;
    document.getElementById('add-product-btn').onclick = addProduct;
    document.getElementById('delete-product-btn').onclick = deleteProduct;
});

// Function to download JSON data
function downloadData(type) {
    let data, filename;

    if (type === 'inventory') {
        data = inventory;
        filename = 'inventory.json';
    } else if (type === 'pending_orders') {
        data = orders;
        filename = 'pending_orders.json';
    } else if (type === 'completed_orders') {
        data = recentOrders;
        filename = 'completed_orders.json';
    } else {
        alert('Invalid data type.');
        return;
    }

    if (!data || data.length === 0) {
        alert(`No ${type.replace('_', ' ')} data to download.`);
        return;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}
// Clear all completed (recent) orders
function clearRecentOrders() {
    if (recentOrders.length === 0) {
        alert("No completed orders to clear.");
        return;
    }

    if (confirm("Are you sure you want to clear all completed orders?")) {
        recentOrders = [];
        saveData();
        showRecentOrders();
        alert("All completed orders have been cleared.");
    }
}