import React from 'react';

const TermsAndConditionsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Terms and Conditions
        </h1>

        <div className="space-y-8">
          <section>
            <p className="text-gray-700 mb-4">
              Welcome to our platform! These Terms and Conditions govern your use of our website and services. By accessing or using our platform, you agree to be bound by these terms. Please read them carefully.
            </p>
            <p className="text-gray-700">
              This platform is owned and operated by <span className="font-semibold text-primary">NIHAL SURYAWANSHI</span>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              1. Payment and Subscription Terms
            </h2>
            
            <ol className="list-decimal pl-6 space-y-4">
              <li className="text-gray-700">
                <span className="font-semibold">Payment Gateway:</span> All payments for our services are processed securely through our designated payment gateway.
              </li>
              
              <li className="text-gray-700">
                <span className="font-semibold">Package Purchase:</span> By purchasing any package or subscription from our platform, you agree to be bound by these terms and the specific terms related to that package.
              </li>
              
              <li className="text-gray-700">
                <span className="font-semibold">Subscription Fees:</span> For recurring packages, your subscription fee (including package amount and maintenance cost) will be automatically deducted monthly. The registration cost is a one-time deduction.
              </li>
              
              <li className="text-gray-700">
                <span className="font-semibold">Subscription Period:</span> The standard subscription period for our packages is one (1) year from the date of purchase, unless otherwise specified.
              </li>
              
              <li className="text-gray-700">
                <span className="font-semibold">Automatic Payment Authorization:</span> By subscribing, you authorize us to automatically deduct the agreed-upon monthly installments from your chosen payment method.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              2. Cancellation and Refunds
            </h2>
            <ol className="list-decimal pl-6 space-y-4">
              <li className="text-gray-700">
                <span className="font-semibold">Cancellation Window:</span> You may cancel your package within 48 hours of the initial purchase for a partial refund.
              </li>
              
              <li className="text-gray-700">
                <span className="font-semibold">Cancellation Fee:</span> If you cancel within 48 hours, your initial registration fee is non-refundable and will be deducted from any refund amount.
              </li>
              
              <li className="text-gray-700">
                <span className="font-semibold">Post-48 Hour Cancellation:</span> Cancellations made after 48 hours of purchase are not eligible for any refund. You will be liable for the full package amount for the remaining term.
              </li>
              
              <li className="text-gray-700">
                <span className="font-semibold">Refund Processing:</span> Approved refunds will be processed and credited to your original payment method within 7-10 working days.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              3. Dispute Resolution
            </h2>
            <p className="text-gray-700">
              Any disputes arising from the use of our services or these Terms and Conditions will be resolved in accordance with the laws and jurisdiction applicable to the location of our operations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              4. Contact Information
            </h2>
            <div className="mt-2 space-y-2 text-gray-700">
              <p>
                For any questions or concerns regarding these Terms and Conditions, please contact us:
              </p>
              <p>
                Owner Name: <span className="font-semibold">NIHAL SURYAWANSHI</span>
              </p>
              <p>
                Email: <a href="mailto:growbharatvyapaar@gmail.com" className="text-primary hover:underline">growbharatvyapaar@gmail.com</a>
              </p>
              <p>
                Phone: <a href="tel:+916232571406" className="text-primary hover:underline">+91 62325 71406</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsPage; 