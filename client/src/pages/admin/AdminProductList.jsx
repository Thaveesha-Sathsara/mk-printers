import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import { Package, Plus, Edit, Trash2, Image as ImageIcon, ToggleLeft, ToggleRight } from 'lucide-react';

export default function AdminProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await API.get('/products');
      if (res.data.success) setProducts(res.data.products);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await API.delete(`/products/delete/${id}`);
      fetchProducts();
    } catch (err) { alert('Failed to delete product.', err); }
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      await API.put(`/products/update/${id}`, { isAvailable: !currentStatus });
      fetchProducts(); // Refresh list
    } catch (err) { alert('Failed to update status.', err); }
  };

  return (
    <div className="p-4 md:p-8 font-sans text-gray-900 max-w-7xl mx-auto w-full">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" /> Product Catalog
          </h1>
          <p className="text-gray-500 mt-1">Manage your inventory, pricing, and availability.</p>
        </div>
        <Link to="/admin/products/new" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-md">
          <Plus className="h-5 w-5"/> Add New Product
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-semibold w-20">Image</th>
                <th className="p-4 font-semibold">Product Name</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Customizer</th>
                <th className="p-4 font-semibold text-center">In Stock</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-400">Loading catalog...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No products found. Click 'Add New Product' to start.</td></tr>
              ) : (
                products.map(prod => (
                  <tr key={prod._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      {prod.images && prod.images.length > 0 ? (
                        <img src={prod.images[0]} alt={prod.name} className="h-12 w-12 object-cover rounded-lg border border-gray-200" />
                      ) : (
                        <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border border-gray-200"><ImageIcon className="h-5 w-5"/></div>
                      )}
                    </td>
                    <td className="p-4 font-bold text-gray-900">{prod.name}</td>
                    <td className="p-4 text-gray-500">{prod.category?.name || 'Uncategorized'}</td>
                    <td className="p-4 font-semibold text-green-600">Rs. {prod.basePrice}</td>
                    <td className="p-4 text-gray-500 text-xs">
                      {prod.requiresCustomImage && <span className="block">✅ Image</span>}
                      {prod.requiresCustomText && <span className="block">✅ Text</span>}
                      {!prod.requiresCustomImage && !prod.requiresCustomText && <span className="text-gray-400">None</span>}
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => toggleAvailability(prod._id, prod.isAvailable)} className={`p-1 rounded-full transition-colors ${prod.isAvailable ? 'text-green-500' : 'text-gray-400'}`}>
                        {prod.isAvailable ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8" />}
                      </button>
                    </td>
                    <td className="p-4 text-right flex items-center justify-end gap-2 h-full mt-2">
                      <button className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(prod._id, prod.name)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}