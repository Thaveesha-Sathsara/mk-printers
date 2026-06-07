import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../utils/api';
import { Save, ArrowLeft, AlertCircle, CheckCircle, Image as ImageIcon, Type, Layers } from 'lucide-react';

const Card = ({ children, className = "" }) => <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>{children}</div>;
const CardHeader = ({ children, className = "" }) => <div className={`p-6 border-b border-gray-100 bg-gray-50/50 ${className}`}>{children}</div>;
const CardTitle = ({ children }) => <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">{children}</h3>;
const CardContent = ({ children, className = "" }) => <div className={`p-6 ${className}`}>{children}</div>;

export default function AdminProductEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Product State
    const [prodName, setProdName] = useState('');
    const [prodCat, setProdCat] = useState('');
    const [prodDesc, setProdDesc] = useState('');
    const [prodPrice, setProdPrice] = useState('');
    const [reqImage, setReqImage] = useState(false);
    const [reqText, setReqText] = useState(false);
    
    // Image States
    const [imageFile, setImageFile] = useState(null); // New uploaded main image
    const [imagePreview, setImagePreview] = useState(''); // Current or preview main image
    const [overlayFile, setOverlayFile] = useState(null); // New uploaded mask
    const [overlayPreview, setOverlayPreview] = useState(''); // Current or preview mask
    
    // UI State
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Product & Categories
    // Fetch Product & Categories
    useEffect(() => {
        const fetchData = async () => {
            // 1. Fetch Categories First (Independently)
            try {
                const catRes = await API.get('/categories');
                if (catRes.data.success) {
                    setCategories(catRes.data.categories);
                }
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            }

            // 2. Fetch Product Data
            try {
                // Try to get the specific product (adjust this endpoint to match your backend)
                const prodRes = await API.get(`/products/${id}`); 
                
                if (prodRes.data.success) {
                    const p = prodRes.data.product;
                    setProdName(p.name);
                    setProdCat(p.category?._id || p.category);
                    setProdDesc(p.description);
                    setProdPrice(p.basePrice);
                    setReqImage(p.requiresCustomImage);
                    setReqText(p.requiresCustomText);
                    if (p.images && p.images.length > 0) setImagePreview(p.images[0]);
                    if (p.overlayUrl) setOverlayPreview(p.overlayUrl);
                }
            } catch (err) {
                // Fallback: If the above endpoint fails, grab all products and find the right one
                try {
                    const fallbackRes = await API.get(`/products`);
                    const foundProd = fallbackRes.data.products.find(p => p._id === id);
                    if (foundProd) {
                        setProdName(foundProd.name);
                        setProdCat(foundProd.category?._id || foundProd.category);
                        setProdDesc(foundProd.description);
                        setProdPrice(foundProd.basePrice);
                        setReqImage(foundProd.requiresCustomImage);
                        setReqText(foundProd.requiresCustomText);
                        if (foundProd.images?.length > 0) setImagePreview(foundProd.images[0]);
                        if (foundProd.overlayUrl) setOverlayPreview(foundProd.overlayUrl);
                    } else {
                        setError('Product not found.');
                    }
                } catch (fallbackErr) {
                    setError('Failed to load product data.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Handle Main Image Convert
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageFile(reader.result); 
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle Overlay Mask Convert
    const handleOverlayChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setOverlayFile(reader.result); 
                setOverlayPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault(); 
        if (isSubmitting) return;

        setError(''); setSuccess('');
        setIsSubmitting(true);

        try {
            // Build payload. Only send images if they were changed to save bandwidth
            const payload = {
                name: prodName,
                category: prodCat,
                description: prodDesc,
                basePrice: Number(prodPrice),
                requiresCustomImage: reqImage,
                requiresCustomText: reqText,
            };

            if (imageFile) payload.imageBase64 = imageFile;
            if (overlayFile) payload.overlayBase64 = overlayFile;

            await API.put(`/products/update/${id}`, payload);
            
            setSuccess(`Product updated successfully! Redirecting...`);
            
            setTimeout(() => {
                navigate('/admin/products');
            }, 1500);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update product.');
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 font-medium animate-pulse">Loading product details...</div>;

    return (
        <div className="min-h-full p-4 md:p-8 font-sans text-gray-900 max-w-4xl mx-auto">
            <Link to="/admin/products" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-medium transition-colors w-fit">
                <ArrowLeft className="h-4 w-4" /> Back to Inventory
            </Link>

            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Edit Product</h1>
                <p className="text-gray-500 text-sm mt-1">Update details, pricing, and customizer settings.</p>
            </div>

            {error && <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2"><AlertCircle className="h-5 w-5" /> {error}</div>}
            {success && <div className="p-4 mb-6 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium flex items-center gap-2"><CheckCircle className="h-5 w-5"/> {success}</div>}

            <Card>
                <CardHeader><CardTitle><Save className="h-5 w-5 text-blue-600" /> Product Information</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdateProduct} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Name</label>
                                <input type="text" required value={prodName} onChange={(e) => setProdName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                                <select required value={prodCat} onChange={(e) => setProdCat(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                                    <option value="" disabled>Select a category...</option>
                                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Description</label>
                            <textarea required rows="4" value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"></textarea>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Main Product Image */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><ImageIcon className="h-4 w-4"/> Main Image</label>
                                <p className="text-xs text-gray-500 mb-3">Upload a new image to replace the current one.</p>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-colors mb-4" />
                                {imagePreview && <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded-lg border border-gray-300 shadow-sm" />}
                            </div>

                            {/* Product Overlay (The Mug Mask) */}
                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                <label className="block text-sm font-semibold text-purple-900 mb-1.5 flex items-center gap-2"><Layers className="h-4 w-4"/> Customizer Overlay (Mask)</label>
                                <p className="text-xs text-purple-700 mb-3">Optional: Upload a transparent PNG mask to make the customizer look realistic.</p>
                                <input type="file" accept="image/png" onChange={handleOverlayChange} className="block w-full text-sm text-purple-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 transition-colors mb-4" />
                                {overlayPreview && <img src={overlayPreview} alt="Overlay Preview" className="h-32 w-32 object-contain bg-white rounded-lg border border-purple-200 shadow-sm p-2" />}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Base Price (LKR)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-2.5 text-gray-500 font-bold">Rs.</span>
                                    <input type="number" required min="0" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col gap-3">
                                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Customizer Settings</span>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={reqImage} onChange={(e) => setReqImage(e.target.checked)} className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5"><ImageIcon className="h-4 w-4 text-gray-400"/> Allows Image Upload</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={reqText} onChange={(e) => setReqText(e.target.checked)} className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5"><Type className="h-4 w-4 text-gray-400"/> Allows Custom Text</span>
                                </label>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={`w-full font-bold py-4 rounded-xl transition-all shadow-md flex justify-center items-center gap-2 mt-8 
                            ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                        >
                            {isSubmitting ? (
                                <span className="animate-pulse">Saving Changes...</span>
                            ) : (
                                <><Save className="h-5 w-5"/> Update Product</>
                            )}
                        </button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}