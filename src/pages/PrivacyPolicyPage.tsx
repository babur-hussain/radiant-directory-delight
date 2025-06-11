import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Privacy Policy
        </h1>

        <div className="space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700">
              We value your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and protect your data when you interact with our services.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              2. Information We Collect
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Name</li>
              <li>Phone Number</li>
              <li>Email Address</li>
              <li>Payment Information</li>
              <li>Usage Data (e.g., browsing behavior, purchase history)</li>
            </ul>
          </section>

          {/* Purpose of Data Collection */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              3. Purpose of Data Collection
            </h2>
            <p className="text-gray-700 mb-4">We collect your data to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Process payments and subscriptions</li>
              <li>Provide customer support</li>
              <li>Maintain and improve our services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              4. Third-Party Services
            </h2>
            <p className="text-gray-700">
              We may use third-party services like payment gateways (e.g., Razorpay, PhonePe) and analytics tools (e.g., Google Analytics). These services may collect information as per their own privacy policies.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              5. Data Retention
            </h2>
            <p className="text-gray-700">
              We retain your data for as long as necessary to fulfill the purposes for which it was collected or as required by law.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              6. Data Security
            </h2>
            <p className="text-gray-700">
              We implement appropriate security measures to protect your information from unauthorized access, alteration, or disclosure.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              7. Your Rights
            </h2>
            <p className="text-gray-700">
              You may contact us to review, update, or delete your personal data.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              8. Contact
            </h2>
            <p className="text-gray-700">
              If you have any questions about our Privacy Policy, reach out to us at:
            </p>
            <div className="mt-2 space-y-2 text-gray-700">
              <p>📧 <a href="mailto:growbharatvyapaar@gmail.com" className="text-primary hover:underline">growbharatvyapaar@gmail.com</a></p>
              <p>📞 <a href="tel:+916232571406" className="text-primary hover:underline">+91 62325 71406</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage; 