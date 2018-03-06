const { flattenDeep } = require('lodash');
const { nextStepsMap } = require('app/services/jurisdictionStepMap');
const { lastResortConnections } = require('app/services/jurisdictionStepMap');
const getJurisdictionContent = require('app/services/jurisdiction/jurisdictionContent');

const setConnections = (ctx, session, step) => {
  const contextAndSession = Object.assign({}, session, ctx);

  const map = nextStepsMap(step);
  const connectionPath = [];
  let connIds = [];
  const connections = {};

  const content = getJurisdictionContent(contextAndSession);

  contextAndSession.jurisdictionPath.forEach(singleStep => {
    const fields = Object.keys(step.steps[singleStep].schemaFile.properties);

    fields.forEach(field => {
      if (contextAndSession[field]) {
        connectionPath.push(contextAndSession[field].toString().toLowerCase());
      }
    });
  });

  try {
    // not too pretty, could be done recursively, but there isn't field key in jurisdiction step map to rely on
    connIds.push(map[connectionPath[0]].connection);
    connIds.push(map[connectionPath[0]][connectionPath[1]].connection);
    connIds.push(map[connectionPath[0]][connectionPath[1]][connectionPath[2]].connection); // eslint-disable-line max-len
    connIds.push(map[connectionPath[0]][connectionPath[1]][connectionPath[2]][connectionPath[3]].connection); // eslint-disable-line max-len
  } catch (error) {
    // none of the above is required, hence empty catch
  }

  if (contextAndSession.jurisdictionLastResort) {
    connIds = [].concat(
      [], ...lastResortConnections(contextAndSession.jurisdictionLastResort)
    );
  }

  connIds = connIds.filter((con, pos, self) => {
    return con && (self.indexOf(con) === pos);
  });

  connIds = flattenDeep(connIds);

  for (const con in connIds) {
    if (con) {
      connections[connIds[con]] = content[`legal${[connIds[con]]}`];
    }
  }

  session.connections = connections;
};

module.exports = { setConnections };
