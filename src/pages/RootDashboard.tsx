
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CategoriesAdmin } from "@/components/admin/CategoriesAdmin";
import { StaticPagesAdmin } from "@/components/admin/StaticPagesAdmin";
import { TagsAdmin } from "@/components/admin/TagsAdmin";
import Header from "@/components/Header";
import { DealsAdmin } from "@/components/admin/DealsAdmin";
import { UsersAdmin } from "@/components/admin/UsersAdmin";
import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { SettingsAdmin } from "@/components/admin/SettingsAdmin";
import { ShopsAdmin } from "@/components/admin/ShopsAdmin";
import { BlogPostsAdmin } from "@/components/admin/BlogPostsAdmin";
import { CouponsAdmin } from "@/components/admin/CouponsAdmin";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const RootDashboard = () => {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Root Dashboard" }
  ];

  return (
    <ProtectedRoute requiredRole="root_admin">
      <div>
        <Header />
        <div className="container mx-auto py-6">
          <Breadcrumbs items={breadcrumbItems} />
          <h1 className="text-3xl font-bold mb-6">Root Dashboard</h1>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-10">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="deals">Deals</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="tags">Tags</TabsTrigger>
              <TabsTrigger value="shops">Shops</TabsTrigger>
              <TabsTrigger value="coupons">Coupons</TabsTrigger>
              <TabsTrigger value="blog">Blog Posts</TabsTrigger>
              <TabsTrigger value="static-pages">Static Pages</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <DashboardOverview />
            </TabsContent>

            <TabsContent value="deals">
               <DealsAdmin />
            </TabsContent>

            <TabsContent value="categories">
              <CategoriesAdmin />
            </TabsContent>

            <TabsContent value="tags">
              <TagsAdmin />
            </TabsContent>

            <TabsContent value="shops">
              <ShopsAdmin />
            </TabsContent>

            <TabsContent value="coupons">
              <CouponsAdmin />
            </TabsContent>

            <TabsContent value="blog">
              <BlogPostsAdmin />
            </TabsContent>

            <TabsContent value="static-pages">
              <StaticPagesAdmin />
            </TabsContent>
            
            <TabsContent value="users">
              <UsersAdmin />
            </TabsContent>

            <TabsContent value="settings">
              <SettingsAdmin />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default RootDashboard;
