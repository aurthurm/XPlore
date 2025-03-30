import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center mb-4">
              <span className="text-white text-2xl mr-2"><i className="fas fa-map-marked-alt"></i></span>
              <span className="font-montserrat font-bold text-xl">ZimExplore</span>
            </div>
            <p className="text-slate-400 mb-4">Your comprehensive guide to exploring Zimbabwe's beauty, culture, and attractions.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Explore</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-slate-400 hover:text-white transition-colors">Destinations</Link></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Accommodations</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Dining</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Activities</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Events</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">For Business</h3>
            <ul className="space-y-2">
              <li><Link href="/claim" className="text-slate-400 hover:text-white transition-colors">Add Your Business</Link></li>
              <li><Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">Business Dashboard</Link></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Advertising</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Success Stories</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Resources</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-2 text-slate-400"></i>
                <span className="text-slate-400">123 Tourism Lane, Harare, Zimbabwe</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-phone-alt mr-2 text-slate-400"></i>
                <span className="text-slate-400">+263 123 456 789</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-envelope mr-2 text-slate-400"></i>
                <span className="text-slate-400">info@zimexplore.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-slate-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} ZimExplore. All rights reserved.
          </div>
          <div className="flex space-x-4 text-sm">
            <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">Cookie Policy</a>
            <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
