import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Business, ClaimRequest, User } from "@/types";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Mock user for demonstration - in a real app, this would come from authentication
const DEMO_USER_ID = 1;

const BusinessDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Fetch mock user data - in a real app, this would come from auth context
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: [`/api/users/${DEMO_USER_ID}`],
    // Since we don't have a real endpoint for this, we'll mock the response
    queryFn: async () => {
      // Mock response - in a real app, this would come from the API
      return {
        id: DEMO_USER_ID,
        username: "business_owner",
        email: "owner@example.com",
        fullName: "Demo Business Owner",
        isBusiness: true,
        createdAt: new Date(),
      };
    },
  });

  // Fetch owned businesses
  const { data: businesses, isLoading: isLoadingBusinesses } = useQuery<Business[]>({
    queryKey: [`/api/businesses/owner/${DEMO_USER_ID}`],
    enabled: !!user,
  });

  // Fetch claim requests
  const { data: claimRequests, isLoading: isLoadingClaims } = useQuery<ClaimRequest[]>({
    queryKey: [`/api/claim-requests/user/${DEMO_USER_ID}`],
    enabled: !!user,
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <>
      <Header />

      <div className="bg-slate-100 py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col items-center py-4">
                    <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-4xl mb-4">
                      <i className="fas fa-user-tie"></i>
                    </div>
                    {isLoadingUser ? (
                      <>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-40" />
                      </>
                    ) : (
                      <>
                        <h2 className="text-xl font-semibold mb-1">{user?.fullName}</h2>
                        <p className="text-sm text-slate-500">{user?.email}</p>
                      </>
                    )}
                  </div>

                  <div className="mt-6 space-y-1">
                    <Button
                      variant={activeTab === "overview" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleTabChange("overview")}
                    >
                      <i className="fas fa-tachometer-alt mr-2"></i>
                      Dashboard Overview
                    </Button>
                    <Button
                      variant={activeTab === "businesses" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleTabChange("businesses")}
                    >
                      <i className="fas fa-store mr-2"></i>
                      My Businesses
                    </Button>
                    <Button
                      variant={activeTab === "claims" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleTabChange("claims")}
                    >
                      <i className="fas fa-user-check mr-2"></i>
                      Claim Requests
                    </Button>
                    <Button
                      variant={activeTab === "profile" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleTabChange("profile")}
                    >
                      <i className="fas fa-user-cog mr-2"></i>
                      Account Settings
                    </Button>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <Button variant="outline" className="w-full">
                      <i className="fas fa-sign-out-alt mr-2"></i>
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="mb-6 bg-white p-1">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="businesses">My Businesses</TabsTrigger>
                  <TabsTrigger value="claims">Claim Requests</TabsTrigger>
                  <TabsTrigger value="profile">Account Settings</TabsTrigger>
                </TabsList>

                {/* Dashboard Overview */}
                <TabsContent value="overview">
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-500">Total Businesses</p>
                            <h3 className="text-3xl font-bold">{isLoadingBusinesses ? "-" : businesses?.length || 0}</h3>
                          </div>
                          <div className="bg-primary-100 p-3 rounded-full text-primary-600">
                            <i className="fas fa-store"></i>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-500">Pending Claims</p>
                            <h3 className="text-3xl font-bold">
                              {isLoadingClaims
                                ? "-"
                                : claimRequests?.filter((claim) => claim.status === "pending").length || 0}
                            </h3>
                          </div>
                          <div className="bg-amber-100 p-3 rounded-full text-amber-600">
                            <i className="fas fa-clock"></i>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-500">Profile Views</p>
                            <h3 className="text-3xl font-bold">324</h3>
                          </div>
                          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                            <i className="fas fa-eye"></i>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingBusinesses || businesses?.length === 0 ? (
                        <div className="text-center py-6">
                          <div className="mb-4 text-4xl text-slate-300">
                            <i className="fas fa-chart-line"></i>
                          </div>
                          <h3 className="text-lg font-medium mb-2">No Activity Yet</h3>
                          <p className="text-slate-500 mb-4">Add or claim a business to see activity here.</p>
                          <Link href="/claim">
                            <Button>Add a Business</Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-start p-3 bg-slate-50 rounded-lg">
                            <div className="bg-green-100 p-2 rounded-full text-green-600 mr-3">
                              <i className="fas fa-eye"></i>
                            </div>
                            <div>
                              <p className="font-medium">{businesses?.[0].name} was viewed 12 times</p>
                              <p className="text-sm text-slate-500">Today at 9:42 AM</p>
                            </div>
                          </div>
                          <div className="flex items-start p-3 bg-slate-50 rounded-lg">
                            <div className="bg-blue-100 p-2 rounded-full text-blue-600 mr-3">
                              <i className="fas fa-search"></i>
                            </div>
                            <div>
                              <p className="font-medium">Your business appeared in 45 searches</p>
                              <p className="text-sm text-slate-500">Yesterday</p>
                            </div>
                          </div>
                          <div className="flex items-start p-3 bg-slate-50 rounded-lg">
                            <div className="bg-purple-100 p-2 rounded-full text-purple-600 mr-3">
                              <i className="fas fa-map-marked-alt"></i>
                            </div>
                            <div>
                              <p className="font-medium">Someone requested directions to your business</p>
                              <p className="text-sm text-slate-500">2 days ago</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Business Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 border border-primary-100 bg-primary-50 rounded-lg">
                          <h4 className="font-medium flex items-center text-primary-700 mb-2">
                            <i className="fas fa-lightbulb mr-2"></i>
                            Complete Your Profile
                          </h4>
                          <p className="text-sm text-slate-600">
                            Businesses with complete profiles get up to 7x more views. Add photos, business hours, and
                            detailed descriptions.
                          </p>
                        </div>
                        <div className="p-4 border border-accent-100 bg-accent-50 rounded-lg">
                          <h4 className="font-medium flex items-center text-accent-700 mb-2">
                            <i className="fas fa-camera mr-2"></i>
                            Add High-Quality Photos
                          </h4>
                          <p className="text-sm text-slate-600">
                            Listings with more than 5 high-quality photos receive 2x more clicks than those without
                            photos.
                          </p>
                        </div>
                        <div className="p-4 border border-secondary-100 bg-secondary-50 rounded-lg">
                          <h4 className="font-medium flex items-center text-secondary-700 mb-2">
                            <i className="fas fa-reply mr-2"></i>
                            Respond to Reviews
                          </h4>
                          <p className="text-sm text-slate-600">
                            Businesses that respond to reviews are seen as more trustworthy by 45% of potential
                            customers.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* My Businesses */}
                <TabsContent value="businesses">
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle>My Businesses</CardTitle>
                        <Link href="/claim">
                          <Button>
                            <i className="fas fa-plus mr-2"></i>
                            Add New Business
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingBusinesses ? (
                        <div className="space-y-4">
                          {[1, 2].map((i) => (
                            <div key={i} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg animate-pulse">
                              <div className="bg-slate-200 w-full md:w-40 h-32 rounded-lg"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                                <div className="h-8 bg-slate-200 rounded w-24 mt-4"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : businesses?.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="mb-4 text-4xl text-slate-300">
                            <i className="fas fa-store"></i>
                          </div>
                          <h3 className="text-lg font-medium mb-2">No Businesses Yet</h3>
                          <p className="text-slate-500 mb-4">
                            You haven't claimed or added any businesses to your profile yet.
                          </p>
                          <Link href="/claim">
                            <Button>Add a Business</Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {businesses?.map((business) => (
                            <div
                              key={business.id}
                              className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                            >
                              <div className="w-full md:w-40 h-32 rounded-lg overflow-hidden bg-slate-200">
                                {business.images && business.images.length > 0 ? (
                                  <img
                                    src={business.images[0]}
                                    alt={business.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <i className="fas fa-image text-3xl"></i>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-medium mb-1">{business.name}</h3>
                                <p className="text-sm text-slate-500 mb-1">
                                  <i className="fas fa-map-marker-alt text-primary-600 mr-1"></i>
                                  {business.address}, {business.city}
                                </p>
                                {business.rating && (
                                  <div className="flex items-center mb-2">
                                    <div className="flex items-center bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs">
                                      <span className="font-semibold mr-1">{business.rating.toFixed(1)}</span>
                                      <i className="fas fa-star text-xs"></i>
                                    </div>
                                    <span className="text-xs text-slate-500 ml-2">Based on Google reviews</span>
                                  </div>
                                )}
                                <div className="flex flex-wrap gap-2 mt-3">
                                  <Link href={`/business/${business.id}`}>
                                    <Button variant="outline" size="sm">
                                      <i className="fas fa-eye mr-1"></i>
                                      View
                                    </Button>
                                  </Link>
                                  <Button variant="outline" size="sm">
                                    <i className="fas fa-edit mr-1"></i>
                                    Edit
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <i className="fas fa-chart-bar mr-1"></i>
                                    Analytics
                                  </Button>
                                </div>
                              </div>
                              <div className="mt-4 md:mt-0 flex flex-col items-center justify-center">
                                <div className="text-sm text-slate-500 mb-1">Status</div>
                                <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">Active</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Claim Requests */}
                <TabsContent value="claims">
                  <Card>
                    <CardHeader>
                      <CardTitle>Claim Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingClaims ? (
                        <div className="space-y-4">
                          {[1, 2].map((i) => (
                            <div key={i} className="p-4 border rounded-lg animate-pulse">
                              <div className="flex justify-between mb-2">
                                <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                                <div className="h-6 bg-slate-200 rounded w-20"></div>
                              </div>
                              <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                              <div className="h-4 bg-slate-200 rounded w-full"></div>
                            </div>
                          ))}
                        </div>
                      ) : claimRequests?.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="mb-4 text-4xl text-slate-300">
                            <i className="fas fa-user-check"></i>
                          </div>
                          <h3 className="text-lg font-medium mb-2">No Claim Requests</h3>
                          <p className="text-slate-500 mb-4">
                            You haven't submitted any requests to claim businesses yet.
                          </p>
                          <Link href="/claim">
                            <Button>Claim a Business</Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {claimRequests?.map((claim) => (
                            <div key={claim.id} className="p-4 border rounded-lg">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                                <h3 className="text-lg font-medium">
                                  Business ID: {claim.businessId}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => 
                                      toast({
                                        title: "Loading business details",
                                        description: "This would load the business details in a real application."
                                      })
                                    }
                                  >
                                    <i className="fas fa-external-link-alt text-xs"></i>
                                  </Button>
                                </h3>
                                <div
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    claim.status === "pending"
                                      ? "bg-amber-100 text-amber-700"
                                      : claim.status === "approved"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                                </div>
                              </div>
                              <p className="text-sm text-slate-500 mb-1">
                                Submitted on: {new Date(claim.createdAt).toLocaleDateString()}
                              </p>
                              {claim.status === "pending" && (
                                <p className="text-sm text-amber-600 mt-2">
                                  <i className="fas fa-info-circle mr-1"></i>
                                  Your claim is under review. This usually takes 1-2 business days.
                                </p>
                              )}
                              {claim.status === "approved" && (
                                <p className="text-sm text-green-600 mt-2">
                                  <i className="fas fa-check-circle mr-1"></i>
                                  Congratulations! Your claim has been approved.
                                </p>
                              )}
                              {claim.status === "rejected" && (
                                <p className="text-sm text-red-600 mt-2">
                                  <i className="fas fa-exclamation-circle mr-1"></i>
                                  Your claim was rejected. Please contact support for more information.
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Account Settings */}
                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          toast({
                            title: "Profile updated",
                            description: "Your profile has been updated successfully.",
                          });
                        }}
                        className="space-y-6"
                      >
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="fullName">Full Name</Label>
                              <Input
                                id="fullName"
                                defaultValue={user?.fullName}
                                placeholder="Enter your full name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                defaultValue={user?.email}
                                placeholder="Enter your email"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="username">Username</Label>
                              <Input
                                id="username"
                                defaultValue={user?.username}
                                placeholder="Enter your username"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone Number</Label>
                              <Input id="phone" placeholder="Enter your phone number" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                              id="bio"
                              placeholder="Tell us about yourself or your business"
                              className="min-h-32"
                            />
                          </div>
                        </div>

                        <div className="border-t pt-6">
                          <h3 className="text-lg font-medium mb-4">Change Password</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="currentPassword">Current Password</Label>
                              <Input id="currentPassword" type="password" placeholder="Enter current password" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="newPassword">New Password</Label>
                              <Input id="newPassword" type="password" placeholder="Enter new password" />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button type="submit">Save Changes</Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default BusinessDashboard;
