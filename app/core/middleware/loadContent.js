const { get } = require('lodash');

const collapseArrays = (accum, array) => {
  return accum.concat(array);
};

function loadContent(req, res, next) {
  const resourcesToAttach = get(this, 'content.resources', {}); // eslint-disable-line no-invalid-this

  const pairLangsWithNamespaces = lang => {
    const namespaces = Object.keys(resourcesToAttach[lang]);
    return namespaces.map(ns => {
      return { lang, ns };
    });
  };

  const attachResources = (({ lang, ns }) => {
    return { lang, ns, resources: resourcesToAttach[lang][ns].content };
  });

  const langs = Object.keys(resourcesToAttach);

  // creates an array of:
  //   [
  //     { lang: 'en', ns: 'foo', resources: { bar: 'Bar', baz: 'Baz' } }
  //   ]
  const resourceBundles = langs
    .map(pairLangsWithNamespaces)
    .reduce(collapseArrays, [])
    .map(attachResources);

  resourceBundles.forEach(({ lang, ns, resources }) => {
    const overrideExisting = true;
    const deeplyMergeKeys = true;
    req.i18n.addResourceBundle(
      lang,
      ns,
      resources,
      deeplyMergeKeys,
      overrideExisting
    );
  });
  next();
}

module.exports = loadContent;
