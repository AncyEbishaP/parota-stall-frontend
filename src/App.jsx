import React, { useState, useEffect } from 'react';

// API Base URL
const API_URL = 'http://localhost:5000/api';

// Menu items organized by categories with actual prices from your menu
const MENU_CATEGORIES = {
  'Kothu Parotta': {
    'Veg Kothu Parotta': 90,
    'Egg Kothu Parotta': 100,
    'Chicken Kothu Parotta': 130,
    'Mutton Kothu Parotta': 230
  },
  'Sweet Parotta': {
    'Milk Maid Parotta': 99,
    'Oreo Parotta': 99,
    'Milo Parotta': 70,
    'Boost Parotta': 60,
    'Banana Parotta': 80,
    'Nut Kat Parotta': 110,
    'Chocolate Parotta': 110,
    'Coconut Sweet Parotta': 120
  },
  'Kizhi Parotta': {
    'Veg Kizhi Parotta': 120,
    'Chicken Kizhi Parotta': 175,
    'Chicken 65 Kizhi Parotta': 210,
    'Mutton Kizhi Parotta': 250
  },
  'Ceylon Parotto': {
    'Egg Ceylon Parotta': 60,
    'Chicken Ceylon Parotta': 99
  },
  'Kalaki Parotto': {
    'Egg Kalaki Parotta': 90,
    'Chicken Kalaki Parotta': 140
  },
  'Lappa Parotta': {
    'Egg Lappa Parotto': 80,
    'Chicken Lappa Parotto': 120
  },
  'Plain Parotta': {
    'Plain Parotta': 50,
    'Wheat Parotta': 45,
    'Poricha Parotta': 70,
    'Madurai Bun Parotta': 70,
    'Nool Parotta': 60
  },
  'Vecchu Parotta': {
    'Plain Vecchu Parotta': 60,
    'Egg Vecchu Parotta': 80
  },
  'Dosai': {
    'Plain Dosai': 50,
    'Pooli Dosai': 60,
    'Ghee Dosai': 60,
    'Ghee Pooli Dosai': 70,
    'Set Dosai': 99,
    'Egg Dosai': 60,
    'Chettinad Dosai': 69,
    'Chicken Kari Dosai': 100,
    'Chicken Keema Dosai': 140,
    'Schezwan C Dosai': 100,
    'Mutton Kari Dosai': 150,
    'Mutton Keema Dosai': 210,
    'Botti Dosai': 210
  },
  'Starters': {
    'Chicken Bone Less 65': 120,
    'Chicken Lollipop': 120,
    'Chicken Kola Urundai 3 Pcs': 120,
    'Chicken Kola Urundai 5 Pcs': 230,
    'Poodimas': 40,
    'Half Boil': 15,
    'Valiyal': 20,
    'Omelette': 25,
    'Double Omelette': 45,
    'Double Kalaki': 35,
    'Kalaki': 20,
    'Onion Kalaki': 25,
    'Chicken Kalaki': 80
  },
  'Gravy Varieties': {
    'Chicken Chettinad Gravy': 199,
    'Pepper Chicken Gravy': 130,
    'Chicken Keema Curry': 120,
    'Chicken Chops': 180,
    'Liver Fry': 80,
    'Mutton Keema Curry': 210,
    'Botti Curry': 220
  },
  'Murtabak': {
    'Chicken Murtabak': 120
  },
  'Uthappam': {
    'Plain Uthappam': 30,
    'Onion Uthappam': 40,
    'Tomato Uthappam': 40,
    'Madhurii Uthappam': 85,
    'Plain Schezwan Uthappam': 60,
    'Schezwan Garlic Dosai': 60,
    'Chocolate Dosai': 70
  }
};

// Flatten all items into a single object for easier access
const ALL_ITEMS = {};
Object.values(MENU_CATEGORIES).forEach(category => {
  Object.assign(ALL_ITEMS, category);
});

