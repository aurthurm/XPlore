import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Business } from "@/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

// Mock user for demonstration - in a real app, this would come from authentication
const DEMO_USER_ID = 1;

// Form schemas
const searchSchema = z.object({
  keyword: z.string().min(3, { message: "Please enter at least 3 characters" }).max(100),
});

const claimFormSchema = z.object({
  businessId: z.number(),
  userId: z.number(),
  documentUrl: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type SearchFormValues = z.infer<typeof searchSchema>;
type ClaimFormValues = z.infer<typeof claimFormSchema>;

const BusinessClaim = () => {
  const [, params] = useRoute<{ id: string }>("/claim/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [step, setStep] = useState(params?.id ? 2 : 1);
  const [searchResults, setSearchResults] = useState<Business[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | undefined>(
    params?.id ? parseInt(params.id) : undefined
  );
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Fetch specific business if ID provided in URL
  const { data: business, isLoading: isLoadingBusiness } = useQuery<Business>({
    queryKey: [`/api/businesses/${selectedBusinessId}`],
    enabled: !!selectedBusinessId,
  });

  // Search form
  const searchForm = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      keyword: "",
    },
  });

  // Claim form
  const claimForm = useForm<ClaimFormValues>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      businessId: selectedBusinessId || 0,
      userId: DEMO_USER_ID,
      documentUrl: "",
      additionalInfo: "",
    },
  });

  // Update claim form when business ID changes
  useState(() => {
    if (selectedBusinessId) {
      claimForm.setValue("businessId", selectedBusinessId);
    }
  });

  // Claim request mutation
  const claimMutation = useMutation({
    mutationFn: async (data: ClaimFormValues) => {
      return apiRequest("POST", "/api/claim-requests", {
        businessId: data.businessId,
        userId: data.userId,
        documentUrl: data.documentUrl,
        status: "pending"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/claim-requests/user/${DEMO_USER_ID}`] });
      setShowSuccessDialog(true);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to submit claim request: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSearch = async (data: SearchFormValues) => {
    setIsSearching(true);
    try {
      const response = await fetch(`/api/businesses?keyword=${encodeURIComponent(data.keyword)}`);
      if (!response.ok) throw new Error("Search failed");
      
      const results = await response.json();
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "No results found",
          description: "Try searching with different keywords or add a new business.",
        });
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const selectBusiness = (id: number) => {
    setSelectedBusinessId(id);
    setStep(2);
    // Update the URL to reflect selected business
    navigate(`/claim/${id}`);
  };

  const submitClaim = (data: ClaimFormValues) => {
    claimMutation.mutate(data);
  };

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="bg-primary-600 text-white py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-montserrat font-bold text-3xl md:text-4xl mb-4">
            Claim Your Business on ZimExplore
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            Take control of your business listing, update your information, and connect with travelers from around the world.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-10">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 1 ? "bg-primary-600 text-white" : "bg-slate-200 text-slate-500"
                }`}>
                  1
                </div>
                <span className="text-sm mt-2">Find Business</span>
              </div>
              <div className={`flex-1 h-1 mx-4 ${step >= 2 ? "bg-primary-600" : "bg-slate-200"}`}></div>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 2 ? "bg-primary-600 text-white" : "bg-slate-200 text-slate-500"
                }`}>
                  2
                </div>
                <span className="text-sm mt-2">Verify Ownership</span>
              </div>
              <div className={`flex-1 h-1 mx-4 ${step >= 3 ? "bg-primary-600" : "bg-slate-200"}`}></div>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 3 ? "bg-primary-600 text-white" : "bg-slate-200 text-slate-500"
                }`}>
                  3
                </div>
                <span className="text-sm mt-2">Success</span>
              </div>
            </div>
          </div>

          {/* Step 1: Find Business */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Find Your Business</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...searchForm}>
                  <form onSubmit={searchForm.handleSubmit(handleSearch)} className="space-y-4">
                    <FormField
                      control={searchForm.control}
                      name="keyword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name or Location</FormLabel>
                          <div className="flex space-x-2">
                            <FormControl>
                              <Input 
                                placeholder="e.g. Victoria Falls Hotel, Harare Restaurant..." 
                                {...field} 
                                className="flex-1"
                              />
                            </FormControl>
                            <Button type="submit" disabled={isSearching}>
                              {isSearching ? "Searching..." : "Search"}
                            </Button>
                          </div>
                          <FormDescription>
                            Enter your business name, address, or city to find your listing.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>

                {/* Search Results */}
                {isSearching ? (
                  <div className="mt-6 space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="mt-6">
                    <h3 className="font-medium text-lg mb-4">Search Results</h3>
                    <div className="space-y-4">
                      {searchResults.map((business) => (
                        <div 
                          key={business.id} 
                          className="flex items-center border rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
                          onClick={() => selectBusiness(business.id)}
                        >
                          <div className="w-16 h-16 rounded-md overflow-hidden bg-slate-100 mr-4">
                            {business.images && business.images.length > 0 ? (
                              <img 
                                src={business.images[0]} 
                                alt={business.name} 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <i className="fas fa-building text-2xl"></i>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{business.name}</h4>
                            <p className="text-sm text-slate-500">
                              <i className="fas fa-map-marker-alt text-primary-600 mr-1"></i>
                              {business.address}, {business.city}
                            </p>
                            {business.claimed && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                                Already Claimed
                              </span>
                            )}
                          </div>
                          <div>
                            <Button variant="ghost" size="sm">
                              Select <i className="fas fa-chevron-right ml-1"></i>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-medium mb-4">Can't find your business?</h3>
                  <p className="text-slate-600 mb-4">
                    If your business isn't listed in our directory, you can add it now.
                  </p>
                  <Button variant="outline">
                    <i className="fas fa-plus mr-2"></i>
                    Add New Business
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Verify Ownership */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Verify Business Ownership</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingBusiness ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-40 bg-slate-200 rounded"></div>
                  </div>
                ) : business ? (
                  <>
                    {/* Selected Business Info */}
                    <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-slate-100 mr-4">
                          {business.images && business.images.length > 0 ? (
                            <img 
                              src={business.images[0]} 
                              alt={business.name} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <i className="fas fa-building text-2xl"></i>
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">{business.name}</h3>
                          <p className="text-sm text-slate-500">
                            <i className="fas fa-map-marker-alt text-primary-600 mr-1"></i>
                            {business.address}, {business.city}
                          </p>
                        </div>
                      </div>
                      {business.claimed && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md">
                          <div className="flex items-center">
                            <i className="fas fa-exclamation-circle mr-2"></i>
                            <span className="font-medium">This business has already been claimed</span>
                          </div>
                          <p className="text-sm mt-1">
                            If you believe this is an error, please contact our support team for assistance.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Verification Tabs */}
                    {!business.claimed && (
                      <Form {...claimForm}>
                        <form onSubmit={claimForm.handleSubmit(submitClaim)}>
                          <Tabs defaultValue="document">
                            <TabsList className="mb-6">
                              <TabsTrigger value="document">Document Verification</TabsTrigger>
                              <TabsTrigger value="phone">Phone Verification</TabsTrigger>
                              <TabsTrigger value="email">Email Verification</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="document">
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="documentType">Document Type</Label>
                                  <select 
                                    id="documentType" 
                                    className="w-full border border-slate-300 rounded-md p-2 mt-1"
                                  >
                                    <option value="">Select a document type...</option>
                                    <option value="businessLicense">Business License</option>
                                    <option value="utilityBill">Utility Bill</option>
                                    <option value="taxDocument">Tax Document</option>
                                    <option value="other">Other Official Document</option>
                                  </select>
                                </div>
                                
                                <div>
                                  <Label htmlFor="documentUpload">Upload Document</Label>
                                  <div className="mt-1 border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                                    <div className="text-slate-500 mb-2">
                                      <i className="fas fa-file-upload text-3xl"></i>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-4">
                                      Drag and drop your document here, or click to browse files
                                    </p>
                                    <Button type="button" variant="outline" size="sm">
                                      Browse Files
                                    </Button>
                                    <input 
                                      id="documentUpload" 
                                      type="file" 
                                      className="hidden" 
                                      accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                  </div>
                                  <p className="text-xs text-slate-500 mt-2">
                                    Accepted formats: PDF, JPG, JPEG, PNG (max 5MB)
                                  </p>
                                </div>

                                <FormField
                                  control={claimForm.control}
                                  name="additionalInfo"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Additional Information</FormLabel>
                                      <FormControl>
                                        <Textarea 
                                          placeholder="Provide any additional details that might help verify your ownership..." 
                                          className="min-h-[100px]"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormDescription>
                                        Optional: Include your position in the company or any other relevant information.
                                      </FormDescription>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="phone">
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="businessPhone">Business Phone Number</Label>
                                  <Input 
                                    id="businessPhone" 
                                    type="tel" 
                                    placeholder="+263 XX XXX XXXX"
                                    defaultValue={business.phone}
                                  />
                                  <p className="text-xs text-slate-500 mt-1">
                                    Enter the phone number associated with your business listing
                                  </p>
                                </div>
                                
                                <div>
                                  <Label htmlFor="verificationPhone">Your Phone Number</Label>
                                  <Input 
                                    id="verificationPhone" 
                                    type="tel" 
                                    placeholder="+263 XX XXX XXXX"
                                  />
                                  <p className="text-xs text-slate-500 mt-1">
                                    We'll send a verification code to this number
                                  </p>
                                </div>
                                
                                <Button type="button" variant="outline" className="w-full">
                                  Send Verification Code
                                </Button>
                                
                                <div>
                                  <Label htmlFor="verificationCode">Verification Code</Label>
                                  <Input 
                                    id="verificationCode" 
                                    placeholder="Enter the 6-digit code"
                                  />
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="email">
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="businessEmail">Business Email Address</Label>
                                  <Input 
                                    id="businessEmail" 
                                    type="email" 
                                    placeholder="business@example.com"
                                  />
                                  <p className="text-xs text-slate-500 mt-1">
                                    Enter the email address associated with your business domain
                                  </p>
                                </div>
                                
                                <div>
                                  <Label htmlFor="yourRole">Your Role at the Company</Label>
                                  <Input 
                                    id="yourRole" 
                                    placeholder="e.g. Owner, Manager, Marketing Director"
                                  />
                                </div>
                                
                                <Button type="button" variant="outline" className="w-full">
                                  Send Verification Email
                                </Button>
                                
                                <div className="p-4 bg-slate-50 rounded-lg">
                                  <p className="text-sm text-slate-600">
                                    <i className="fas fa-info-circle text-primary-600 mr-2"></i>
                                    We'll send an email with verification instructions to the address you provide. The email domain should match your business website domain for verification to succeed.
                                  </p>
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>

                          <div className="mt-8 flex flex-col sm:flex-row sm:justify-between gap-4">
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={() => {
                                setStep(1);
                                setSelectedBusinessId(undefined);
                                navigate("/claim");
                              }}
                            >
                              <i className="fas fa-arrow-left mr-2"></i>
                              Back to Search
                            </Button>
                            <Button type="submit" disabled={claimMutation.isPending || business.claimed}>
                              {claimMutation.isPending ? (
                                <>Processing...</>
                              ) : (
                                <>
                                  Submit Claim Request
                                  <i className="fas fa-arrow-right ml-2"></i>
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl text-slate-300 mb-4">
                      <i className="fas fa-exclamation-circle"></i>
                    </div>
                    <h3 className="text-xl font-medium mb-2">Business Not Found</h3>
                    <p className="text-slate-500 mb-6">
                      We couldn't find the business you're looking for. Please try searching again.
                    </p>
                    <Button onClick={() => setStep(1)}>Back to Search</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-2xl">
              <span className="bg-green-100 text-green-600 p-2 rounded-full mr-2">
                <i className="fas fa-check"></i>
              </span>
              Claim Request Submitted!
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Your request to claim this business has been submitted successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 border rounded-lg bg-slate-50">
            <h4 className="font-medium mb-2">What happens next?</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <i className="fas fa-check-circle text-green-600 mt-1 mr-2"></i>
                <span>Our team will review your claim within 48 hours</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-green-600 mt-1 mr-2"></i>
                <span>You'll receive an email when your claim is approved</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-green-600 mt-1 mr-2"></i>
                <span>Once approved, you can manage your business listing</span>
              </li>
            </ul>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                onClick={() => {
                  navigate("/dashboard");
                }}
              >
                Go to Dashboard
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
};

export default BusinessClaim;
