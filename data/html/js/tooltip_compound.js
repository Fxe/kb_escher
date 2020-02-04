var render_tooltip_compound = function(refs, data, svg_data, container, width = '800px') {
  seed_ids = []
  if (refs['seed.compound']) {
    seed_ids = refs['seed.compound']
  }
  
  console.log('render_tooltip_compound', seed_ids);

  let top_right_label = $('<div>', {'class' : 'top-right'}).append(
    $('<div>', {'class' : 'type-label'}).html('Metabolite'))

  container.html("")
  var base_container = $('<div>', {'style' : "width : " + width, 'class' : 'default-tooltip'})
  base_container.append('Metabolite').append($('<div>', {'class' : 'id'}).html(data.id))
    .append($('<div>', {'class' : 'name'}).html('name: ' + data.name))
    .append($('<div>', {'class' : 'smiles'}).html('smiles: ' + data.smiles))
    .append($('<div>', {'class' : 'name'}).html('aliases: ' + data.aliases))
  base_container.append(top_right_label);

  base_container.append(svg_data);

  container.append(base_container);
}