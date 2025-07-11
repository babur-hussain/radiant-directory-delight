import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react';
const Footer = () => {
  return <footer className="bg-white border-t border-gray-100">
      <div className="container max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {/* Logo and Info */}
          <div className="col-span-1 lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-bold text-2xl bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                Grow Bharat Vyapaar
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-500 max-w-md">
              Your one-stop directory for discovering local businesses, services, and professionals in your area. Find, connect, and engage with the best options near you.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-smooth" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-smooth" aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-smooth" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-smooth" aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-smooth" aria-label="YouTube">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Useful Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-500 hover:text-primary transition-smooth">
                  Home
                </Link>
              </li>
              {/* <li>
                <Link to="/categories" className="text-sm text-gray-500 hover:text-primary transition-smooth">
                  Categories
                </Link>
              </li> */}
              <li>
                <Link to="/businesses" className="text-sm text-gray-500 hover:text-primary transition-smooth">
                  Businesses
                </Link>
              </li>
              <li>
                <Link to="/influencers" className="text-sm text-gray-500 hover:text-primary transition-smooth">
                  Influencers
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-gray-500 hover:text-primary transition-smooth">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Policies
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/terms-and-conditions" className="text-sm text-gray-500 hover:text-primary transition-smooth">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-sm text-gray-500 hover:text-primary transition-smooth">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-cancellation-policy" className="text-sm text-gray-500 hover:text-primary transition-smooth">
                  Refund & Cancellation
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Categories Section */}
          {/* <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Top Categories
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/category/restaurants" className="text-sm text-gray-500 hover:text-primary transition-smooth">
                  Restaurants
                </Link>
              </li>
              <li>
                <Link to="/category/hotels" className="text-sm text-gray-500 hover:text-primary transition-smooth">
                  Hotels
                </Link>
              </li>
              <li>
                <Link to="/category/shopping" className="text-sm text-gray-500 hover:text-primary transition-smooth">
                  Shopping
                </Link>
              </li>
              <li>
                <Link to="/category/education" className="text-sm text-gray-500 hover:text-primary transition-smooth">
                  Education
                </Link>
              </li>
            </ul>
          </div> */}

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Contact Us
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                <span className="text-sm text-gray-500">Head Office: Delhi &amp; Branch Office: Bhopal, MP Nagar Zone 2</span>
              </li>
              <li className="flex items-center">
                
                
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                <a href="mailto:support@growbharatvyapaar.com" className="text-sm text-gray-500 hover:text-primary transition-smooth">
                  support@growbharatvyapaar.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-sm text-center text-gray-400">
            © {new Date().getFullYear()} Grow Bharat Vyapaar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>;
};
export default Footer;