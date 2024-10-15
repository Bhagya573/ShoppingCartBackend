const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Paths to JSON files in the db folder
const dbFolderPath = path.join(__dirname, 'DB');
const userFilePath = path.join(dbFolderPath, 'user.json');
const productFilePath = path.join(dbFolderPath, 'product.json');

// Initialize JSON files if they don't exist
const initializeJsonFiles = () => {
    if (!fs.existsSync(dbFolderPath)) {
        fs.mkdirSync(dbFolderPath); // Create db folder if it doesn't exist
    }

    if (!fs.existsSync(userFilePath)) {
        fs.writeFileSync(userFilePath, JSON.stringify([], null, 2)); // Create user.json with an empty array
        console.log('Initialized user.json file.');
    }

    if (!fs.existsSync(productFilePath)) {
        fs.writeFileSync(productFilePath, JSON.stringify([], null, 2)); // Create product.json with an empty array
        console.log('Initialized product.json file.');
    }
};

// Call the function on server start
initializeJsonFiles();

// Load users from JSON file
const loadUsers = () => {
    try {
        const data = fs.readFileSync(userFilePath, 'utf8');
        if (!data) {
            throw new Error('File is empty');
        }
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading users:', error.message);
        return []; // Return an empty array if there's an error
    }
};

// Save users to JSON file
const saveUsers = (users) => {
    fs.writeFileSync(userFilePath, JSON.stringify(users, null, 2));
};

// Load products from JSON file
const loadProducts = () => {
    try {
        const data = fs.readFileSync(productFilePath, 'utf8');
        if (!data) {
            throw new Error('File is empty');
        }
        console.log("products",data)
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading products:', error.message);
        return []; // Return an empty array if there's an error
    }
};

// Save products to JSON file
const saveProducts = (products) => {
    fs.writeFileSync(productFilePath, JSON.stringify(products, null, 2));
};

// Get the next available numeric ID
const getNextId = (items) => {
    return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
};

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = loadUsers();

    // Check if user already exists
    let user = users.find(u => u.username === username);

    if (user) {
        // If the user exists, check credentials
        if (user.password === password) {
            res.json({ message: 'Logged in successfully!', userId: user.id, username });
        } else {
            res.status(401).json({ error_code: 401, error_message: 'Invalid credentials.' });
        }
    } else {
        // If user does not exist, create a new user
        const newUser = {
            id: getNextId(users), // Generate a numeric ID
            username,
            password
        };

        users.push(newUser);
        saveUsers(users); // Save the updated user list to the JSON file
        res.status(201).json({ message: 'User created and logged in successfully!', userId: newUser.id, username });
    }
});

// Add product endpoint
app.post('/add-product', (req, res) => {
    console.log('Received request to add product:', req.body);

    const products = loadProducts();
    const newProduct = {
        id: getNextId(products), // Generate a numeric ID
        title: req.body.title,
        price: req.body.price,
        image: req.body.image
    };

    products.push(newProduct);
    saveProducts(products); // Save the updated product list to the JSON file
    res.status(201).json(newProduct);
});

// Get products endpoint
app.get('/products', (req, res) => {
    console.log("products",req)
    const products = loadProducts(); // Load products from JSON file
    res.json(products); // Send products as JSON response
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

