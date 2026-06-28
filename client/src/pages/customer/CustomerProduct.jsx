import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../utils/api';
import { Upload, ArrowLeft, PaintBucket, Trash2, CheckCircle, Plus, Minus, ChevronDown, ChevronUp, XCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import ProductViewer3D from '../../components/ProductViewer3D';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../../components/ProductCard'; // Assuming you have this component!

export default function CustomerProduct() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    
    // Core Data States
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // UI Interaction States
    const [showToast, setShowToast] = useState(false);
    const [isDescExpanded, setIsDescExpanded] = useState(false);
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
    const [drawerAction, setDrawerAction] = useState('cart'); // 'cart' or 'buy'
    
    // Customization & Specification States
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState('#ffffff');
    const [selectedSize, setSelectedSize] = useState(null); // For future backend integration

    useEffect(() => {
        const fetchProductData = async () => {
            setLoading(true);
            try {
                // Fetch the main product
                const res = await API.get(`/products/${slug}`);
                if (res.data.success) {
                    const currentProduct = res.data.product;
                    setProduct(currentProduct);

                    // Fetch similar products (Assuming your backend has a standard GET /products route)
                    try {
                        const allRes = await API.get('/products');
                        if (allRes.data.success) {
                            // Filter by same category, exclude current product, limit to 6
                            const similar = allRes.data.products
                                .filter(p => p.category?._id === currentProduct.category?._id && p._id !== currentProduct._id)
                                .slice(0, 6);
                            setSimilarProducts(similar);
                        }
                    } catch (similarErr) {
                        console.error("Failed to fetch similar products", similarErr);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProductData();
        // Reset states when URL changes
        window.scrollTo(0, 0);
        setQuantity(1);
        setUploadedImageUrl(null);
        setIsMobileDrawerOpen(false);
    }, [slug]);

    const handleUserUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => setUploadedImageUrl(reader.result);
        }
    };

    const handleAction = (actionType) => {
        // If we are on mobile, open the drawer first to confirm specs
        if (window.innerWidth < 768) {
            setDrawerAction(actionType);
            setIsMobileDrawerOpen(true);
            return;
        }
        
        // If desktop, execute immediately
        executeAction(actionType);
    };

    const executeAction = (actionType) => {
        // You can pass the new specs (quantity, selectedSize) into your cart context later!
        addToCart(product, uploadedImageUrl, quantity, selectedColor);
        setIsMobileDrawerOpen(false);

        if (actionType === 'buy') {
            navigate('/cart');
        } else {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">Loading product...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center font-bold">Product not found.</div>;

    // Description Truncation Logic
    const desc = product.description || '';
    const shouldTruncateDesc = desc.length > 120;
    const displayDesc = isDescExpanded ? desc : desc.slice(0, 120) + (shouldTruncateDesc ? '...' : '');

    // The Specs Component (Used inline for desktop, and inside the drawer for mobile)
    const SpecificationsUI = () => (
        <div className="space-y-5">
            {/* Quantity Selector */}
            <div>
                <p className="text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">Quantity</p>
                <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1.5 w-max">
                    <button 
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="p-2 text-gray-600 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <span className="font-black text-gray-900 w-6 text-center">{quantity}</span>
                    <button 
                        onClick={() => setQuantity(q => q + 1)}
                        className="p-2 text-gray-600 hover:text-black transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Mocked Future Feature: Sizes */}
            {product.sizes && product.sizes.length > 0 && (
                <div>
                    <p className="text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">Size</p>
                    <div className="flex flex-wrap gap-2">
                        {product.sizes.map(sizeObj => (
                            <button 
                                key={sizeObj._id || sizeObj.value}
                                onClick={() => setSelectedSize(sizeObj.value)}
                                className={`px-4 py-2 text-sm font-bold rounded-lg border transition-all ${selectedSize === sizeObj.value ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-900'}`}
                            >
                                {sizeObj.value}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Customization Area (Colors & Images) */}
            {product.requiresCustomImage && (
                <div className="pt-4 border-t border-gray-100 space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm"><PaintBucket className="h-4 w-4 text-blue-600"/> Customization</h3>
                    
                    <div>
                        <p className="text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">Base Color</p>
                        <div className="flex gap-2">
                            {['#ffffff', '#000000', '#ef4444', '#3b82f6'].map(color => (
                                <button 
                                    key={color} type="button" onClick={() => setSelectedColor(color)}
                                    style={{ backgroundColor: color }}
                                    className={`h-8 w-8 rounded-full border-2 transition-all ${selectedColor === color ? 'border-blue-500 scale-110 shadow-md' : 'border-gray-200'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <label className="flex-1 cursor-pointer bg-white border border-gray-200 hover:border-blue-500 text-gray-700 text-sm font-bold py-2.5 px-3 rounded-lg transition-all flex justify-center items-center gap-2 shadow-sm">
                            <input type="file" accept="image/*" className="hidden" onChange={handleUserUpload} />
                            <Upload className="h-4 w-4"/> {uploadedImageUrl ? 'Change Photo' : 'Upload Photo'}
                        </label>
                        {uploadedImageUrl && (
                            <button onClick={handleDelete} className="bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 py-2.5 px-3 rounded-lg flex items-center transition-colors shadow-sm">
                                <Trash2 className="h-4 w-4" />
                            </button>
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
                {/* ✨ CSS TRICK: Hide the footer ONLY on mobile product pages! ✨ */}
                <style>{`
                    @media (max-width: 767px) {
                        footer { display: none !important; }
                        /* Also hide the global bottom nav to prevent double stickies */
                        .pb-safe { display: none !important; }
                    }
                `}</style>
            </Helmet>

            {/* Mobile Header (Back Button) */}
            <div className="md:hidden sticky top-0 bg-white/80 backdrop-blur-md z-40 px-4 py-3 border-b border-gray-100">
                <button onClick={() => window.history.back()} className="flex items-center gap-2 text-gray-900 font-bold">
                    <ArrowLeft className="h-5 w-5" /> Back
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
                
                {/* Desktop Back Button */}
                <button onClick={() => window.history.back()} className="hidden md:flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-bold transition-colors text-sm">
                    <ArrowLeft className="h-4 w-4" /> Back to Shop
                </button>

                {/* Main Product Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 lg:gap-16">
                    
                    {/* Visualizer */}
                    <div className="w-full aspect-square bg-gray-50 rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative">
                        {product.model3dUrl ? (
                            <ProductViewer3D modelUrl={product.model3dUrl} userImageUrl={uploadedImageUrl} baseColor={selectedColor} />
                        ) : (
                            <img src={product.images[0] || '/placeholder.png'} alt={product.name} className="w-full h-full object-contain p-4" />
                        )}
                        {uploadedImageUrl && (
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur p-1.5 rounded-xl shadow-sm border border-gray-100">
                                <img src={uploadedImageUrl} alt="Preview" className="h-12 w-12 object-cover rounded-lg" />
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">{product.category?.name}</span>
                        <h1 className="text-xl md:text-3xl font-black text-gray-900 mb-2 leading-tight">{product.name}</h1>
                        <p className="text-2xl md:text-3xl font-black text-gray-900 mb-6">Rs. {product.basePrice}</p>

                        {/* DESKTOP ONLY: Inline Specifications & Actions */}
                        <div className="hidden md:block bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-8">
                            <SpecificationsUI />
                            
                            <div className="flex gap-3 mt-8">
                                <button onClick={() => handleAction('cart')} className="flex-1 bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50 font-black py-3.5 rounded-xl transition-all flex justify-center items-center gap-2">
                                    Add to Cart
                                </button>
                                <button onClick={() => handleAction('buy')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-xl transition-all shadow-md shadow-blue-600/20 flex justify-center items-center gap-2">
                                     Buy Now
                                </button>
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className="mt-2 md:mt-0">
                            <h3 className="font-black text-gray-900 mb-2">Product details of {product.name}</h3>
                            <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
                                <p className="whitespace-pre-wrap">{displayDesc}</p>
                                {shouldTruncateDesc && (
                                    <button 
                                        onClick={() => setIsDescExpanded(!isDescExpanded)} 
                                        className="mt-2 text-blue-600 font-bold text-xs uppercase tracking-wider flex items-center gap-1"
                                    >
                                        {isDescExpanded ? 'See Less' : 'See More'} {isDescExpanded ? <ChevronUp className="h-3 w-3"/> : <ChevronDown className="h-3 w-3"/>}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Similar Products Section */}
                {similarProducts.length > 0 && (
                    <div className="mt-16 pt-8 border-t border-gray-100">
                        <h3 className="text-xl font-black text-gray-900 mb-6">You might also like</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                            {similarProducts.map(simProduct => (
                                <ProductCard key={simProduct._id} product={simProduct} />
                            ))}
                        </div>
                        <div className="mt-6 text-center">
                            <Link to={`/products?category=${product.category?.slug}`} className="inline-block border border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900 font-bold px-6 py-2.5 rounded-full transition-all text-sm">
                                View More
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* ---------------- MOBILE EXCLUSIVE UI ---------------- */}

            {/* Sticky Bottom Actions (Mobile Only) */}
            <div className="md:hidden fixed bottom-0 left-0 w-full p-3 bg-white border-t border-gray-100 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex gap-2">
                <button onClick={() => handleAction('cart')} className="flex-1 bg-white border-2 border-gray-900 text-gray-900 font-black py-3.5 rounded-xl flex justify-center items-center gap-1.5 text-sm">
                    Add to Cart
                </button>
                <button onClick={() => handleAction('buy')} className="flex-1 bg-blue-600 text-white font-black py-3.5 rounded-xl flex justify-center items-center gap-1.5 text-sm shadow-md">
                    Buy Now
                </button>
            </div>

            {/* Mobile Specifications Drawer Popup */}
            {isMobileDrawerOpen && (
                <>
                    <div className="md:hidden fixed inset-0 bg-black/60 z-50 animate-in fade-in" onClick={() => setIsMobileDrawerOpen(false)} />
                    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white z-50 rounded-t-3xl p-5 animate-in slide-in-from-bottom-full duration-300 shadow-2xl pb-safe">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-lg text-gray-900">Select Options</h3>
                            <button onClick={() => setIsMobileDrawerOpen(false)} className="bg-gray-100 p-2 rounded-full text-gray-500">
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <SpecificationsUI />

                        <button 
                            onClick={() => executeAction(drawerAction)}
                            className={`w-full font-black py-4 rounded-xl mt-6 flex justify-center items-center gap-2 ${drawerAction === 'buy' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-900 text-white shadow-md'}`}
                        >
                            {drawerAction === 'buy' ? 'Proceed to Checkout' : 'Confirm Add to Cart'}
                        </button>
                    </div>
                </>
            )}

            {/* Desktop Toast Notification */}
            <div className={`hidden md:flex fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl items-center gap-3 transition-all duration-500 z-50 ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div className="flex flex-col">
                    <span className="font-bold text-sm">Added to Cart!</span>
                    <span className="text-xs text-gray-400">{product.name} is ready for checkout.</span>
                </div>
            </div>
        </div>
    );
}