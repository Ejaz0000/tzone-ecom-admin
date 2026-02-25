import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserList from './pages/users/UserList';
import UserForm from './pages/users/UserForm';
import CategoryList from './pages/categories/CategoryList';
import CategoryForm from './pages/categories/CategoryForm';
import BrandList from './pages/brands/BrandList';
import BrandForm from './pages/brands/BrandForm';
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import VariantList from './pages/variants/VariantList';
import VariantForm from './pages/variants/VariantForm';
import AttributeList from './pages/attributes/AttributeList';
import AttributeForm from './pages/attributes/AttributeForm';
import AttributeValueList from './pages/attributes/AttributeValueList';
import AttributeValueForm from './pages/attributes/AttributeValueForm';
import OrderList from './pages/orders/OrderList';
import OrderDetail from './pages/orders/OrderDetail';
import BannerList from './pages/banners/BannerList';
import BannerForm from './pages/banners/BannerForm';
import FeaturedSectionList from './pages/featured/FeaturedSectionList';
import FeaturedSectionForm from './pages/featured/FeaturedSectionForm';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserList />} />
          <Route path="users/add" element={<UserForm />} />
          <Route path="users/:id/edit" element={<UserForm />} />
          <Route path="categories" element={<CategoryList />} />
          <Route path="categories/add" element={<CategoryForm />} />
          <Route path="categories/:id/edit" element={<CategoryForm />} />
          <Route path="brands" element={<BrandList />} />
          <Route path="brands/add" element={<BrandForm />} />
          <Route path="brands/:id/edit" element={<BrandForm />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/add" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="products/:productId/variants" element={<VariantList />} />
          <Route path="products/:productId/variants/add" element={<VariantForm />} />
          <Route path="variants/:id/edit" element={<VariantForm />} />
          <Route path="attributes" element={<AttributeList />} />
          <Route path="attributes/add" element={<AttributeForm />} />
          <Route path="attributes/:id/edit" element={<AttributeForm />} />
          <Route path="attributes/:attrId/values" element={<AttributeValueList />} />
          <Route path="attributes/:attrId/values/add" element={<AttributeValueForm />} />
          <Route path="attribute-values/:id/edit" element={<AttributeValueForm />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="banners" element={<BannerList />} />
          <Route path="banners/add" element={<BannerForm />} />
          <Route path="banners/:id/edit" element={<BannerForm />} />
          <Route path="featured-sections" element={<FeaturedSectionList />} />
          <Route path="featured-sections/add" element={<FeaturedSectionForm />} />
          <Route path="featured-sections/:id/edit" element={<FeaturedSectionForm />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}
