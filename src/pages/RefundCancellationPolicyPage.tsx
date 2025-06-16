import React from 'react';

const RefundCancellationPolicyPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Refund & Cancellation Policy
        </h1>

        <div className="space-y-8">
          {/* Cancellation Window */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              1. Cancellation Window
            </h2>
            <p className="text-gray-700">
              You may cancel your package within 48 hours of purchase.
            </p>
          </section>

          {/* Cancellation Fee */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              2. Cancellation Fee
            </h2>
            <p className="text-gray-700">
              Upon cancellation, a one-time registration fee will be deducted, regardless of cancellation time.
            </p>
          </section>

          {/* Post-48 Hour Cancellation */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              3. Post-48 Hour Cancellation
            </h2>
            <p className="text-gray-700">
              Cancellations after 48 hours are not eligible for a refund. The full remaining subscription amount will be payable.
            </p>
          </section>

          {/* Refund Terms */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              4. Refund Terms
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Cancellation within 48 hours: Refund = Package amount - Registration fee</li>
              <li>Cancellation after 48 hours: No refund</li>
              <li>If the refund is approved, it will be credited to the original payment mode within 7-10 working days.</li>
            </ul>
          </section>

          {/* Subscription Structure */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              5. Subscription Structure
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Monthly installment: ₹999 (or as per package)</li>
              <li>Auto-deducted every month</li>
              <li>Subscription includes package and maintenance fee</li>
              <li>Registration fee is non-refundable</li>
            </ul>
          </section>

          {/* Auto-Renewal Consent */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              6. Auto-Renewal Consent
            </h2>
            <p className="text-gray-700">
              By subscribing, you authorize monthly automatic payments through your selected payment method.
            </p>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              7. Dispute Resolution
            </h2>
            <p className="text-gray-700">
              All disputes will be governed by our website's Terms & Conditions.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">
              8. Contact for Refunds/Cancellations
            </h2>
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

export default RefundCancellationPolicyPage; 