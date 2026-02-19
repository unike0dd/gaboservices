
import React from 'react';

export const Contact: React.FC = () => {
  return (
    <div className="py-24 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-blue-400 font-bold tracking-widest uppercase text-sm mb-4">Contact Us</h2>
          <h3 className="text-4xl font-extrabold sm:text-5xl">Ready to start your journey?</h3>
          <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto">
            Contact our experts today for a free initial consultation.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
          <div className="md:w-1/3 bg-blue-600 p-12 text-white flex flex-col justify-between">
            <div>
              <h4 className="text-2xl font-bold mb-6">Contact Info</h4>
              <div className="space-y-6">
                <div className="flex items-start">
                  <svg className="w-6 h-6 mr-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>123 Global Plaza, Financial District, NY 10001</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 mr-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>consult@probiz.com</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 mr-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+1 (888) PRO-BIZ-10</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-8">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center hover:bg-blue-400 cursor-pointer transition-colors">f</div>
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center hover:bg-blue-400 cursor-pointer transition-colors">t</div>
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center hover:bg-blue-400 cursor-pointer transition-colors">in</div>
            </div>
          </div>

          <div className="md:w-2/3 p-12 text-gray-900">
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                  <input type="text" className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-600 transition-all" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                  <input type="text" className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-600 transition-all" placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input type="email" className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-600 transition-all" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                <textarea rows={4} className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-600 transition-all" placeholder="How can we help you?"></textarea>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-200">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
