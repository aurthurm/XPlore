import SearchBar from "./SearchBar";

const HeroSection = () => {
  return (
    <section className="relative bg-slate-900 text-white">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/70">
        <img 
          src="https://images.unsplash.com/photo-1628756498100-f471dc52f823?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
          alt="Victoria Falls in Zimbabwe" 
          className="w-full h-full object-cover mix-blend-overlay"
        />
      </div>
      
      <div className="container mx-auto px-4 py-12 md:py-24 relative z-10">
        <div className="max-w-3xl">
          <h1 className="font-montserrat font-bold text-3xl md:text-5xl mb-4">
            Discover Zimbabwe's Hidden Treasures
          </h1>
          <p className="text-lg md:text-xl mb-8 text-slate-200">
            Explore the beauty of Zimbabwe with our comprehensive tourism directory. Find the best places to stay, eat, and explore.
          </p>
          
          <SearchBar />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