// Order Form Component
const OrderForm = ({ onAddOrder, loading }) => {
  const [items, setItems] = useState({});
  const [orderType, setOrderType] = useState('Dine-in');
  const [paymentType, setPaymentType] = useState('Cash');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Main categories with icons and combined parotta items
  const MAIN_CATEGORIES = {
    'Parotta': {
      icon: '🍽️',
      color: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
      items: {
        ...MENU_CATEGORIES['Kothu Parotta'],
        ...MENU_CATEGORIES['Sweet Parotta'],
        ...MENU_CATEGORIES['Kizhi Parotta'],
        ...MENU_CATEGORIES['Ceylon Parotto'],
        ...MENU_CATEGORIES['Kalaki Parotto'],
        ...MENU_CATEGORIES['Lappa Parotta'],
        ...MENU_CATEGORIES['Plain Parotta'],
        ...MENU_CATEGORIES['Vecchu Parotta']
      }
    },
    'Dosai': {
      icon: '🥞',
      color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      items: {
        ...MENU_CATEGORIES['Dosai'],
        ...MENU_CATEGORIES['Uthappam']
      }
    },
    'Starters': {
      icon: '🍗',
      color: 'bg-red-100 text-red-800 hover:bg-red-200',
      items: MENU_CATEGORIES['Starters']
    },
    'Gravy & Curry': {
      icon: '🍛',
      color: 'bg-green-100 text-green-800 hover:bg-green-200',
      items: {
        ...MENU_CATEGORIES['Gravy Varieties'],
        ...MENU_CATEGORIES['Murtabak']
      }
    }
  };

  const handleItemChange = (itemName, change) => {
    setItems(prev => ({
      ...prev,
      [itemName]: Math.max(0, (prev[itemName] || 0) + change)
    }));
  };

  const calculateTotal = () => {
    return Object.entries(items).reduce((total, [itemName, quantity]) => {
      return total + (quantity * (ALL_ITEMS[itemName] || 0));
    }, 0);
  };

  const handleSubmit = async () => {
    const orderItems = Object.entries(items).filter(([_, quantity]) => quantity > 0);
    
    if (orderItems.length === 0) {
      alert('Please add at least one item to the order!');
      return;
    }

    const order = {
      items: Object.fromEntries(orderItems),
      orderType,
      paymentType,
      total: calculateTotal()
    };

    await onAddOrder(order);
    
    // Reset form
    setItems({});
    setExpandedCategory(null);
  };

  const handleCategoryClick = (categoryName) => {
    if (expandedCategory === categoryName) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryName);
      setSearchTerm('');
    }
  };

  const getFilteredItems = () => {
    if (searchTerm) {
      return Object.fromEntries(
        Object.entries(ALL_ITEMS).filter(([name]) => 
          name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    if (expandedCategory && MAIN_CATEGORIES[expandedCategory]) {
      return MAIN_CATEGORIES[expandedCategory].items;
    }
    
    return {};
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">New Order</h2>
      
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {!searchTerm && (
        <>
          {/* Main Category Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {Object.entries(MAIN_CATEGORIES).map(([categoryName, categoryData]) => (
              <button
                key={categoryName}
                onClick={() => handleCategoryClick(categoryName)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  expandedCategory === categoryName
                    ? 'border-blue-500 bg-blue-50 transform scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                } ${categoryData.color}`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{categoryData.icon}</div>
                  <div className="font-semibold">{categoryName}</div>
                  <div className="text-xs mt-1">
                    {Object.keys(categoryData.items).length} items
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {/* Category Header when expanded */}
          {expandedCategory && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center">
                  <span className="text-2xl mr-2">{MAIN_CATEGORIES[expandedCategory].icon}</span>
                  {expandedCategory} Menu
                </h3>
                <button
                  onClick={() => setExpandedCategory(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Items Display */}
      {(searchTerm || expandedCategory) && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6 max-h-96 overflow-y-auto">
          {Object.entries(getFilteredItems()).map(([itemName, price]) => {
            const quantity = items[itemName] || 0;
            
            return (
              <div key={itemName} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                <div className="text-center mb-2">
                  <h3 className="font-semibold text-sm">{itemName}</h3>
                  <p className="text-sm text-gray-600">₹{price}</p>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => handleItemChange(itemName, -1)}
                    className="bg-red-500 text-white w-7 h-7 rounded-full hover:bg-red-600 transition-colors text-sm"
                    disabled={quantity === 0}
                  >
                    -
                  </button>
                  <span className="text-sm font-bold w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => handleItemChange(itemName, 1)}
                    className="bg-green-500 text-white w-7 h-7 rounded-full hover:bg-green-600 transition-colors text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!searchTerm && !expandedCategory && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2"></div>
          <p>Select a category above to view items</p>
        </div>
      )}

      {/* Order Type and Payment Type */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Order Type</label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Dine-in">Dine-in</option>
            <option value="Take-away">Take-away</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Payment Type</label>
          <select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
          </select>
        </div>
      </div>

      {/* Total and Submit */}
      <div className="flex justify-between items-center">
        <div className="text-xl font-bold text-gray-800">
          Total: ₹{calculateTotal()}
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:bg-gray-400"
        >
          {loading ? 'Adding...' : 'Add Order'}
        </button>
      </div>
    </div>
  );
};

// Orders List Component
const OrdersList = ({ orders, onMarkDelivered, loading }) => {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Active Orders</h2>
        <p className="text-gray-500 text-center py-8">No active orders</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Active Orders ({orders.length})</h2>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order._id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg">Order #{order.orderNumber}</h3>
                <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleTimeString()}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  order.orderType === 'Dine-in' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {order.orderType}
                </span>
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                  order.paymentType === 'Cash' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {order.paymentType}
                </span>
              </div>
            </div>
            
            <div className="mb-3">
              <h4 className="font-semibold mb-2">Items:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(order.items).map(([item, quantity]) => (
                  <span key={item} className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {item} × {quantity}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="font-bold text-lg">Total: ₹{order.total}</div>
              <button
                onClick={() => onMarkDelivered(order._id)}
                disabled={loading}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Processing...' : 'Mark as Delivered ✅'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Today's Summary</h2>
        <p className="text-center text-gray-500">Loading statistics...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Today's Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <h3 className="text-lg font-semibold text-blue-800">Total Orders</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <h3 className="text-lg font-semibold text-green-800">Cash Collection</h3>
          <p className="text-3xl font-bold text-green-600">₹{stats.cashTotal}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <h3 className="text-lg font-semibold text-purple-800">UPI Collection</h3>
          <p className="text-3xl font-bold text-purple-600">₹{stats.upiTotal}</p>
        </div>
      </div>
      <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-gray-800">Total Revenue</h3>
        <p className="text-3xl font-bold text-gray-600">₹{stats.totalRevenue}</p>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [activeOrders, setActiveOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    cashTotal: 0,
    upiTotal: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch active orders
  const fetchActiveOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/active`);
      const data = await response.json();
      setActiveOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to fetch orders. Make sure backend is running on port 5000.');
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch(`${API_URL}/stats/today`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchActiveOrders();
    fetchStats();
  }, []);

  // Add new order
  const handleAddOrder = async (order) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });
      
      if (response.ok) {
        await fetchActiveOrders();
        await fetchStats();
        alert('Order added successfully!');
      } else {
        alert('Failed to add order. Please try again.');
      }
    } catch (error) {
      console.error('Error adding order:', error);
      alert('Failed to add order. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Mark order as delivered
  const handleMarkDelivered = async (orderId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'delivered' }),
      });
      
      if (response.ok) {
        await fetchActiveOrders();
        await fetchStats();
        alert('Order marked as delivered!');
      } else {
        alert('Failed to update order. Please try again.');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Then Madurai Parotta Kadai
        </h1>
        
        <Dashboard stats={stats} loading={statsLoading} />
        <OrderForm onAddOrder={handleAddOrder} loading={loading} />
        <OrdersList orders={activeOrders} onMarkDelivered={handleMarkDelivered} loading={loading} />
      </div>
    </div>
  );
};

export default App;