module.exports = {
  cookie: {
    originalMaxAge: null,
    expires: null,
    secure: true,
    httpOnly: true,
    domain: 'localhost',
    path: '/'
  },
  csrfSecret: 'XXXXXXXX',
  expires: 99999999,
  screenHasMarriageBroken: 'Yes',
  screenHasRespondentAddress: 'Yes',
  screenHasMarriageCert: 'Yes',
  helpWithFeesNeedHelp: 'Yes',
  helpWithFeesAppliedForFees: 'Yes',
  helpWithFeesReferenceNumber: 'HWF-123-456',
  divorceWho: 'husband',
  marriageIsSameSexCouple: 'No',
  marriageDateDay: 2,
  marriageDateMonth: 2,
  marriageDateYear: 2001,
  marriageDate: '2001-02-02T00:00:00.000Z',
  marriageCanDivorce: true,
  marriageDateIsFuture: false,
  marriageDateMoreThan100: false,
  marriedInUk: 'Yes',
  jurisdictionPath: [
    'JurisdictionHabitualResidence',
    'JurisdictionInterstitial'
  ],
  jurisdictionConnection: [
    'A',
    'C'
  ],
  connections: {
    A: 'The Petitioner and the Respondent are habitually resident in England and Wales',
    C: 'The Respondent is habitually resident in England and Wales'
  },
  jurisdictionPetitionerResidence: 'Yes',
  jurisdictionRespondentResidence: 'Yes',
  jurisdictionConfidentLegal: 'Yes',
  jurisdictionConnectionFirst: 'A',
  petitionerContactDetailsConfidential: 'share',
  petitionerFirstName: 'John',
  petitionerLastName: 'Smith',
  respondentFirstName: 'Jane',
  respondentLastName: 'Jamed',
  marriagePetitionerName: 'John Doe',
  marriageRespondentName: 'Jenny Benny',
  petitionerNameDifferentToMarriageCertificate: 'Yes',
  petitionerNameChangedHow: ['marriageCertificate'],
  petitionerPhoneNumber: '01234567890',
  petitionerConsent: 'Yes',
  petitionerHomeAddress: {
    addressType: 'postcode',
    selectAddressIndex: '0',
    postcode: 'SW9 9PE',
    address: [
      '80 Landor Road',
      'London',
      'SW9 9PE'
    ],
    addressConfirmed: 'true',
    addresses: ['XXXXXXXX'],
    validPostcode: true,
    postcodeError: 'false',
    addressBaseUK: {
      addressLine1: '80 LANDOR ROAD',
      addressLine2: '',
      addressLine3: '',
      postCode: 'SW9 9PE',
      postTown: 'LONDON',
      county: '',
      country: 'UK'
    },
    url: '/petitioner-respondent/address',
    formattedAddress: {
      whereabouts: [
        '80 Landor Road',
        'London'
      ],
      postcode: 'SW9 9PE'
    }
  },
  petitionerCorrespondenceUseHomeAddress: 'Yes',
  petitionerCorrespondenceAddress: {
    addressType: 'postcode',
    selectAddressIndex: '0',
    postcode: 'SW9 9PE',
    address: [
      '80 Landor Road',
      'London',
      'SW9 9PE'
    ],
    addressConfirmed: 'true',
    addresses: ['XXXXXXXX'],
    validPostcode: true,
    postcodeError: 'false',
    addressBaseUK: {
      addressLine1: '80 LANDOR ROAD',
      addressLine2: '',
      addressLine3: '',
      postCode: 'SW9 9PE',
      postTown: 'LONDON',
      county: '',
      country: 'UK'
    },
    url: '/petitioner-respondent/address',
    formattedAddress: {
      whereabouts: [
        '80 Landor Road',
        'London'
      ],
      postcode: 'SW9 9PE'
    }
  },
  livingArrangementsLiveTogether: 'Yes',
  respondentHomeAddress: {
    addressType: 'postcode',
    selectAddressIndex: '0',
    postcode: 'SW9 9PE',
    address: [
      '80 Landor Road',
      'London',
      'SW9 9PE'
    ],
    addressConfirmed: 'true',
    addresses: ['XXXXXXXX'],
    validPostcode: true,
    postcodeError: 'false',
    addressBaseUK: {
      addressLine1: '80 LANDOR ROAD',
      addressLine2: '',
      addressLine3: '',
      postCode: 'SW9 9PE',
      postTown: 'LONDON',
      county: '',
      country: 'UK'
    },
    url: '/petitioner-respondent/address',
    formattedAddress: {
      whereabouts: [
        '80 Landor Road',
        'London'
      ],
      postcode: 'SW9 9PE'
    }
  },
  respondentCorrespondenceUseHomeAddress: 'No',
  respondentCorrespondenceAddress: {
    addressType: 'postcode',
    selectAddressIndex: '0',
    postcode: 'SW9 9PE',
    address: [
      '80 Landor Road',
      'London',
      'SW9 9PE'
    ],
    addressConfirmed: 'true',
    addresses: ['XXXXXXXX'],
    validPostcode: true,
    postcodeError: 'false',
    addressBaseUK: {
      addressLine1: '80 LANDOR ROAD',
      addressLine2: '',
      addressLine3: '',
      postCode: 'SW9 9PE',
      postTown: 'LONDON',
      county: '',
      country: 'UK'
    },
    url: '/petitioner-respondent/respondent-correspondence-address',
    formattedAddress: {
      whereabouts: [
        '80 Landor Road',
        'London'
      ],
      postcode: 'SW9 9PE'
    }
  },
  reasonForDivorce: 'unreasonable-behaviour',
  reasonForDivorceHasMarriageDate: true,
  reasonForDivorceShowAdultery: true,
  reasonForDivorceShowUnreasonableBehaviour: true,
  reasonForDivorceShowTwoYearsSeparation: true,
  reasonForDivorceShowFiveYearsSeparation: true,
  reasonForDivorceShowDesertion: true,
  reasonForDivorceLimitReasons: false,
  reasonForDivorceEnableAdultery: true,
  reasonForDivorceBehaviourDetails: ['My wife is having an affair this week.'],
  legalProceedings: 'Yes',
  legalProceedingsRelated: ['children'],
  legalProceedingsDetails: 'The legal proceeding details',
  financialOrder: 'Yes',
  financialOrderFor: [
    'petitioner',
    'children'
  ],
  claimsCosts: 'Yes',
  reasonForDivorceAdulteryIsNamed: 'No',
  claimsCostsFrom: ['respondent'],
  claimsCostsAppliedForFees: true,
  reasonForDivorceClaiming5YearSeparation: false,
  reasonForDivorceClaimingAdultery: false,
  marriageCertificateFiles: [
    {
      createdBy : 99999,
      createdOn : '2017-12-11',
      lastModifiedBy : 99999,
      modifiedOn : '2017-12-11',
      fileName : 'image.jpg',
      fileUrl : 'XXXXXXXX',
      mimeType : 'image/jpg',
      status : 'OK'
    }
  ]
};