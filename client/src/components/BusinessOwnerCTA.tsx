import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const BusinessOwnerCTA = () => {
  return (
    <section className="relative py-16 bg-slate-900 text-white">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-800/90 to-primary-900/80">
        <img 
          src="https://images.unsplash.com/photo-1565361834760-3d43dced6c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
          alt="Safari landscape in Zimbabwe" 
          className="w-full h-full object-cover mix-blend-overlay"
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-xl">
          <h2 className="font-montserrat font-bold text-3xl md:text-4xl mb-4">
            Own a Tourism Business?
          </h2>
          <p className="text-lg mb-8 text-slate-200">
            Join our directory to increase your visibility and connect with travelers from around the world. Get valuable insights and analytics to help grow your business.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="flex items-start">
              <div className="bg-white/10 p-2 rounded mr-3">
                <i className="fas fa-chart-line text-accent-400"></i>
              </div>
              <div>
                <h3 className="font-medium text-white">Business Analytics</h3>
                <p className="text-sm text-slate-300">Track profile views and engagement</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/10 p-2 rounded mr-3">
                <i className="fas fa-comments text-accent-400"></i>
              </div>
              <div>
                <h3 className="font-medium text-white">Review Management</h3>
                <p className="text-sm text-slate-300">Respond to customer feedback</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/10 p-2 rounded mr-3">
                <i className="fas fa-camera text-accent-400"></i>
              </div>
              <div>
                <h3 className="font-medium text-white">Photo Gallery</h3>
                <p className="text-sm text-slate-300">Showcase your business with photos</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/10 p-2 rounded mr-3">
                <i className="fas fa-bullhorn text-accent-400"></i>
              </div>
              <div>
                <h3 className="font-medium text-white">Promotion Tools</h3>
                <p className="text-sm text-slate-300">Special offers and featured listings</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/claim">
              <Button variant="default" className="w-full sm:w-auto bg-accent-500 hover:bg-accent-600 px-6 py-6 h-auto">
                Register Your Business
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full sm:w-auto border-white hover:bg-white hover:text-slate-900 text-white px-6 py-6 h-auto">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusinessOwnerCTA;
