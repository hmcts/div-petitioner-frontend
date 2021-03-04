const organisations = [
  {
    contactInformation: [
      {
        addressLine1: "1 Trasna way",
        addressLine2: "Lurgan",
        addressLine3: "",
        country: "United Kingdom",
        county: "Armagh",
        postCode: "BT25 545",
        townCity: "Craigavon"
      }
    ],
    name: "Ernser Inc",
    organisationIdentifier: "21-3701590"
  },
  {
    contactInformation: [
      {
        addressLine1: "10 Lakeview",
        addressLine2: "Crumlin",
        addressLine3: "",
        country: "United Kingdom",
        county: "Down",
        postCode: "BT21 525",
        townCity: "Ballymena"
      }
    ],
    name: "Zboncak and Sons",
    organisationIdentifier: "25-3701590"
  },
];

module.exports = {
  getOrganisationByName: () => {
    return new Promise(resolve => {
      resolve(organisations);
    });
  }
}