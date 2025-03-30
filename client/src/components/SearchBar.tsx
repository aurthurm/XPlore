import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SearchBar = () => {
  const [keyword, setKeyword] = useState("");
  const [location, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/?keyword=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const handleNearMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          navigate(`/?nearMe=true&latitude=${latitude}&longitude=${longitude}`);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get your location. Please check your browser settings.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 relative">
          <Input 
            type="text" 
            placeholder="Search for places, attractions, or activities" 
            className="pr-10 h-10"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <span className="absolute right-3 top-2.5 text-slate-400">
            <i className="fas fa-search"></i>
          </span>
        </div>
        <div className="flex space-x-2">
          <Button type="submit" className="w-full md:w-auto">
            Search
          </Button>
          <Button 
            type="button" 
            onClick={handleNearMe}
            className="w-full md:w-auto"
          >
            <i className="fas fa-map-marker-alt mr-2"></i>Near Me
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
