import React from 'react';

const ReturnPolicyPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Return Policy
        </h1>

        <div className="space-y-8">
          {/* Digital Services */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              1. Digital Services
            </h2>
            <p className="text-gray-700">
              As a digital directory service, our products and services are non-returnable once delivered. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
              <li>Business listings</li>
              <li>Digital content</li>
              <li>Premium features</li>
              <li>Subscription services</li>
            </ul>
          </section>

          {/* Cancellation Policy */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              2. Cancellation Policy
            </h2>
            <p className="text-gray-700">
              While digital services cannot be returned, you may cancel your subscription:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
              <li>Within 48 hours of purchase for a full refund (minus registration fee)</li>
              <li>After 48 hours, no refunds are provided</li>
              <li>Future billing cycles can be cancelled at any time</li>
            </ul>
          </section>

          {/* Service Issues */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              3. Service Issues
            </h2>
            <p className="text-gray-700">
              If you experience technical issues with our services:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
              <li>Contact our support team immediately</li>
              <li>We will work to resolve the issue</li>
              <li>Service credits may be provided for extended outages</li>
            </ul>
          </section>

          {/* Quality Assurance */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              4. Quality Assurance
            </h2>
            <p className="text-gray-700">
              We maintain high standards for our services:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
              <li>Regular quality checks</li>
              <li>Continuous service monitoring</li>
              <li>Proactive issue resolution</li>
            </ul>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              5. Contact for Support
            </h2>
            <div className="mt-2 space-y-2 text-gray-700">
              <p>For return and cancellation inquiries:</p>
              <p>📧 <a href="mailto:growbharatvyapaar@gmail.com" className="text-primary hover:underline">growbharatvyapaar@gmail.com</a></p>
              <p>📞 <a href="tel:+916232571406" className="text-primary hover:underline">+91 62325 71406</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicyPage; 