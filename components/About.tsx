
import React from 'react';

export const About: React.FC = () => {
  return (
    <div className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:flex lg:items-center lg:space-x-12">
          <div className="lg:w-1/2 relative mb-12 lg:mb-0">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-100 rounded-full mix-blend-multiply opacity-50"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl z-10">
              <img 
                src="https://picsum.photos/800/800?office=2" 
                alt="Modern office space" 
                className="w-full h-auto"
              />
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <h2 className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-4">About the Company</h2>
            <h3 className="text-4xl font-extrabold text-gray-900 mb-6">Redefining excellence in professional services since 2008.</h3>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Founded on the principles of transparency and innovation, ProBiz has grown from a boutique firm to a leading global agency. We believe that professional services should be as dynamic as the industries they support.
            </p>
            
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div>
                <span className="block text-4xl font-extrabold text-blue-600 mb-2">98%</span>
                <span className="text-gray-500 font-medium">Client satisfaction rate globally.</span>
              </div>
              <div>
                <span className="block text-4xl font-extrabold text-blue-600 mb-2">500+</span>
                <span className="text-gray-500 font-medium">Expert consultants on demand.</span>
              </div>
            </div>

            <button className="bg-gray-100 text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors">
              Read Our Full Story
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
