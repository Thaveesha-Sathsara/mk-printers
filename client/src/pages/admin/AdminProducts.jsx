import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // IMPORT ADDED
import API from '../../utils/api';
import { Package, Plus, Folder, AlertCircle, Image as ImageIcon, Type, CheckCircle } from 'lucide-react';

const Card = ({ children, className = "" }) => <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>{children}</div>;
const CardHeader = ({ children, className = "" }) => <div className={`p-6 border-b border-gray-100 bg-gray-50/50 ${className}`}>{children}</div>;
const CardTitle = ({ children }) => <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">{children}</h3>;
const CardContent = ({ children, className = "" }) => <div className={`p-6 ${className}`}>{children}</div>;

export default function AdminProducts() {
    const navigate = useNavigate(); // HOOK INITIALIZED
    
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [modelFile, setModelFile] = useState(null);
    const [modelFileName, setModelFileName] = useState('');
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [catName, setCatName] = useState('');
    const [catDesc, setCatDesc] = useState('');

    const [prodName, setProdName] = useState('');
    const [prodCat, setProdCat] = useState('');
    const [prodDesc, setProdDesc] = useState('');
    const [prodPrice, setProdPrice] = useState('');
    const [reqImage, setReqImage] = useState(false);
    const [reqText, setReqText] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            const [catRes, prodRes] = await Promise.all([
                API.get('/categories'),
                API.get('/products'),
            ]);
            if (catRes.data.success) setCategories(catRes.data.categories);
            if (prodRes.data.success) setProducts(prodRes.data.products);
        } catch (err) {
            console.error("fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

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

    const handleModelChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setModelFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => setModelFile(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault(); 
        setError(''); 
        setSuccess('');
        
        try {
            await API.post('/categories/create', { name: catName, description: catDesc });
            setSuccess(`Category "${catName}" created successfully!`);
            setCatName(''); setCatDesc('');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create category.');
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault(); 

        if (isSubmitting) return;

        setError(''); 
        setSuccess('');
        
        if (!prodCat) return setError('Please select a category first.');

        setIsSubmitting(true);

        try {
            await API.post('/products/create', {
                name: prodName,
                category: prodCat,
                description: prodDesc,
                basePrice: Number(prodPrice),
                requiresCustomImage: reqImage,
                requiresCustomText: reqText,
                imageBase64: imageFile,
                model3Base64: modelFile
            });
            
            setSuccess(`Product "${prodName}" added to the store! Redirecting...`);
            
            // TIMEOUT REDIRECT ADDED
            setTimeout(() => {
                navigate('/admin/products');
            }, 1500);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create product.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-full p-4 md:p-8 font-sans text-gray-900 flex flex-col relative">

            <div className="max-w-7xl mx-auto w-full mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                    <Package className="h-8 w-8 text-blue-600" /> Inventory Manager
                </h1>
                <p className="text-gray-500 text-sm mt-1">Add product categories and manage the storefront catalog.</p>
            </div>

            <div className="max-w-7xl mx-auto w-full mb-6">
                {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2"><AlertCircle className="h-5 w-5" /> {error}</div>}
                {success && <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium flex items-center gap-2"><CheckCircle className="h-5 w-5"/> {success}</div>}
            </div>

            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 xl:grid-cols-3 gap-8 flex-1">
                <div className="xl:col-span-1 space-y-8">
                    <Card>
                        <CardHeader><CardTitle><Folder className="h-5 w-5 text-purple-600" /> Add Category </CardTitle></CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateCategory} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category Name</label>
                                    <input type="text" required value={catName} onChange={(e) => setCatName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none" placeholder="e.g. Magic Mugs" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                                    <textarea rows="2" value={catDesc} onChange={(e) => setCatDesc(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none" placeholder="Describe this category..."></textarea>
                                </div>
                                <button aria-label="Create Category" type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all shadow-sm flex justify-center items-center gap-2">
                                    <Plus className="h-4 w-4" /> Create Category
                                </button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Active Categories</CardTitle></CardHeader>
                        <ul className="divide-y divide-gray-100">
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

                <div className="xl:col-span-2 space-y-8">
                  <Card>
                    <CardHeader><CardTitle><Package className="h-5 w-5 text-blue-600" /> Add New Product</CardTitle></CardHeader>
                    <CardContent>
                      <form onSubmit={handleCreateProduct} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Name</label>
                            <input type="text" required value={prodName} onChange={(e) => setProdName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. Premium White Mug" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                            <select required value={prodCat} onChange={(e) => setProdCat(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700">
                              <option value="" disabled>Select a category...</option>
                              {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Description</label>
                          <textarea required rows="3" value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Full details about the material, sizing, etc..."></textarea>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Image</label>
                            <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-colors" />
                            {imagePreview && <img src={imagePreview} alt="Preview" className="mt-4 h-32 w-32 object-cover rounded-lg border border-gray-200" />}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                <Package className="h-4 w-4" /> 3D Model (.glb / .gltf)
                            </label>
                            <p className="text-xs text-gray-500 mb-3">Export from Blender as GLB. Name the print material &quot;Print&quot; and UV-unwrap the print faces to 0-1.</p>
                            <input 
                                type="file" 
                                accept=".glb,.gltf,.obj" 
                                onChange={handleModelChange} 
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 transition-colors"
                            />
                            {modelFileName && <span className="text-xs font-bold text-purple-600 mt-2 block">Selected file: {modelFileName}</span>}
                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Base Price (LKR)</label>
                            <div className="relative">
                              <span className="absolute left-4 top-2.5 text-gray-500 font-bold">Rs.</span>
                              <input type="number" required min="0" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="1500" />
                            </div>
                          </div>

                          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col gap-3">
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
                                aria-label="Update Product"
                          type="submit" 
                          disabled={isSubmitting}
                          className={`w-full font-bold py-4 rounded-xl transition-all shadow-md flex justify-center items-center gap-2 mt-4 
                            ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                        >
                          {isSubmitting ? (
                             <span className="animate-pulse">Uploading Image to Server... (Please Wait)</span>
                          ) : (
                             <><Plus className="h-5 w-5"/> Add Product to Store</>
                          )}
                        </button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
            </div>
        </div>
    )
}