function nomlStatement(link) {
  const source = link.source.id;
  const target = link.target.id;
  return `[${source}] -> [${target}]`;
}

module.exports = ({ links, nodes }) => {
  function selectNodes(link) {
    const source = nodes.find(({ id }) => {
      return id === link.source;
    });
    const target = nodes.find(({ id }) => {
      return id === link.target;
    });

    return Object.assign({}, {
      source,
      target
    });
  }

  const statements = links.map(selectNodes)
    .map(nomlStatement);

  return statements.join('\n');
};
