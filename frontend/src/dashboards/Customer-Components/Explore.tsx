import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import Button from "../components/ui/button";
import DashboardLayout from "../components/dashboard-layout";

import { Modal } from "../components/ui/modal";
import { Home,ShoppingCart,Bell, ShoppingBag, CreditCard, Heart, Package, MessageSquare } from 'lucide-react';

// Define the Product interface
interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: string;
  available_quantity: number;
  image_url: string | null;
}

export default function Explore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeNavItem, setActiveNavItem] = useState("Explore");
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("1 PM");
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);  // For displaying online payment details
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(`${BACKEND_URL}/api/inventory/`);
        if (!response.ok) {
          throw new Error("Failed to fetch products.");
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }

    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleSubmitOrder = async () => {
    if (!selectedProduct || !paymentMethod) {
      alert("Please select a payment method and quantity.");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/orders/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: 1, // Replace with actual customer ID
          items: [{ item_id: selectedProduct.id, quantity }],
          payment_method: paymentMethod,
          delivery_time: deliveryTime,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order.");
      }

      const data = await response.json();
      console.log("Order created:", data);
      setShowModal(false);
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

const addToWishlist = (productId: number) => {
  fetch(`${BACKEND_URL}/api/wishlist/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customer_id: 1, // Replace with the actual customer ID
      item_id: productId,
    }),
  })
    .then((response) => response.json())
    .then((data) => console.log('Added to wishlist:', data))
    .catch((error) => console.error('Error adding to wishlist:', error));
};
  const paymentMethods = [
    { id: "credit-card", name: "Credit Card", details: "Provide card details at checkout." },
    { id: "easypaisa", name: "EasyPaisa", details: "Send payment to 03XX-XXXXXXX." },
    { id: "jazzcash", name: "JazzCash", details: "Send payment to 03XX-XXXXXXX." },
    { id: "cash-on-delivery", name: "Cash on Delivery", details: "Pay upon delivery." },
  ];

  const handlePaymentMethodChange = (methodId: string) => {
    setPaymentMethod(methodId);
    if (methodId === "credit-card" || methodId === "easypaisa" || methodId === "jazzcash") {
      setShowPaymentInfo(true);
    } else {
      setShowPaymentInfo(false);
    }
  };
  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/customer' },
    { name: 'Explore', icon: ShoppingBag, path: '/customer/explore' },
    { name: 'My Orders and Wishlist', icon: Heart, path: '/customer/orders-wishlist' },
    { name: 'Notifications', icon: Bell, path: '/customer/notifications' },
    { name: 'Send Feedback', icon: MessageSquare, path: '/customer/send-feedback' }
  ];

  return (
    <DashboardLayout
      title="Explore Products"
      navItems={navItems}
      activeNavItem={activeNavItem}
      setActiveNavItem={setActiveNavItem}
      userEmail="john.doe@example.com"
      userInitials="JD"
    >
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <Card key={product.id} className="shadow-md bg-teal-300 hover:bg-cyan-400">
            <CardHeader>
              <img
                src={product.image_url || "/placeholder-image.png"}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg font-bold">{product.name}</CardTitle>
              <p className="text-sm text-gray-600">Category: {product.category}</p>
              <p className="text-sm text-gray-600">Product #: {product.id}</p>
              <p className="text-sm text-gray-600 mt-1">{product.description}</p>
              <p className="text-lg font-bold mt-2 text-green-600">Price: ${Number(product.price).toFixed(2)}</p>
              <p className="text-sm text-gray-600">Available: {product.available_quantity}</p>
              <div className="mt-4 flex justify-between">
                <Button  onClick={() => handleAddToCart(product)}>
                  <ShoppingCart className="mr-2 h-4 w-4 px-0" />
                  Add to Cart
                </Button>
                <Button onClick={() => addToWishlist(product.id)} className="bg-green-500 hover:bg-green-500 border-green-400 p-0">
                  <Heart className="mr-2 h-4 w-4" />
                  Wishlist
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div>
            <h2 className="text-xl font-bold">Select Quantity & Payment Method</h2>
            <div className="mt-4">
              <label htmlFor="quantity" className="block text-sm font-semibold">Quantity:</label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="1"
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-semibold">Payment Method:</label>
              {paymentMethods.map((method) => (
                <div key={method.id}>
                  <input
                    type="radio"
                    id={method.id}
                    name="paymentMethod"
                    value={method.id}
                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                  />
                  <label htmlFor={method.id} className="ml-2">{method.name}</label>
                  <p className="text-sm text-gray-500">{method.details}</p>
                </div>
              ))}
            </div>
            {showPaymentInfo && (
              <div className="mt-4 bg-gray-200 p-4 rounded">
                <h3 className="text-lg font-semibold">Payment Instructions</h3>
                {paymentMethod === "credit-card" && <p>Enter your credit card number at checkout.</p>}
                {paymentMethod === "easypaisa" && <p>Send payment to 03XX-XXXXXXX via EasyPaisa.</p>}
                {paymentMethod === "jazzcash" && <p>Send payment to 03XX-XXXXXXX via JazzCash.</p>}
              </div>
            )}
            <div className="mt-4">
              <label htmlFor="delivery-time" className="block text-sm font-semibold">Delivery Time:</label>
              <select
                id="delivery-time"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="1 PM">1 PM</option>
                <option value="5 PM">5 PM</option>
              </select>
            </div>
            <div className="mt-4">
              <Button onClick={handleSubmitOrder}>Submit Order</Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
