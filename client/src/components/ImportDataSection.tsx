import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ImportDataSection = () => {
  return (
    <section className="bg-primary-50 border-t border-primary-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <span className="font-montserrat font-semibold text-primary-600 uppercase tracking-wider text-sm">FOR BUSINESS OWNERS</span>
          <h2 className="font-montserrat font-bold text-2xl md:text-3xl mb-4 mt-2">Add Your Business to Our Directory</h2>
          <p className="text-slate-600">Join our growing list of Zimbabwean businesses and increase your visibility to local and international tourists.</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-search text-xl"></i>
                </div>
                <h3 className="font-medium text-lg mb-2">Find Your Business</h3>
                <p className="text-sm text-slate-600">Search for your business to see if it's already listed in our directory.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-user-check text-xl"></i>
                </div>
                <h3 className="font-medium text-lg mb-2">Claim Your Listing</h3>
                <p className="text-sm text-slate-600">Verify ownership through our simple authentication process.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-edit text-xl"></i>
                </div>
                <h3 className="font-medium text-lg mb-2">Update Information</h3>
                <p className="text-sm text-slate-600">Add photos, update business hours, and respond to reviews.</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8 text-center">
            <Link href="/claim">
              <Button className="px-8 py-6 h-auto">
                Get Started
                <i className="fas fa-arrow-right ml-2"></i>
              </Button>
            </Link>
            <p className="mt-4 text-sm text-slate-600">
              Already have an account? <Link href="/dashboard" className="text-primary-600 font-medium">Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImportDataSection;
