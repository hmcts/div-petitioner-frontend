const feeTypes = {
  applicationFee: 'petition-issue-fee',
  amendFee: 'amend-fee',
  defendPetitionFee: 'defended-petition-fee',
  generalAppFee: 'general-application-fee',
  enforcementFee: 'enforcement-fee',
  appFinancialOrderFee: 'application-financial-order-fee',
  appWithoutNoticeFee: 'application-without-notice-fee'
};

const mockFeeResponse = (feeType = '') => {
  switch (feeType) {
  case feeTypes.amendFee:
    return {
      feeCode: 'FEE0269',
      version: 1,
      amount: 95
    };
  case feeTypes.defendPetitionFee:
    return {
      feeCode: 'FEE0307',
      version: 1,
      amount: 50
    };
  case feeTypes.generalAppFee:
    return {
      feeCode: 'FEE0428',
      version: 1,
      amount: 110
    };
  case feeTypes.appFinancialOrderFee:
    return {
      feeCode: 'FEE0643',
      amount: 255,
      version: 1
    };
  case feeTypes.appWithoutNoticeFee:
    return {
      feeCode: 'FEE0640',
      version: 1,
      amount: 50
    };
  case feeTypes.enforcementFee:
    return {
      feeCode: 'FEE0424',
      version: 1,
      amount: 245
    };
  default:
    return {
      feeCode: 'FEE0002',
      version: 4,
      amount: 550
    };
  }
};


const get = () => {
  return new Promise(resolve => {
    resolve(mockFeeResponse());
  });
};

const getFee = feeType => {
  return new Promise(resolve => {
    resolve(mockFeeResponse(feeType));
  });
};


module.exports = { get, getFee, mockFeeResponse };