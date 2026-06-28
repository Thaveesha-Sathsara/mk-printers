import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../utils/api';
import { ShoppingCart, Upload, ArrowLeft, PaintBucket, Trash2, CheckCircle, Plus, Minus, ChevronDown, ChevronUp, Zap, XCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import ProductViewer3D from '../../components/ProductViewer3D';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../../components/ProductCard';

export default function CustomerProduct() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // UI Interaction States
    const [showToast, setShowToast] = useState(false);
    const [isDescExpanded, setIsDescExpanded] = useState(false);
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
    const [drawerAction, setDrawerAction] = useState('cart');
    
    // Dynamic Product States
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
    const [quantity, setQuantity] = useState(1);
    
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedCustom, setSelectedCustom] = useState({}); 
    
    // Image Gallery State
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [allGalleryImages, setAllGalleryImages] = useState([]);

    useEffect(() => {
        const fetchProductData = async () => {
            setLoading(true);
            try {
                const res = await API.get(`/products/${slug}`);
                if (res.data.success) {
                    const p = res.data.product;
                    setProduct(p);
                    
                    // Auto-select first available options
                    if (p.colors?.length > 0) setSelectedColor(p.colors[0]);
                    if (p.sizes?.length > 0) setSelectedSize(p.sizes[0]);
                    if (p.customVariants?.length > 0) {
                        const initialCustom = {};
                        p.customVariants.forEach(cv => {
                            if (cv.options.length > 0) initialCustom[cv.title] = cv.options[0];
                        });
                        setSelectedCustom(initialCustom);
                    }
                    
                    // Compile all images for the gallery (Main + Colors + Sizes + Custom)
                    let compiledImages = [...(p.images || [])];
                    p.colors?.forEach(c => c.image && compiledImages.push(c.image));
                    p.sizes?.forEach(s => s.image && compiledImages.push(s.image));
                    p.customVariants?.forEach(cv => {
                        cv.options.forEach(opt => opt.image && compiledImages.push(opt.image));
                    });
                    
                    // Remove duplicates just in case
                    compiledImages = [...new Set(compiledImages)];
                    setAllGalleryImages(compiledImages);

                    // Fetch Similar Products
                    const allRes = await API.get('/products');
                    if (allRes.data.success) {
                        const similar = allRes.data.products.filter(sim => sim.category?._id === p.category?._id && sim._id !== p._id).slice(0, 6);
                        setSimilarProducts(similar);
                    }
                }
            } catch (err) { console.error(err); } 
            finally { setLoading(false); }
        };
        fetchProductData();
        window.scrollTo(0, 0);
        setQuantity(1); setUploadedImageUrl(null); setIsMobileDrawerOpen(false);
    }, [slug]);

    // Auto-Scroll Gallery Effect
    useEffect(() => {
        if (allGalleryImages.length <= 1 || product?.model3dUrl) return; 
        const interval = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % allGalleryImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [allGalleryImages, product]);

    const handleUserUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => setUploadedImageUrl(reader.result);
        }
    };

    // FIXED: Calculate Dynamic Price (Override Base Price if specific variant price exists)
    const calculateCurrentPrice = () => {
        if (!product) return 0;
        let total = product.basePrice;
        if (selectedColor?.price) total += selectedColor.price;
        if (selectedSize?.price) total += selectedSize.price;
        Object.values(selectedCustom).forEach(opt => { if (opt?.price) total += opt.price; });
        return total * quantity;
    };

    const handleAction = (actionType) => {
        if (window.innerWidth < 768) {
            setDrawerAction(actionType);
            setIsMobileDrawerOpen(true);
            return;
        }
        executeAction(actionType);
    };

    const executeAction = (actionType) => {
        const currentPrice = calculateCurrentPrice() / quantity; // Get single unit price
        const finalVariants = { color: selectedColor, size: selectedSize, custom: selectedCustom };
        
        // Pass the dynamically calculated unit price to the cart context
        addToCart({ ...product, basePrice: currentPrice }, uploadedImageUrl, quantity, finalVariants);
        
        setIsMobileDrawerOpen(false);
        if (actionType === 'buy') navigate('/cart');
        else { setShowToast(true); setTimeout(() => setShowToast(false), 3000); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading product...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center font-bold">Product not found.</div>;

    const desc = product.description || '';
    const shouldTruncateDesc = desc.length > 120;
    const displayDesc = isDescExpanded ? desc : desc.slice(0, 120) + (shouldTruncateDesc ? '...' : '');
    const currentPrice = calculateCurrentPrice();

    const SpecificationsUI = () => (
        <div className="space-y-5">
            {/* Quantity */}
            <div>
                <p className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Quantity</p>
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 w-max">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1} className="p-1.5 text-gray-600 disabled:opacity-30"><Minus className="h-3 w-3" /></button>
                    <span className="font-black text-gray-900 w-6 text-center text-sm">{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)} className="p-1.5 text-gray-600"><Plus className="h-3 w-3" /></button>
                </div>
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
                <div>
                    <p className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Select Color</p>
                    <div className="flex flex-wrap gap-2">
                        {product.colors.map((c, idx) => (
                            <button key={idx} onClick={() => setSelectedColor(c)} style={{ backgroundColor: c.value }} title={c.price ? `Rs. ${c.price}` : ''}
                                className={`h-8 w-8 rounded-full border-2 transition-all ${selectedColor?.value === c.value ? 'border-blue-500 scale-110 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`} />
                        ))}
                    </div>
                </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
                <div>
                    <p className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Select Size</p>
                    <div className="flex flex-wrap gap-2">
                        {product.sizes.map((s, idx) => (
                            <button key={idx} onClick={() => setSelectedSize(s)} 
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1 ${selectedSize?.value === s.value ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'}`}>
                                <span>{s.value}</span>
                                {s.price && <span className="opacity-70 font-normal ml-1">(Rs.{s.price})</span>}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Custom Variants */}
            {product.customVariants && product.customVariants.map((cv, idx) => (
                <div key={idx}>
                    <p className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">{cv.title}</p>
                    <div className="flex flex-wrap gap-2">
                        {cv.options.map((opt, oIdx) => (
                            <button key={oIdx} onClick={() => setSelectedCustom({ ...selectedCustom, [cv.title]: opt })}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1 ${selectedCustom[cv.title]?.value === opt.value ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-gray-600 border-gray-200'}`}>
                                <span>{opt.value}</span>
                                {opt.price && <span className="opacity-70 font-normal ml-1">(Rs.{opt.price})</span>}
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            {product.requiresCustomImage && (
                <div className="pt-3 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Custom Artwork</p>
                    <div className="flex gap-2">
                        <label className="flex-1 cursor-pointer bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2.5 px-3 rounded-lg transition-all flex justify-center items-center gap-2 shadow-sm">
                            <input type="file" accept="image/*" className="hidden" onChange={handleUserUpload} />
                            <Upload className="h-3 w-3"/> {uploadedImageUrl ? 'Change Artwork' : 'Upload Artwork'}
                        </label>
                        {uploadedImageUrl && (
                            <button onClick={() => setUploadedImageUrl(null)} className="bg-red-50 text-red-600 border border-red-100 px-3 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-white min-h-screen relative pb-24 md:pb-0">
            <Helmet>
                <title>{product.name} | M.K. Printers</title>
                <style>{`@media (max-width: 767px) { footer, .pb-safe { display: none !important; } }`}</style>
            </Helmet>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 md:py-8">
                <button onClick={() => window.history.back()} className="hidden md:flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-bold transition-colors text-xs uppercase tracking-wider">
                    <ArrowLeft className="h-3 w-3" /> Back to Shop
                </button>

                {/* Main Grid adjusted for sleeker proportions */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
                    
                    {/* Visualizer & Gallery (Takes up less width on desktop now: 7 cols instead of half) */}
                    <div className="md:col-span-7">
                        <div className="aspect-[4/3] bg-gray-50 rounded-xl border border-gray-100 shadow-sm overflow-hidden relative mb-3">
                            {product.model3dUrl ? (
                                <ProductViewer3D modelUrl={product.model3dUrl} userImageUrl={uploadedImageUrl} baseColor={selectedColor?.value || '#ffffff'} />
                            ) : (
                                <img src={allGalleryImages[currentImageIndex] || '/placeholder.png'} alt={product.name} className="w-full h-full object-contain p-4 transition-opacity duration-300" />
                            )}
                            {uploadedImageUrl && (
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur p-1 rounded-lg shadow-sm border border-gray-100">
                                    <img src={uploadedImageUrl} alt="Preview" className="h-10 w-10 object-cover rounded-md" />
                                </div>
                            )}
                        </div>

                        {/* Image Thumbnails Slider */}
                        {!product.model3dUrl && allGalleryImages.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
                                {allGalleryImages.map((img, idx) => (
                                    <button key={idx} onClick={() => setCurrentImageIndex(idx)} 
                                        className={`shrink-0 h-12 w-12 rounded-lg border-2 overflow-hidden transition-all ${currentImageIndex === idx ? 'border-blue-600 shadow-sm' : 'border-gray-200 opacity-60 hover:opacity-100'}`}>
                                        <img src={img} alt="thumb" className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details (Takes up 5 cols) */}
                    <div className="md:col-span-5 flex flex-col">
                        <div className="mb-4 pb-4 border-b border-gray-100">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1.5 block">{product.category?.name}</span>
                            <h1 className="text-xl md:text-2xl font-black text-gray-900 mb-1.5 leading-tight">{product.name}</h1>
                            <p className="text-2xl md:text-3xl font-black text-blue-600">Rs. {currentPrice}</p>
                        </div>

                        <div className="hidden md:block mb-6">
                            <SpecificationsUI />
                            <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
                                <button onClick={() => handleAction('cart')} className="flex-1 bg-white border border-gray-300 hover:border-gray-900 text-gray-900 font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2 text-sm shadow-sm">
                                    <ShoppingCart className="h-4 w-4" /> Add to Cart
                                </button>
                                <button onClick={() => handleAction('buy')} className="flex-[1.5] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md flex justify-center items-center gap-2 text-sm">
                                    <Zap className="h-4 w-4" /> Buy Now
                                </button>
                            </div>
                        </div>

                        <div className="mt-2 md:mt-0">
                            <h3 className="font-bold text-gray-900 mb-2 text-sm">Description</h3>
                            <div className="text-xs text-gray-600 leading-relaxed">
                                <p className="whitespace-pre-wrap">{displayDesc}</p>
                                {shouldTruncateDesc && (
                                    <button onClick={() => setIsDescExpanded(!isDescExpanded)} className="mt-2 text-blue-600 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                                        {isDescExpanded ? 'See Less' : 'Read Full Description'} {isDescExpanded ? <ChevronUp className="h-3 w-3"/> : <ChevronDown className="h-3 w-3"/>}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Similar Products Section */}
                {similarProducts.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-gray-100">
                        <h3 className="text-lg font-black text-gray-900 mb-4">You might also like</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {similarProducts.map(simProduct => (
                                <ProductCard key={simProduct._id} product={simProduct} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Bottom Bar */}
            <div className="md:hidden fixed bottom-0 left-0 w-full p-3 bg-white border-t border-gray-100 z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] flex gap-2">
                <button onClick={() => handleAction('cart')} className="flex-1 bg-white border border-gray-300 text-gray-900 font-bold py-3 rounded-xl flex justify-center items-center gap-2 text-sm">
                    <ShoppingCart className="h-4 w-4" /> Cart
                </button>
                <button onClick={() => handleAction('buy')} className="flex-[1.5] bg-blue-600 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 text-sm shadow-md">
                    Buy • Rs.{currentPrice}
                </button>
            </div>

            {/* Mobile Drawer */}
{           isMobileDrawerOpen && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsMobileDrawerOpen(false)}>
                        {/* The Modal Box */}
                        <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-lg text-gray-900">{product.name} Rs. {currentPrice}</h3>
                                <button onClick={() => setIsMobileDrawerOpen(false)} className="text-gray-400 hover:text-gray-900"><XCircle className="h-6 w-6" /></button>
                            </div>
                            
                            {/* Reusing your Specs logic here */}
                            <SpecificationsUI />

                            <button onClick={() => executeAction(drawerAction)} className="w-full font-black py-4 rounded-xl mt-8 flex justify-center items-center gap-2 bg-blue-600 text-white shadow-lg text-sm">
                                Confirm & Proceed
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}