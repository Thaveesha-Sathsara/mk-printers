import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import { Folder, Plus, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const Card = ({ children, className = "" }) => <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>{children}</div>;
const CardHeader = ({ children, className = "" }) => <div className={`p-6 border-b border-gray-100 bg-gray-50/50 ${className}`}>{children}</div>;
const CardTitle = ({ children }) => <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">{children}</h3>;
const CardContent = ({ children, className = "" }) => <div className={`p-6 ${className}`}>{children}</div>;

export default function AdminCategoryNew() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [catName, setCatName] = useState('');
    const [catDesc, setCatDesc] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchCategories = async () => {
        try {
            const res = await API.get('/categories');
            if (res.data.success) setCategories(res.data.categories);
        } catch (err) {
            console.error("fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleCreateCategory = async (e) => {
        e.preventDefault(); 
        setError(''); 
        setSuccess('');
        setIsSubmitting(true);
        
        try {
            await API.post('/categories/create', { name: catName, description: catDesc });
            setSuccess(`Category "${catName}" created successfully!`);
            setCatName(''); setCatDesc('');
            fetchCategories(); // Refresh the list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create category.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-full p-4 md:p-8 font-sans text-gray-900 max-w-5xl mx-auto">
            
            <Link to="/admin/products/new" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-medium transition-colors w-fit">
                <ArrowLeft className="h-4 w-4" /> Back to Add Product
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                    <Folder className="h-8 w-8 text-purple-600" /> Category Manager
                </h1>
                <p className="text-gray-500 text-sm mt-1">Organize your storefront by adding new product categories.</p>
            </div>

            {error && <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2"><AlertCircle className="h-5 w-5" /> {error}</div>}
            {success && <div className="p-4 mb-6 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium flex items-center gap-2"><CheckCircle className="h-5 w-5"/> {success}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Add Category Form */}
                <Card className="h-fit">
                    <CardHeader><CardTitle><Plus className="h-5 w-5 text-purple-600" /> Create New</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateCategory} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category Name</label>
                                <input type="text" required value={catName} onChange={(e) => setCatName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none" placeholder="e.g. Magic Mugs" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description (Optional)</label>
                                <textarea rows="3" value={catDesc} onChange={(e) => setCatDesc(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none" placeholder="Describe this category..."></textarea>
                            </div>
                            <button type="submit" disabled={isSubmitting} className={`w-full font-bold py-3.5 rounded-xl transition-all shadow-sm flex justify-center items-center gap-2 ${isSubmitting ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}>
                                {isSubmitting ? 'Creating...' : 'Create Category'}
                            </button>
                        </form>
                    </CardContent>
                </Card>

                {/* Existing Categories List */}
                <Card>
                    <CardHeader><CardTitle>Active Categories</CardTitle></CardHeader>
                    <ul className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                        {loading ? <li className="p-6 text-center text-gray-400 animate-pulse">Loading...</li> : 
                        categories.length === 0 ? <li className="p-6 text-center text-gray-500 text-sm">No categories yet.</li> :
                        categories.map(cat => (
                        <li key={cat._id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                            <div>
                                <p className="font-bold text-gray-900">{cat.name}</p>
                                <p className="text-xs text-gray-400 font-mono">/{cat.slug}</p>
                            </div>
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">Active</span>
                        </li>
                        ))}
                    </ul>
                </Card>

            </div>
        </div>
    );
}