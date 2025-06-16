import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Privacy Policy
        </h1>

        <div className="space-y-8">
          {/* Information Collection */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              1. Information We Collect
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Personal information (name, email, phone number)</li>
              <li>Business information (company details, services)</li>
              <li>Payment information (processed securely through our payment partners)</li>
              <li>Usage data (how you interact with our platform)</li>
            </ul>
          </section>

          {/* Information Usage */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>To provide and maintain our services</li>
              <li>To process your payments and subscriptions</li>
              <li>To communicate with you about our services</li>
              <li>To improve our platform and user experience</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              3. Information Sharing
            </h2>
            <p className="text-gray-700">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
              <li>Service providers who assist in our operations</li>
              <li>Payment processors for transaction handling</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              4. Data Security
            </h2>
            <p className="text-gray-700">
              We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              5. Your Rights
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              6. Contact Us
            </h2>
            <div className="mt-2 space-y-2 text-gray-700">
              <p>For privacy-related inquiries:</p>
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