import React from 'react';

const TermsAndConditionsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Terms and Conditions
        </h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-primary mb-4">
            Payment Integration Terms and Conditions
          </h2>
          
          <ol className="list-decimal pl-6 space-y-4">
            <li className="text-gray-700">
              <span className="font-semibold">Payment Gateway:</span> Payments can be made through our website's payment gateway.
            </li>
            
            <li className="text-gray-700">
              <span className="font-semibold">Package Purchase:</span> By purchasing our package, you agree to use our services.
            </li>
            
            <li className="text-gray-700">
              <span className="font-semibold">Cancellation Process:</span> If you wish to cancel your package, you must notify us within 48 hours.
            </li>
            
            <li className="text-gray-700">
              <span className="font-semibold">Cancellation Fee:</span> If you cancel your package, your registration fee will be deducted, regardless of the cancellation timeframe.
            </li>
            
            <li className="text-gray-700">
              <span className="font-semibold">Subscription Fee:</span> If you do not cancel your package, your subscription fee will be deducted every month, which includes the package amount, maintenance cost, but excludes the registration cost (as it is a one-time deduction).
            </li>
            
            <li className="text-gray-700">
              <span className="font-semibold">Maintenance Fee:</span> Your maintenance fee will be deducted every month, as part of the subscription fee.
            </li>
            
            <li className="text-gray-700">
              <span className="font-semibold">Subscription Period:</span> Your subscription period will be for a limited time of one (1) year from the date of purchase.
            </li>
            
            <li className="text-gray-700">
              <span className="font-semibold">Payment Terms:</span> The package amount will be divided into monthly installments of ₹999 (or other package amounts) and will be automatically deducted from your payment method every month.
            </li>
            
            <li className="text-gray-700">
              <span className="font-semibold">Cancellation Policy:</span> You can cancel your package within 48 hours of purchase. If you cancel after 48 hours, you will be required to pay the full package amount for the remaining term.
            </li>
            
            <li className="text-gray-700">
              <span className="font-semibold">Refund Policy:</span> If you cancel your package within 48 hours, you will receive a refund of the package amount minus the registration fee. If you cancel after 48 hours, no refund will be provided.
            </li>
            
            <li className="text-gray-700">
              <span className="font-semibold">Automatic Payment:</span> By purchasing our package, you authorize us to automatically deduct the monthly installment from your payment method every month.
            </li>
            
            <li className="text-gray-700">
              <span className="font-semibold">Dispute Resolution:</span> Any disputes will be resolved according to our website's terms and conditions.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsPage; 