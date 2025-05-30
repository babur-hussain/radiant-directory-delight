import React from 'react';
interface PopularSearchTermsProps {
  onTermClick: (term: string) => void;
}
const PopularSearchTerms: React.FC<PopularSearchTermsProps> = ({
  onTermClick
}) => {
  const popularTerms = ['Restaurants', 'Hotels', 'Coffee', 'Gyms', 'Doctors', 'Auto'];
  const handleTermClick = (term: string) => {
    console.log("Popular term clicked:", term);
    onTermClick(term);
  };
  return;
};
export default PopularSearchTerms;