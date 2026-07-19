import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import API from '../../utils/api';
import { Package, Save, AlertCircle, Image as ImageIcon, Type, CheckCircle, X, Palette, Ruler, PlusCircle, Trash2, ArrowLeft } from 'lucide-react';

const Card = ({ children, className = "" }) => <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>{children}</div>;
const CardHeader = ({ children, className = "" }) => <div className={`p-6 border-b border-gray-100 bg-gray-50/50 ${className}`}>{children}</div>;
const CardTitle = ({ children }) => <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">{children}</h3>;
const CardContent = ({ children, className = "" }) => <div className={`p-6 ${className}`}>{children}</div>;

const STANDARD_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#EAB308', '#22C55E', '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#A855F7', '#EC4899', '#000000', '#FFFFFF', '#9CA3AF'];

export default function AdminProductEdit() {
    const navigate = useNavigate();
    const { id } = useParams();
    
    // basic info
    const [prodName, setProdName] = useState('');
    const [prodCat, setProdCat] = useState('');
    const [prodDept, setProdDept] = useState('General');
    const [prodDesc, setProdDesc] = useState('');
    const [prodPrice, setProdPrice] = useState('');
    const [reqImage, setReqImage] = useState(false);
    const [reqText, setReqText] = useState(false);
    
    // images and 3d models
    const [mainImages, setMainImages] = useState([]); 
    const [modelFile, setModelFile] = useState(null);
    const [modelFileName, setModelFileName] = useState('');

    // variants
    const [colors, setColors] = useState([]); 
    const [sizes, setSizes] = useState([]); 
    const [customVariants, setCustomVariants] = useState([]); 
    
    // UI states
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showColorModal, setShowColorModal] = useState(false);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // fetch categories
                const catRes = await API.get('/categories');
                if (catRes.data.success) setCategories(catRes.data.categories);

                // 2. Fetch the specific product to edit
                const prodRes = await API.get('/products'); // Assuming your get by ID route isn't set up, filtering from all
                if (prodRes.data.success) {
                    const p = prodRes.data.products.find(prod => prod._id === id);
                    if (p) {
                        // Pre-fill all the form fields
                        setProdName(p.name);
                        setProdCat(p.category?._id || p.category);
                        setProdDept(p.department || 'General');
                        setProdDesc(p.description);
                        setProdPrice(p.basePrice);
                        setReqImage(p.requiresCustomImage);
                        setReqText(p.requiresCustomText);
                        
                        setMainImages(p.images || []);
                        setColors(p.colors || []);
                        setSizes(p.sizes || []);
                        setCustomVariants(p.customVariants || []);
                        
                        if (p.model3dUrl) setModelFileName('Existing 3D Model Loaded');
                    } else {
                        setError('Product not found.');
                    }
                }
            } catch (err) {
                setError('Failed to load data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [id]);

    // --- File Handlers ---
    const handleMainImages = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => setMainImages(prev => [...prev, reader.result]);
            reader.readAsDataURL(file);
        });
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

    const handleVariantImage = (e, type, index, cvIndex = null) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result;
            if (type === 'color') {
                const newColors = [...colors];
                newColors[index].imageBase64 = base64;
                setColors(newColors);
            } else if (type === 'size') {
                const newSizes = [...sizes];
                newSizes[index].imageBase64 = base64;
                setSizes(newSizes);
            } else if (type === 'custom') {
                const newCV = [...customVariants];
                newCV[cvIndex].options[index].imageBase64 = base64;
                setCustomVariants(newCV);
            }
        };
        reader.readAsDataURL(file);
    };

    // --- Variant Generators ---
    const addColor = (hex) => {
        if (!colors.find(c => c.value === hex)) setColors([...colors, { value: hex, price: '', imageBase64: '' }]);
    };

    const addSize = () => setSizes([...sizes, { value: '', price: '', imageBase64: '' }]);
    const addCustomVariantTitle = () => {
        if (customVariants.length >= 10) return alert("Maximum 10 custom variant categories allowed.");
        setCustomVariants([...customVariants, { title: '', options: [] }]);
    };
    const addCustomVariantOption = (cvIndex) => {
        const newCV = [...customVariants];
        newCV[cvIndex].options.push({ value: '', price: '', imageBase64: '' });
        setCustomVariants(newCV);
    };

    // --- Submit Edit (PUT Request) ---
    const handleUpdateProduct = async (e) => {
        e.preventDefault(); 
        if (isSubmitting) return;
        if (!prodCat) return setError('Please select a category first.');

        setIsSubmitting(true);
        setError(''); setSuccess('');

        try {
            await API.put(`/products/update/${id}`, {
                name: prodName, category: prodCat, department: prodDept, description: prodDesc,
                basePrice: Number(prodPrice), requiresCustomImage: reqImage, requiresCustomText: reqText,
                mainImagesBase64: mainImages, model3Base64: modelFile,
                colors, sizes, customVariants
            });
            
            setSuccess(`Product "${prodName}" updated successfully!`);
            setTimeout(() => navigate('/admin/products'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update product.');
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse text-gray-500 font-bold">Loading Product Data...</div>;

    return (
        <div className="min-h-full p-4 md:p-8 font-sans text-gray-900 pb-24">
            {/* Top Navigation */}
            <div className="max-w-5xl mx-auto flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3"><Save className="h-8 w-8 text-blue-600" /> Edit Product</h1>
                    <p className="text-gray-500 mt-1">Update details, images, pricing, and variations.</p>
                </div>
                <Link to="/admin/products" className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-xl transition-all text-sm flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Catalog
                </Link>
            </div>

            {error && <div className="max-w-5xl mx-auto p-4 mb-6 bg-red-50 text-red-700 rounded-xl flex items-center gap-2"><AlertCircle className="h-5 w-5" /> {error}</div>}
            {success && <div className="max-w-5xl mx-auto p-4 mb-6 bg-green-50 text-green-700 rounded-xl flex items-center gap-2"><CheckCircle className="h-5 w-5"/> {success}</div>}

            <form onSubmit={handleUpdateProduct} className="max-w-5xl mx-auto space-y-8">
                
                {/* 1. BASIC INFO */}
                <Card>
                    <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Product Name</label>
                                <input type="text" required value={prodName} onChange={(e) => setProdName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Base Price (LKR)</label>
                                <input type="number" required min="0" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Category</label>
                                <select required value={prodCat} onChange={(e) => setProdCat(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                                    <option value="" disabled>Select category...</option>
                                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Department</label>
                                <select required value={prodDept} onChange={(e) => setProdDept(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                                    <option value="General">General / Other</option>
                                    <option value="Home Decor">Home Decor</option>
                                    <option value="Business Essentials">Business Essentials</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex justify-between">
                                Description <span className="text-gray-400 font-normal">{prodDesc.length}/5000</span>
                            </label>
                            <textarea required rows="4" maxLength="5000" value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"></textarea>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. MEDIA (Images & 3D) */}
                <Card>
                    <CardHeader><CardTitle>Product Media</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2"><ImageIcon className="h-4 w-4"/> Main Product Images</label>
                            <input type="file" multiple accept="image/*" onChange={handleMainImages} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            {mainImages.length > 0 && (
                                <div className="flex flex-wrap gap-4 mt-4">
                                    {mainImages.map((img, idx) => (
                                        <div key={idx} className="relative group">
                                            <img src={img} alt="preview" className="h-24 w-24 object-cover rounded-xl border border-gray-200" />
                                            <button type="button" onClick={() => setMainImages(mainImages.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3"/></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2"><Package className="h-4 w-4" /> 3D Model (.glb / .gltf) - Optional</label>
                            <input type="file" accept=".glb,.gltf,.obj" onChange={handleModelChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                            {modelFileName && <span className="text-xs font-bold text-purple-600 mt-2 block">{modelFileName}</span>}
                        </div>
                    </CardContent>
                </Card>

                {/* 3. VARIATIONS MATRIX */}
                <Card>
                    <CardHeader><CardTitle>Variations & Options</CardTitle></CardHeader>
                    <CardContent className="space-y-8">
                        
                        {/* COLORS */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-gray-900 flex items-center gap-2"><Palette className="h-5 w-5 text-pink-500"/> Colors</h4>
                                <button type="button" onClick={() => setShowColorModal(true)} className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-bold transition-colors">Add Colors</button>
                            </div>
                            <div className="space-y-3">
                                {colors.map((color, idx) => (
                                    <div key={idx} className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                                        <div className="h-8 w-8 rounded-full border border-gray-300 shadow-inner shrink-0" style={{ backgroundColor: color.value }} />
                                        <input type="number" placeholder="Specific Price (Optional)" value={color.price || ''} onChange={(e) => { const newC = [...colors]; newC[idx].price = e.target.value; setColors(newC); }} className="flex-1 min-w-[150px] px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                                        <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-gray-200 shrink-0">
                                            {(color.imageBase64 || color.image) && <img src={color.imageBase64 || color.image} alt="var" className="h-6 w-6 rounded object-cover" />}
                                            <input type="file" accept="image/*" onChange={(e) => handleVariantImage(e, 'color', idx)} className="text-[10px] w-48 text-gray-500 file:hidden" />
                                        </div>
                                        <button type="button" onClick={() => setColors(colors.filter((_, i) => i !== idx))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4"/></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SIZES */}
                        <div className="pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-gray-900 flex items-center gap-2"><Ruler className="h-5 w-5 text-green-500"/> Sizes</h4>
                                <button type="button" onClick={addSize} className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-bold transition-colors">Add Size</button>
                            </div>
                            <div className="space-y-3">
                                {sizes.map((size, idx) => (
                                    <div key={idx} className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                                        <input type="text" placeholder="e.g. XL, 10x10" required value={size.value || ''} onChange={(e) => { const newS = [...sizes]; newS[idx].value = e.target.value; setSizes(newS); }} className="flex-1 min-w-[120px] px-3 py-2 bg-white border border-gray-200 rounded-lg font-bold uppercase" />
                                        <input type="number" placeholder="Price (Opt)" value={size.price || ''} onChange={(e) => { const newS = [...sizes]; newS[idx].price = e.target.value; setSizes(newS); }} className="flex-1 min-w-[120px] px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" />
                                        <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-gray-200 shrink-0">
                                            {(size.imageBase64 || size.image) && <img src={size.imageBase64 || size.image} alt="var" className="h-6 w-6 rounded object-cover" />}
                                            <input type="file" accept="image/*" onChange={(e) => handleVariantImage(e, 'size', idx)} className="text-[10px] w-48 text-gray-500 file:hidden" />
                                        </div>
                                        <button type="button" onClick={() => setSizes(sizes.filter((_, i) => i !== idx))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4"/></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CUSTOM VARIANTS */}
                        <div className="pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-gray-900 flex items-center gap-2"><PlusCircle className="h-5 w-5 text-indigo-500"/> Custom Attributes</h4>
                                <button type="button" onClick={addCustomVariantTitle} className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-bold transition-colors">Add Attribute</button>
                            </div>
                            <div className="space-y-6">
                                {customVariants.map((cv, cvIdx) => (
                                    <div key={cvIdx} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <div className="flex gap-3 mb-4">
                                            <input type="text" placeholder="Attribute Title (e.g. Wattage, Material)" required value={cv.title} onChange={(e) => { const newCV = [...customVariants]; newCV[cvIdx].title = e.target.value; setCustomVariants(newCV); }} className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg font-black" />
                                            <button type="button" onClick={() => setCustomVariants(customVariants.filter((_, i) => i !== cvIdx))} className="bg-red-100 text-red-600 px-3 rounded-lg"><Trash2 className="h-4 w-4"/></button>
                                        </div>
                                        <div className="space-y-3 pl-4 border-l-2 border-indigo-200">
                                            {cv.options.map((opt, optIdx) => (
                                                <div key={optIdx} className="flex flex-wrap md:flex-nowrap items-center gap-3">
                                                    <input type="text" placeholder="Value (e.g. 10W)" required value={opt.value} onChange={(e) => { const newCV = [...customVariants]; newCV[cvIdx].options[optIdx].value = e.target.value; setCustomVariants(newCV); }} className="flex-1 min-w-[100px] px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" />
                                                    <input type="number" placeholder="Price (Opt)" value={opt.price || ''} onChange={(e) => { const newCV = [...customVariants]; newCV[cvIdx].options[optIdx].price = e.target.value; setCustomVariants(newCV); }} className="flex-1 min-w-[100px] px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" />
                                                    <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-gray-200 shrink-0">
                                                        {(opt.imageBase64 || opt.image) && <img src={opt.imageBase64 || opt.image} alt="var" className="h-6 w-6 rounded object-cover" />}
                                                        <input type="file" accept="image/*" onChange={(e) => handleVariantImage(e, 'custom', optIdx, cvIdx)} className="text-[10px] w-48 text-gray-500 file:hidden" />
                                                    </div>
                                                    <button type="button" onClick={() => { const newCV = [...customVariants]; newCV[cvIdx].options.splice(optIdx, 1); setCustomVariants(newCV); }} className="text-red-500"><X className="h-4 w-4"/></button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => addCustomVariantOption(cvIdx)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">+ Add Option</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </CardContent>
                </Card>

                {/* 4. CUSTOMIZER SETTINGS */}
                <Card>
                    <CardHeader><CardTitle>Storefront Features</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-6 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={reqImage} onChange={(e) => setReqImage(e.target.checked)} className="h-5 w-5 text-blue-600 rounded" />
                                <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5"><ImageIcon className="h-5 w-5 text-blue-500"/> Enable Image Uploads</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={reqText} onChange={(e) => setReqText(e.target.checked)} className="h-5 w-5 text-blue-600 rounded" />
                                <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5"><Type className="h-5 w-5 text-blue-500"/> Enable Custom Text</span>
                            </label>
                        </div>
                    </CardContent>
                </Card>

                {/* SUBMIT */}
                <button type="submit" disabled={isSubmitting} className={`w-full font-black py-4 rounded-xl transition-all shadow-xl flex justify-center items-center gap-2 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
                    {isSubmitting ? <span className="animate-pulse">Saving Changes & Uploading Media...</span> : <><Save className="h-6 w-6"/> Save Product Updates</>}
                </button>
            </form>

            {/* COLOR PICKER MODAL */}
            {showColorModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-in fade-in">
                    <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Select Base Colors</h3>
                            <button onClick={() => setShowColorModal(false)}><X className="h-5 w-5 text-gray-500"/></button>
                        </div>
                        <div className="grid grid-cols-4 gap-3 mb-6">
                            {STANDARD_COLORS.map(hex => (
                                <button key={hex} onClick={() => { addColor(hex); setShowColorModal(false); }} className="h-12 w-12 rounded-full border border-gray-200 shadow-sm hover:scale-110 transition-transform" style={{ backgroundColor: hex }} />
                            ))}
                        </div>
                        <p className="text-xs text-center text-gray-500">Click a color to add it to your variations.</p>
                    </div>
                </div>
            )}
        </div>
    );
}