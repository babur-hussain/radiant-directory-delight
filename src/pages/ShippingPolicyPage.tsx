import React from 'react';

const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Shipping Policy
        </h1>

        <div className="space-y-8">
          {/* Digital Services */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              1. Digital Services Delivery
            </h2>
            <p className="text-gray-700">
              As a digital directory service, our products and services are delivered electronically. Upon successful payment:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
              <li>Business listings are activated immediately</li>
              <li>Access credentials are sent via email</li>
              <li>Digital content is available through your account dashboard</li>
            </ul>
          </section>

          {/* Processing Time */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              2. Processing Time
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Standard listings: Activated within 24 hours</li>
              <li>Premium listings: Activated within 12 hours</li>
              <li>Custom packages: Processing time varies based on requirements</li>
            </ul>
          </section>

          {/* Delivery Methods */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              3. Delivery Methods
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Email notifications</li>
              <li>Account dashboard access</li>
              <li>Digital content downloads</li>
              <li>API access (where applicable)</li>
            </ul>
          </section>

          {/* Service Availability */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              4. Service Availability
            </h2>
            <p className="text-gray-700">
              Our digital services are available 24/7, subject to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
              <li>Internet connectivity</li>
              <li>System maintenance windows</li>
              <li>Technical requirements</li>
            </ul>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              5. Contact for Support
            </h2>
            <div className="mt-2 space-y-2 text-gray-700">
              <p>For delivery-related inquiries:</p>
              <p>📧 <a href="mailto:growbharatvyapaar@gmail.com" className="text-primary hover:underline">growbharatvyapaar@gmail.com</a></p>
              <p>📞 <a href="tel:+916232571406" className="text-primary hover:underline">+91 62325 71406</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicyPage; 