import { Button } from "@/components/ui/button";

const DownloadSection = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
            <span className="font-montserrat font-semibold text-primary-600 uppercase tracking-wider text-sm">Mobile Access</span>
            <h2 className="font-montserrat font-bold text-3xl mb-4 mt-2">Download Our App for Offline Access</h2>
            <p className="text-slate-600 mb-6">Explore Zimbabwe even without an internet connection. Save your favorite locations, access maps offline, and get the full experience on the go.</p>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Button variant="outline" className="flex items-center justify-center px-4 py-6 h-auto">
                <i className="fab fa-apple text-2xl mr-3"></i>
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="font-medium">App Store</div>
                </div>
              </Button>
              
              <Button variant="outline" className="flex items-center justify-center px-4 py-6 h-auto">
                <i className="fab fa-google-play text-2xl mr-3"></i>
                <div className="text-left">
                  <div className="text-xs">Get it on</div>
                  <div className="font-medium">Google Play</div>
                </div>
              </Button>
            </div>
          </div>
          
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-64 h-96">
              <div className="absolute inset-0 bg-slate-200 rounded-3xl transform rotate-6"></div>
              <div className="absolute inset-0 bg-slate-100 rounded-3xl transform -rotate-3"></div>
              <div className="relative bg-white border border-slate-200 shadow-lg rounded-3xl overflow-hidden w-full h-full">
                <div className="h-10 bg-slate-200 flex items-center justify-center">
                  <div className="w-20 h-5 bg-slate-300 rounded-full"></div>
                </div>
                <div className="p-4">
                  <div className="w-full h-40 bg-slate-100 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="w-3/4 h-4 bg-slate-200 rounded"></div>
                    <div className="w-1/2 h-4 bg-slate-200 rounded"></div>
                    <div className="w-5/6 h-4 bg-slate-200 rounded"></div>
                  </div>
                  <div className="mt-6">
                    <div className="w-full h-32 bg-slate-100 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadSection;
