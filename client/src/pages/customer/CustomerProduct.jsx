import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../utils/api';
import { ShoppingCart, Upload, ArrowLeft, PaintBucket, Trash2, CheckCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import ProductViewer3D from '../../components/ProductViewer3D';
import { Helmet } from 'react-helmet-async';

export default function CustomerProduct() {
    <Helmet>
        <title>{product ? `${product.name} | M.K. Printers` : 'Product Details | M.K. Printers'}</title>
        <meta name="description" content={product ? product.description : 'Detailed view of our customizable product. Upload your own images and choose base colors to make it uniquely yours. Add to cart and bring your design to life with M.K. Printers.'} />
        <meta name="keywords" content={product ? `${product.name}, custom products, personalized gifts, M.K. Printers` : 'custom products, personalized gifts, M.K. Printers'} />
    </Helmet>
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const [showToast, setShowToast] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
    const [baseColor, setBaseColor] = useState('#ffffff');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await API.get(`/products/${slug}`);
                if (res.data.success) setProduct(res.data.product);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);

    const handleUserUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const tempUrl = URL.createObjectURL(file);
            setUploadedImageUrl(tempUrl);
        }
    };

    const handleDelete = () => {
        setUploadedImageUrl(null);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading product details...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <button aria-label="Go back" onClick={() => window.history.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 font-medium transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Shop
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="flex flex-col gap-6">
                    {product.model3dUrl ? (
                        <div className="w-full aspect-square max-w-[500px] mx-auto relative rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            <ProductViewer3D
                                modelUrl={product.model3dUrl}
                                userImageUrl={uploadedImageUrl}
                                baseColor={baseColor}
                            />
                        </div>
                    ) : (
                        <div className="w-full aspect-square max-w-[500px] mx-auto overflow-hidden rounded-xl border border-gray-100">
                            <img src={product.images[0] || '/placeholder.png'} alt={product.name} className="w-full h-full object-contain" />
                        </div>
                    )}
                </div>

                <div className="flex flex-col justify-center">
                    <div className="mb-2">
                        <span className="text-sm font-bold text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full">{product.category?.name}</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">{product.name}</h1>
                    <p className="text-3xl font-bold text-gray-900 mb-6">Rs. {product.basePrice}</p>
                    <p className="text-gray-500 text-lg mb-8 leading-relaxed">{product.description}</p>

                    {product.requiresCustomImage && (
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8 space-y-6">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2"><PaintBucket className="h-5 w-5 text-blue-600"/> Customize Your Design</h3>

                            <div className="flex gap-3">
                                <label className="flex-1 cursor-pointer bg-white border border-gray-300 hover:border-blue-500 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all flex justify-center items-center gap-2 shadow-sm">
                                    <input type="file" accept="image/*" className="hidden" onChange={handleUserUpload} />
                                    <Upload className="h-4 w-4"/> Upload Photo
                                </label>
                                {uploadedImageUrl && (
                                    <button aria-label="Delete Image" onClick={handleDelete} className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 py-3 px-4 rounded-xl flex items-center transition-colors shadow-sm">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-gray-700 mb-2">Base Color</p>
                                <div className="flex gap-2">
                                    <button aria-label="White" type="button" onClick={() => setBaseColor('#ffffff')} className="h-8 w-8 rounded-full bg-white border-2 border-gray-200 hover:scale-110" />
                                    <button aria-label="Black" type="button" onClick={() => setBaseColor('#000000')} className="h-8 w-8 rounded-full bg-black border-2 border-gray-800 hover:scale-110" />
                                    <button aria-label="Red" type="button" onClick={() => setBaseColor('#ef4444')} className="h-8 w-8 rounded-full bg-red-500 border-2 border-red-600 hover:scale-110" />
                                    <button aria-label="Blue" type="button" onClick={() => setBaseColor('#3b82f6')} className="h-8 w-8 rounded-full bg-blue-500 border-2 border-blue-600 hover:scale-110" />
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        aria-label="Add to Cart"
                        onClick={() => {
                            addToCart(product, uploadedImageUrl, 1, baseColor);
                            setShowToast(true);
                            setTimeout(() => setShowToast(false), 3000);
                        }}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-gray-900/20 flex justify-center items-center gap-3 text-lg"
                    >
                        <ShoppingCart className="h-5 w-5" /> Add to Cart
                    </button>
                </div>
            </div>

            <div className={`fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-500 z-50 ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div className="flex flex-col">
                    <span className="font-bold text-sm">Added to Cart!</span>
                    <span className="text-xs text-gray-400">{product.name} is ready for checkout.</span>
                </div>
            </div>
        </div>
    );
}
