const nomnoml = require('nomnoml');

window.initStep = function (graph, graphData) {

    document.addEventListener('DOMContentLoaded', function () {

        var sitemap = document.querySelector('body');
        sitemap.innerHTML = nomnoml.renderSvg(graph);

        var mapsvg = sitemap.children[0];
        var bounds = mapsvg.getBBox();
        sitemap.style.height = '' + ( bounds.height + 500 ) + 'px';
        sitemap.style.width = '' + ( bounds.width + 100 ) + 'px';
        sitemap.style.maxWidth = '' + ( bounds.width + 100 ) + 'px';
    });

    document.addEventListener('click', function (e) {

        var element = null;

        if (e.target.nodeName === 'text') {

            element = e.target;
        }

        if (e.target.nodeName === 'rect') {

            element = e.target.nextSibling ? e.target.nextSibling.nextSibling : null;
        }

        if (element) {

            var node = graphData.nodes.find(function (n) {
                return n.id === element.innerHTML;
            });

            window.location.href = node.slug;
        }
    });

};
