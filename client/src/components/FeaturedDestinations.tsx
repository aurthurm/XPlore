const FeaturedDestinations = () => {
  const destinations = [
    {
      id: 1,
      name: "Victoria Falls",
      description: "One of the world's greatest natural wonders",
      image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 2,
      name: "Hwange National Park",
      description: "Home to over 100 mammal species and 400 bird species",
      image: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 3,
      name: "Matobo Hills",
      description: "Ancient rock formations and historical cave art",
      image: "https://images.unsplash.com/photo-1581959709591-ff773f81d4f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-montserrat font-bold text-2xl md:text-3xl mb-2">Popular Destinations</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">Discover the most visited and beloved attractions across Zimbabwe</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination) => (
            <div key={destination.id} className="group relative overflow-hidden rounded-lg shadow-sm">
              <img 
                src={destination.image} 
                alt={destination.name} 
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-4 w-full">
                <h3 className="text-white font-montserrat font-bold text-xl">{destination.name}</h3>
                <p className="text-slate-200 text-sm">{destination.description}</p>
                <a href="#" className="inline-flex items-center mt-2 text-white text-sm font-medium">
                  Explore <i className="fas fa-chevron-right ml-1 text-xs"></i>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedDestinations;
