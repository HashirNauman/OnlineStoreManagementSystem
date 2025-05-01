'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/dashboard-layout';
import { Users, Edit, Trash2, Plus } from 'lucide-react';
import axios from 'axios';
import Button from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Home, UserCog, Package, ShoppingBag, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  available_quantity: number;
  image_url: string;
  category: string;
}

const navItems = [
  { name: 'Dashboard', icon: Home, path: '/admin' },
  { name: 'Manage Cashiers', icon: UserCog, path: '/admin/manage-cashier' },
  { name: 'Customer History', icon: Users, path: '/admin/customer-history' },
  { name: 'Inventory', icon: Package, path: '/admin/inventory' },
  { name: 'Feedback', icon: Package, path:'/admin/feedback' },
];

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    price: 0,
    available_quantity: 0,
    image_url: '',
    category: 'biscuits', // Default category
  });
  const [editableProduct, setEditableProduct] = useState<Partial<Product> | null>(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Product[]>(`${BACKEND_URL}/api/inventory/`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.description || newProduct.price <= 0 || newProduct.available_quantity < 0) {
      alert('Please fill in all fields correctly.');
      return;
    }
  
    setAdding(true);
    try {
      // Ensure price is a string before sending
      const response = await axios.post<Product>(`${BACKEND_URL}/api/inventory/`, {
        ...newProduct,
        price: newProduct.price.toString(), // Convert price to string
      });
      setProducts((prevProducts) => [...prevProducts, response.data]);
      setNewProduct({ name: '', description: '', price: 0, available_quantity: 0, image_url: '', category: 'biscuits' });
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateProduct = async (id: number, updatedData: Partial<Product>) => {
    try {
      const response = await axios.put<Product>(`${BACKEND_URL}/api/inventory/${id}/`, updatedData);
      setProducts((prevProducts) =>
        prevProducts.map((product) => (product.id === id ? response.data : product))
      );
      setIsEditing(false);
      setEditableProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/inventory/${id}/`);
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditableProduct({ ...product });
    setIsEditing(!isEditing);
  };

  return (
    <DashboardLayout
      title="Inventory"
      navItems={navItems}
      activeNavItem="Inventory"
      setActiveNavItem={() => {}}
      userEmail="admin@example.com"
      userInitials="AD"
    >
      <div>
        <CardHeader className='text-teal-400'>
          <CardTitle>Inventory Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p>Loading inventory...</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-4 ">
                  <Input
                    className="bg-gray-300 text-black border-white"
                    type="text"
                    placeholder="Name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    className="bg-gray-300 text-black border-white"
                    type="text"
                    placeholder="Description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))}
                  />
                  <Input
                    className="bg-gray-300 text-black border-white"
                    type="number"
                    placeholder="Price"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, price: parseFloat(e.target.value) }))}
                  />
                  <Input
                    className="bg-gray-300 text-black border-white"
                    type="number"
                    placeholder="Available Quantity"
                    value={newProduct.available_quantity}
                    onChange={(e) =>
                      setNewProduct((prev) => ({ ...prev, available_quantity: parseInt(e.target.value) }))
                    }
                  />
                  <Input
                    className="bg-gray-300 text-black border-white"
                    type="text"
                    placeholder="Image URL"
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, image_url: e.target.value }))}
                  />
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, category: e.target.value }))}
                    className="bg-gray-300 text-black border-white p-2"
                  >
                    <option value="biscuits">Biscuits</option>
                    <option value="snacks">Snacks</option>
                    <option value="fast_food">Fast Food</option>
                    <option value="stationary">Stationary Items</option>
                    <option value="electronics">Small Electronics</option>
                  </select>
                  <Button className='bg-green-700 hover:bg-green-500' onClick={handleAddProduct} disabled={adding}>
                    {adding ? 'Adding...' : <><Plus className="w-4 h-4 mr-2" /> Add Product</>}
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Available Quantity</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Category</TableHead> {/* Added Category column */}
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length > 0 ? (
                      products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.description}</TableCell>
                          <TableCell>${product.price}</TableCell>
                          <TableCell>{product.available_quantity}</TableCell>
                          <TableCell>
                            {product.image_url && <img src={product.image_url} alt={product.name} className="w-20 h-20 object-cover" />}
                          </TableCell>
                          <TableCell>{product.category}</TableCell> {/* Display Category */}
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button className='bg-yellow-200'
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClick(product)}
                              >
                                <Edit className="w-4 h-4 mr-2" /> Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          No products found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {isEditing && editableProduct && (
                  <div className="mt-4">
                    <h3 className="text-xl font-semibold">Edit Product</h3>
                    <div className="space-y-4">
                      <Input
                        type="text"
                        placeholder="Name"
                        value={editableProduct.name || ''}
                        onChange={(e) =>
                          setEditableProduct({ ...editableProduct, name: e.target.value })
                        }
                      />
                      <Input
                        className="bg-gray-300 text-black border-white"
                        type="text"
                        placeholder="Description"
                        value={editableProduct.description || ''}
                        onChange={(e) =>
                          setEditableProduct({ ...editableProduct, description: e.target.value })
                        }
                      />
                      <Input
                        className="bg-gray-300 text-black border-white"
                        type="number"
                        placeholder="Price"
                        value={editableProduct.price || 0}
                        onChange={(e) =>
                          setEditableProduct({ ...editableProduct, price: parseFloat(e.target.value) })
                        }
                      />
                      <Input
                        className="bg-gray-300 text-black border-white"
                        type="number"
                        placeholder="Available Quantity"
                        value={editableProduct.available_quantity || 0}
                        onChange={(e) =>
                          setEditableProduct({
                            ...editableProduct,
                            available_quantity: parseInt(e.target.value),
                          })
                        }
                      />
                      <Input
                        className="bg-gray-300 text-black border-white"
                        type="text"
                        placeholder="Image URL"
                        value={editableProduct.image_url || ''}
                        onChange={(e) =>
                          setEditableProduct({
                            ...editableProduct,
                            image_url: e.target.value,
                          })
                        }
                      />
                      <select
                        value={editableProduct.category || 'biscuits'}
                        onChange={(e) =>
                          setEditableProduct({
                            ...editableProduct,
                            category: e.target.value,
                          })
                        }
                        className="bg-gray-300 text-black border-white p-2"
                      >
                        <option value="biscuits">Biscuits</option>
                        <option value="snacks">Snacks</option>
                        <option value="fast_food">Fast Food</option>
                        <option value="stationary">Stationary Items</option>
                        <option value="electronics">Small Electronics</option>
                      </select>
                      <Button
                        className='bg-blue-300'
                        onClick={() => handleUpdateProduct(editableProduct.id!, editableProduct)}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </div>
    </DashboardLayout>
  );
}
