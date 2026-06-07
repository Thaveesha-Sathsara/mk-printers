import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../utils/api';
import { fabric } from 'fabric';
import { ShoppingCart, Upload, Download, ArrowLeft, PaintBucket, Trash2, CheckCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CustomerProduct() {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const [showToast, setShowToast] = useState(false);
    
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

useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${slug}`);
        if (res.data.success) setProduct(res.data.product);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchProduct();
  }, [slug]);

useLayoutEffect(() => {
    if (!product?.requiresCustomImage || !canvasRef.current) return;

    // 1. Get the actual width of the parent container on the user's device
    const wrapper = document.getElementById('canvas-wrapper');
    const containerWidth = wrapper ? wrapper.clientWidth : 500;
    
    // 2. Initialize Canvas with the dynamic width (keeping it a perfect square)
    const initCanvas = new fabric.Canvas(canvasRef.current, {
        width: containerWidth,
        height: containerWidth,
        backgroundColor: '#f3f4f6'
    });

    // 3. Load the Base Product Image and scale it to fit the new dynamic size
    if (product.images?.length > 0) {
        fabric.Image.fromURL(product.images[0], (img) => {
            const scale = Math.min(containerWidth / img.width, containerWidth / img.height);
            img.set({ 
                scaleX: scale, 
                scaleY: scale, 
                originX: 'center', 
                originY: 'center', 
                left: containerWidth / 2, 
                top: containerWidth / 2 
            });
            initCanvas.setBackgroundImage(img, initCanvas.renderAll.bind(initCanvas));
        }, { crossOrigin: 'anonymous' });
    }

    // 4. Load the Overlay Mask and scale it identically
    if (product.overLayUrl) {
        fabric.Image.fromURL(product.overLayUrl, (overlay) => {
            const scale = Math.min(containerWidth / overlay.width, containerWidth / overlay.height);
            overlay.set({ 
                scaleX: scale, 
                scaleY: scale, 
                originX: 'center', 
                originY: 'center', 
                left: containerWidth / 2, 
                top: containerWidth / 2,
                selectable: false, 
                evented: false 
            });
            initCanvas.add(overlay);
            initCanvas.renderAll();
        }, { crossOrigin: 'anonymous' });
    }

    setCanvasInstance(initCanvas);
    return () => initCanvas.dispose();
}, [product]);

  // 3. Update the handleUserUpload to make the photo look "Printed"
  const handleUserUpload = (e) => {
    const file = e.target.files[0];
    if (file && canvasInstance) {
      const reader = new FileReader();
      reader.onload = (f) => {
        fabric.Image.fromURL(f.target.result, (img) => {
          img.scaleToWidth(150);
          img.set({ 
            left: 175, top: 175, 
            globalCompositeOperation: 'multiply',
            cornerColor: '#2563eb',
            cornerStrokeColor: '#2563eb',
            transparentCorners: false
          });
          canvasInstance.add(img);
          canvasInstance.setActiveObject(img);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle User Image Upload
//   const handleUserUpload = (e) => {
//     const file = e.target.files[0];
//     if (file && canvasInstance) {
//       const reader = new FileReader();
//       reader.onload = (f) => {
//         const data = f.target.result;
//         fabric.Image.fromURL(data, (img) => {
//           img.scaleToWidth(200);
//           img.set({ left: 150, top: 150, cornerColor: '#2563eb', cornerStrokeColor: '#2563eb', transparentCorners: false });
//           canvasInstance.add(img);
//           canvasInstance.setActiveObject(img);
//         });
//       };
//       reader.readAsDataURL(file);
//     }
//   };

  // Change Background Tint (Simulating changing shirt/mug color)
  const handleColorChange = (color) => {
    if (canvasInstance) {
        canvasInstance.setBackgroundColor(color, canvasInstance.renderAll.bind(canvasInstance));
    }
  };

  // Download the final design
 const downloadDesign = () => {
    if (!canvasInstance) return;

    canvasInstance.discardActiveObject();
    canvasInstance.renderAll();
    
    const dataURL = canvasInstance.toDataURL({ format: 'png', quality: 1 });
    
    // Create link and simulate click safely
    const link = document.createElement('a');
    link.download = `my-design.png`;
    link.href = dataURL;
    link.click();
    
    setCustomImage(dataURL); 
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
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center w-full aspect-square max-w-[500px] mx-auto overflow-hidden">
            <div id="canvas-wrapper" className="w-full h-full relative flex items-center justify-center">
                {product.requiresCustomImage ? (
                    <canvas ref={canvasRef} />
                    ) : (
                        <img src={product.images[0] || '/placeholder.png'} alt={product.name} className="w-full h-full object-contain rounded-xl" />
                    )}
            </div>
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
                <button 
                  onClick={() => {
                      const activeObj = canvasInstance.getActiveObject();
                      if (activeObj) {
                          canvasInstance.remove(activeObj);
                          canvasInstance.renderAll();
                      }
                  }}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold py-3 px-4 rounded-xl transition-all flex items-center gap-2 shadow-sm"
                  title="Delete Selected Image"
                >
                  <Trash2 className="h-4 w-4" /> Delete Photo
                  
                </button>
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
                  
        {customImage && (
            <div className="bg-green-50 p-4 rounded-xl border border-green-200 mb-6 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
              <img src={customImage} alt="Your Custom Design" className="h-16 w-16 object-cover rounded-lg border border-green-200 shadow-sm" />
              <div>
                <p className="text-sm font-bold text-green-800">Design Saved!</p>
                <p className="text-xs text-green-600 font-medium">Ready to be added to your cart.</p>
              </div>
            </div>
                  )}
                  
                    <div className={`fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-500 z-50 ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">Added to Cart!</span>
                        <span className="text-xs text-gray-400">{product.name} is ready for checkout.</span>
                      </div>
                    </div>

                  <button 
                      onClick={() => {
                          addToCart(product, customImage, 1);
                          setShowToast(true);
                          setTimeout(() => setShowToast(false), 3000);
                      }}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-gray-900/20 flex justify-center items-center gap-3 text-lg">
            <ShoppingCart className="h-5 w-5" /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}