import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../utils/api';
import { fabric } from 'fabric';
import { ShoppingCart, Upload, Download, ArrowLeft, PaintBucket } from 'lucide-react';

export default function CustomerProduct() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Customizer State
  const canvasRef = useRef(null);
  const [canvasInstance, setCanvasInstance] = useState(null);
  const [customImage, setCustomImage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${slug}`);
        if (res.data.success) {
          setProduct(res.data.product);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  // Initialize Fabric.js Canvas once product loads
  useEffect(() => {
    if (product?.requiresCustomImage && canvasRef.current && !canvasInstance) {
      const initCanvas = new fabric.Canvas(canvasRef.current, {
        width: 500,
        height: 500,
        backgroundColor: '#f3f4f6' // light gray background
      });

      // Load the base product image as the background
      if (product.images && product.images.length > 0) {
        fabric.Image.fromURL(product.images[0], (img) => {
          // Scale image to fit canvas
          const scale = Math.min(500 / img.width, 500 / img.height);
          img.set({ scaleX: scale, scaleY: scale, originX: 'center', originY: 'center', left: 250, top: 250 });
          
          initCanvas.setBackgroundImage(img, initCanvas.renderAll.bind(initCanvas));
        }, { crossOrigin: 'anonymous' }); // Required for Cloudinary images
      }

      setCanvasInstance(initCanvas);
    }
  }, [product, canvasInstance]);

  // Handle User Image Upload
  const handleUserUpload = (e) => {
    const file = e.target.files[0];
    if (file && canvasInstance) {
      const reader = new FileReader();
      reader.onload = (f) => {
        const data = f.target.result;
        fabric.Image.fromURL(data, (img) => {
          img.scaleToWidth(200);
          img.set({ left: 150, top: 150, cornerColor: '#2563eb', cornerStrokeColor: '#2563eb', transparentCorners: false });
          canvasInstance.add(img);
          canvasInstance.setActiveObject(img);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Change Background Tint (Simulating changing shirt/mug color)
  const handleColorChange = (color) => {
    if (canvasInstance) {
        canvasInstance.backgroundColor = color;
        canvasInstance.renderAll();
    }
  };

  // Download the final design
  const downloadDesign = () => {
    if (canvasInstance) {
      // Deselect objects so the bounding box doesn't show in the download
      canvasInstance.discardActiveObject();
      canvasInstance.renderAll();
      
      const dataURL = canvasInstance.toDataURL({ format: 'png', quality: 1 });
      const link = document.createElement('a');
      link.download = `my-${product.slug}-design.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // We will save this dataURL to state later to pass to the Shopping Cart!
      setCustomImage(dataURL); 
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading product details...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => window.history.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 font-medium transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Shop
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* LEFT COLUMN: THE VISUALS / CUSTOMIZER */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center min-h-[500px]">
          {product.requiresCustomImage ? (
            <div className="relative border border-gray-200 rounded-xl overflow-hidden shadow-inner">
               <canvas ref={canvasRef} id="canvas" />
            </div>
          ) : (
             <img src={product.images[0] || '/placeholder.png'} alt={product.name} className="w-full h-auto object-cover rounded-xl" />
          )}
        </div>

        {/* RIGHT COLUMN: PRODUCT INFO & CONTROLS */}
        <div className="flex flex-col justify-center">
          <div className="mb-2">
            <span className="text-sm font-bold text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full">{product.category?.name}</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">{product.name}</h1>
          <p className="text-3xl font-bold text-gray-900 mb-6">Rs. {product.basePrice}</p>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">{product.description}</p>

          {/* CUSTOMIZER CONTROLS */}
          {product.requiresCustomImage && (
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8 space-y-6">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><PaintBucket className="h-5 w-5 text-blue-600"/> Customize Your Design</h3>
              
              <div className="flex gap-3">
                <label className="flex-1 cursor-pointer bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all flex justify-center items-center gap-2 shadow-sm">
                  <input type="file" accept="image/*" className="hidden" onChange={handleUserUpload} />
                  <Upload className="h-4 w-4"/> Upload Photo
                </label>
                <button onClick={downloadDesign} className="flex-1 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all flex justify-center items-center gap-2 shadow-sm">
                  <Download className="h-4 w-4"/> Preview & Save
                </button>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Base Color</p>
                <div className="flex gap-2">
                  <button onClick={() => handleColorChange('#ffffff')} className="h-8 w-8 rounded-full bg-white border-2 border-gray-200 hover:scale-110 transition-transform focus:ring-2 focus:ring-blue-500 focus:outline-none"></button>
                  <button onClick={() => handleColorChange('#000000')} className="h-8 w-8 rounded-full bg-black border-2 border-gray-800 hover:scale-110 transition-transform focus:ring-2 focus:ring-blue-500 focus:outline-none"></button>
                  <button onClick={() => handleColorChange('#ef4444')} className="h-8 w-8 rounded-full bg-red-500 border-2 border-red-600 hover:scale-110 transition-transform focus:ring-2 focus:ring-blue-500 focus:outline-none"></button>
                  <button onClick={() => handleColorChange('#3b82f6')} className="h-8 w-8 rounded-full bg-blue-500 border-2 border-blue-600 hover:scale-110 transition-transform focus:ring-2 focus:ring-blue-500 focus:outline-none"></button>
                </div>
              </div>
            </div>
          )}

          <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-gray-900/20 flex justify-center items-center gap-3 text-lg">
            <ShoppingCart className="h-5 w-5" /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}