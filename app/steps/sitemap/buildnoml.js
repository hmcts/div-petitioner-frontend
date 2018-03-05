function nomlStatement(link) {
  const source = link.source.id;
  const target = link.target.id;
  return `[${source}] -> [${target}]`;
}

module.exports = ({ links, nodes }) => {
  function selectNodes(link) {
    return Object.assign({}, {
      source: nodes.find(n => n.id === link.source),
      target: nodes.find(n => n.id === link.target)
    });
  }

  const statements = links.map(selectNodes)
    .map(nomlStatement);

  return statements.join('\n');
};
