const nextStepsMap = step => {
  return {

    both: {

      both: {

        yes: {

          step: step.PetitionerConfidential,
          connection: ['D', 'E']
        },
        no: {

          yes: {

            step: step.PetitionerConfidential,
            connection: 'E'
          },
          no: { step: step.PetitionerConfidential },
          step: step.JurisdictionLast6Months
        },

        step: step.JurisdictionLast12Months,
        connection: 'F'
      },

      petitioner: {

        yes: {

          step: step.PetitionerConfidential,
          connection: ['D', 'E']
        },
        no: {

          yes: {

            step: step.PetitionerConfidential,
            connection: 'E'
          },
          no: { step: step.PetitionerConfidential },
          step: step.JurisdictionLast6Months
        },

        step: step.JurisdictionLast12Months
      },
      respondent: {

        yes: {

          step: step.PetitionerConfidential,
          connection: 'D'
        },
        no: { step: step.PetitionerConfidential },
        step: step.JurisdictionLast12Months
      },
      neither: {

        yes: {

          step: step.PetitionerConfidential,
          connection: 'D'
        },
        no: { step: step.PetitionerConfidential },

        step: step.JurisdictionLast12Months
      },
      connection: 'A'
    },
    petitioner: {

      both: {

        yes: {

          step: step.PetitionerConfidential,
          connection: ['D', 'E']
        },
        no: {

          yes: {

            step: step.PetitionerConfidential,
            connection: 'E'
          },
          no: { step: step.PetitionerConfidential },
          step: step.JurisdictionLast6Months
        },

        step: step.JurisdictionLast12Months,
        connection: 'F'
      },
      petitioner: {

        yes: {

          step: step.PetitionerConfidential,
          connection: ['D', 'E']
        },
        no: {

          yes: {

            step: step.PetitionerConfidential,
            connection: 'E'
          },
          no: { step: step.LastResort },
          step: step.JurisdictionLast6Months
        },

        step: step.JurisdictionLast12Months
      },
      respondent: {

        yes: {

          step: step.PetitionerConfidential,
          connection: 'D'
        },
        no: { step: step.LastResort },
        step: step.JurisdictionLast12Months
      },
      neither: {

        yes: {

          step: step.PetitionerConfidential,
          connection: 'D'
        },
        no: { step: step.LastResort },
        step: step.JurisdictionLast12Months
      }
    },
    respondent: {

      both: {

        step: step.PetitionerConfidential,
        connection: 'F'
      },
      petitioner: { step: step.PetitionerConfidential },
      respondent: { step: step.PetitionerConfidential },
      neither: { step: step.PetitionerConfidential },
      connection: 'C'
    },

    neither: {

      both: {

        step: step.PetitionerConfidential,
        connection: 'F'
      },
      petitioner: { step: step.LastResort },
      respondent: { step: step.LastResort },
      neither: { step: step.LastResort }
    }
  };
};

const getConnectionLetters = con => {
  switch (con) {
  case 'bothResident':
    return ['A'];
  case 'oneOfResident':
    return ['B'];
  case 'respondentResident':
    return ['C'];
  case 'petitionerResident':
    return ['A', 'D'];
  case 'petitionerResidentAndDomiciled':
    return ['E'];
  case 'bothDomiciled':
    return ['F'];
  default:
    return [];
  }
};

const lastResortConnections = selection => {
  return selection.reduce((connections, con) => {
    return connections.concat(getConnectionLetters(con));
  }, []);
};

module.exports = { lastResortConnections, nextStepsMap };
