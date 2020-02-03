const d3_place_svg = function(svg_str, svg_node, x, y, img_size) {
    let svg_g = svg_node.insert('g')
                          .attr('transform', 'translate('
                            + (x - img_size / 2) + ','
                            + (y - img_size / 2) + ')')
                        .html(svg_str);
    return svg_g
}

const d3_place_label = function(svg_node, text, x, y, clazz = '') {
    return svg_node.append('text')
        .attr('class', clazz)
        .attr('visibility', 'visible')
        .attr('transform', 'translate(' + x + ',' + y + ')').text(text);
}

const d3_dash_rxn = function(svg_rxn_node, dash_config = '5,5') {
    svg_rxn_node.selectAll('.segment-group')
                .each(function(ox) {
        d3.select(this)
          .selectAll('path').each(function(svg_path) {
            d3.select(this).attr('stroke-dasharray', dash_config)
            //console.log(d3.select(this).node())
        })
    })
}