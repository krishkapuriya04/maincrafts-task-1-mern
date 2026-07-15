const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Product = require('./models/Product');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongodbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mern_crud';
mongoose.connect(mongodbUri)
  .then(() => console.log('Connected to MongoDB database successfully'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Routes

// 1. GET /api/products - Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving products', error: error.message });
  }
});

// 2. POST /api/products - Create a new product
app.post('/api/products', async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const newProduct = new Product({ name, price });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error creating product', error: error.message });
  }
});

// 3. PUT /api/products/:id - Update an existing product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { name, price } = req.body;
    const { id } = req.params;

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required for update' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, price },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error updating product', error: error.message });
  }
});

// 4. DELETE /api/products/:id - Delete a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
