import { useState, useEffect } from 'react';
import API from '../utils/api';
import { Package, Plus, Folder, AlertCircle, Image as ImageIcon, Type, CheckCircle } from 'lucide-react';

const Card = ({ children, className = "" }) => <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>{children}</div>;
const CardHeader = ({ children, className = "" }) => <div className={`p-6 border-b border-gray-100 bg-gray-50/50 ${className}`}>{children}</div>;
const CardTitle = ({ children }) => <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">{children}</h3>;
const CardContent = ({ children, className = "" }) => <div className={`p-6 ${className}`}>{children}</div>;

export default function AdminProducts() {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setloading] = useState([]);
    const [error, setError] = useState([]);
    const [success, setSuccess] = useState([]);

    const [catName, setCatName] = useState('');
    const [catDesc, setCatDesc] = useState('');

    const [prodName, setProdName] = useState('');
    const [prodCat, setProdCat] = useState('');
    const [prodDesc, setProdDesc] = useState('');
    const [prodPrice, setProdPrice] = useState('');
    const [reqImage, setReqImage] = useState('');
    const [reqText, setReqText] = useState('');

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

    const handleCreateCategory = async (e) => {
        e.prefentDefault(); setError(''), setSuccess('');
        try {
            await API.post('/categories/create', { name: catName, description: catDesc });
            setSuccess(`Category "${catName}" created successfully!`);
            setCatName(''); setCatDesc('');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create category ');
        }
    };

    const handleCreateProduct = async (e) => {
        e.prefentDefault(); setError(''); setSuccess('');
        if (!prodCat) return setError('please select a category first');

        try {
            await API.post('/products/create', {
                name: prodName,
                category: prodCat,
                description: prodDesc,
                basePrice: Number(prodPrice),
                requiresCustomImage: reqImage,
                requiresCustomText: reqText,
                images: []
            });
            setSuccess(`Product "${prodName}" added to the store`);
            setProdName(''); setProdDesc(''); setProdPrice(''); setReqImage(false); setReqText(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create product');
        }
    };

    return (
        <div className="min-h-full p-4 md:p-8 font-sans text-gray-900 flex flex-col relative">

            <div className="max-w-7xl mx-auto w-full mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                    <Package className="h-8 w-8 text-blue-600" /> Inventory Manager
                </h1>
                <p className="text-gray-500 text-sm mt-1">Add product categories and manage the storefront catelog.</p>
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
                            <form onSUbmit
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}