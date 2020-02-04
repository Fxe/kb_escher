var databases = {
  'seed.reaction' : 'https://identifiers.org/seed.reaction/'
}

var cluster_trigger = false;

var ortholog_create_control_group = function(opts, def_opt, data, ret_controls) {
    var base = $('<div>', {'class' : 'btn-group btn-group-toggle', 'data-toggle' : 'buttons'})
    _.each(opts, function(k, v) {
        label_class = {'class' : 'btn btn-seed-sm btn-warning'}
        if (def_opt === v) {
            label_class['class'] += ' active'
        }
        var label = $('<label>', label_class)
        var input = $('<input>', {'type' : 'radio', 'name' : 'options', 'autocomplete' : 'off'})
        var icon = $('<i>', {'class' : k})
        label.append(input)
        label.append(icon)
        if (ret_controls) {
          ret_controls[v] = label;
        }
        /*
        label.on("click", function(e, clicke_par) {
          console.log('single click', e, clicke_par);
        });

         */
        label.on("change", function(e) {
          //console.log(cluster_trigger, data)
          if (!cluster_trigger) {
            console.log('change controlgroup', k, v, $(this).attr('class'))
            if (toggle_comment) {
              $('#button_save_with_comment').click(function () {
                let comment = $('#text_comment').val();
                if (!comment) {
                  comment = '';
                }
                api.post_template_reaction_gene(env.config.target_template, data['target_reaction_id'], {
                  'genome_id' : data['target_genome_id'],
                  'gene_id' : data['target_gene_id'],
                  'user_id' : env.config.user,
                  'logic' : v,
                  'desc' : comment,
                }, function(o) {
                  console.log('post_template_reaction_gene', o);
                });
                $('#modal_comment').modal('hide')
              });

              $('#modal_label_reaction').html(data['target_reaction_id']);
              $('#modal_label').html('<i class="' + k + '"></i> ' + data['target_gene_id'] + ': ' + data['gene_function']);
              $('#text_comment').val('');
              $('#modal_comment').modal('show');
            } else {
              //template_id, rxn_id, params, fn_success, fn_always, fn_error) {
              api.post_template_reaction_gene(env.config.target_template, data['target_reaction_id'], {
                'genome_id' : data['target_genome_id'],
                'gene_id' : data['target_gene_id'],
                'user_id' : env.config.user,
                'logic' : v,
                'desc' : '',
              }, function(o) {
                console.log('post_template_reaction_gene', o);
              });
            }
            //if($(this).hasClass('active')) { console.log('check', v)}
          } else {
            console.log('skip')
          }

        });
        
        base.append(label)
    })
    
    return base;
}



var ortholog_create_top_control_group = function(opts, def_opt, data) {
  var base = $('<div>', {'class' : 'btn-group btn-group-toggle', 'data-toggle' : 'buttons'})
  let created_controls = {}
  _.each(opts, function(k, v) {
    label_class = {'class' : 'btn btn-seed-sm btn-warning'}
    if (def_opt === v) {
      label_class['class'] += ' active'
    }
    var label = $('<label>', label_class)
    var input = $('<input>', {'type' : 'radio', 'name' : 'options', 'autocomplete' : 'off'})
    var icon = $('<i>', {'class' : k})
    label.append(input)
    label.append(icon)
    created_controls[v] = label



    label.on("change", function(e) {
      cluster_trigger = true
      //console.log('kkkk')
      //console.log('change top group', 'key:', k, 'value', v, $(this).attr('class'))
      console.log('cluster change top group', 'key:', k, 'value', v, data);
      if (toggle_comment) {

        $('#button_save_with_comment').click(function () {
          let comment = $('#text_comment').val();
          if (!comment) {
            comment = data['ortholog_id'];
          } else {
            comment = data['ortholog_id'] + ':' + comment
          }
          _.each(data['ortholog_data'], function(genome_genes, genome_id) {
            _.each(genome_genes, function(f_str, gene_id) {
              console.log(genome_id, gene_id, v);
              api.post_template_reaction_gene(env.config.target_template, data['target_reaction_id'], {
                'ortholog_id' : data['ortholog_id'],
                'genome_id' : genome_id,
                'gene_id' : gene_id,
                'user_id' : env.config.user,
                'logic' : v,
                'desc' : comment,
              }, function(o) {
                console.log('post_template_reaction_gene', o);
              });
            });
          });
          api.post_template_reaction_gene(env.config.target_template, data['target_reaction_id'], {
            'ortholog_id' : data['ortholog_id'],
            'genome_id' : data['target_genome_id'],
            'gene_id' : data['target_gene_id'],
            'user_id' : env.config.user,
            'logic' : v,
            'desc' : comment,
          }, function(o) {
            console.log('post_template_reaction_gene', o);
          });
          $('#modal_comment').modal('hide')
        });

        $('#modal_label_reaction').html(data['target_reaction_id']);
        // + ': ' + data['ortholog_data']
        $('#modal_label').html('<i class="' + k + '"></i> ' + data['ortholog_id']);
        $('#text_comment').val('');
        $('#modal_comment').modal('show');


      } else {
        _.each(data['ortholog_data'], function(genome_genes, genome_id) {
          _.each(genome_genes, function(f_str, gene_id) {
            console.log(genome_id, gene_id, v);
            api.post_template_reaction_gene(env.config.target_template, data['target_reaction_id'], {
              'ortholog_id' : data['ortholog_id'],
              'genome_id' : genome_id,
              'gene_id' : gene_id,
              'user_id' : env.config.user,
              'logic' : v,
              'desc' : data['ortholog_id'],
            }, function(o) {
              console.log('post_template_reaction_gene', o);
            });
          });
        });
        /*


         */
      }

      //if($(this).hasClass('active')) { console.log('check', v)}
    });

    base.append(label)
  })

  return [base, created_controls];
}
//next time make a pretty clazz
var toggle_comment = false;
var button_toggle_comment = null;
function toggle_label() {
  toggle_comment = !toggle_comment
  update_toggle_label(button_toggle_comment)
}


function init_toggle_label(container) {
  if (container) {
    let icon = 'comment-slash'
    if (toggle_comment) {
      icon = 'comment'
    }
    button_toggle_comment = $('<button>', {'class' : 'btn btn-sm btn-dark'}).append($('<i>', {'class' : 'fas fa-' + icon}));
    button_toggle_comment.click(function(e) {
      toggle_label()
    })
    container.append(button_toggle_comment);
  }
}

function update_toggle_label(button_toggle_comment) {
  if (button_toggle_comment) {
    if (toggle_comment) {
      button_toggle_comment.html('<i class="fas fa-comment"></i>');
    } else {
      button_toggle_comment.html('<i class="fas fa-comment-slash"></i>');
    }
  }
}

var render_tooltip_ortholog = function(refs, data, container, template_rxns, width = '800px') {
  data['gene_reaction'] = data['gene_reaction'] || {}
  let seed_ids = []
  if (refs['seed.reaction']) {
    seed_ids = refs['seed.reaction']
  }
  container.html("")
  var base_container = $('<div>', {'style' : "width : " + width})
  var e_table = $('<table>', {'class' : 'table table-striped'})
  var e_thead = $('<thead>', {'class' : 'thead-light'})
  var e_tr = $('<tr>', {})

  //var ortholog_cols = {}
  //var e_th = $('<th>', {'scope' : 'col'})
  let top_left_cell = $('<th>', {'scope' : 'col'});
  let open_btn = $('<button>', {'class' : 'seed-button-ref btn btn-sm btn-success'}).text('Open');
  open_btn.click(function() {
    window.open('view_ortholog.html?rxn=' + seed_ids, '_blank');
  });
  top_left_cell.append(open_btn);
  top_left_cell.append(' ');
  init_toggle_label(top_left_cell);
  e_tr.append(top_left_cell);
  color_scale = ['#8a6552', '#fc7a57', '#bdb246', '#37323e']
  //color_scale = chroma.scale(['#495500','#2A4858']).mode('lch').colors(_.size(data['orthologs']))

  let ortholog_controls = {};

  var ortholog_color_code = {}
  _.each(data['orthologs'], function(ortholog_data, ortholog_id) {
    let extra_genomes = _.difference(_.keys(ortholog_data), _.keys(data['genomes']));
    //console.log(ortholog_id, ortholog_data, extra_genomes);

    if (!ortholog_controls[ortholog_id]) {
      ortholog_controls[ortholog_id] = {
        'col_controls' : {},
        'row_controls' : {}
      }
    }
    ortholog_color_code[ortholog_id] = color_scale.pop()
    var e_th = $('<th>', {'scope' : 'col'})

    e_th.append($('<div>').append($('<span>', {'style' : 'color:' + ortholog_color_code[ortholog_id]}).html(ortholog_id)))

    let extra_tooltip = $('<span>', {'style' : 'color:' + color_scale[0]}).html('<span class="e-subsystem" data-toggle="tooltip" title="Other genomes within cluster">+' + extra_genomes.length + '</span>');
    //extra_tooltip.tooltip();
    e_th.append($('<div>').append(extra_tooltip));
    let default_opt = 'opt_null';
    let ret = ortholog_create_top_control_group({
      'opt_score1' : 'fas fa-star', 'opt_score2' : 'fas fa-star-half-alt', 'opt_score3' : 'far fa-star',
      'opt_rej' : 'fas fa-ban', 'opt_null' : 'fas fa-question'},
      'opt_null',
      {
        'target_reaction_id' : seed_ids,
        'ortholog_data' : ortholog_data,
        'ortholog_id' : ortholog_id
      })
    ret[0].click(function(e) {
      var accept = window.confirm("Apply entire column: " + ortholog_id)
      if (!accept) {
        e.stopPropagation();
      }
    })
    let controls = ret[0]
    let created_controls = ret[1]
    _.each(created_controls, function(c, control_id) {
      ortholog_controls[ortholog_id]['col_controls'][control_id] = c;
      ortholog_controls[ortholog_id]['row_controls'][control_id] = [];
    });

    e_th.append(controls)
    e_tr.append(e_th)
  });
  e_thead.append(e_tr)
  e_table.append(e_thead)

  _.each(data['genomes'], function(genome_data, genome_id) {
    console.log('make row:', genome_id);
    console.log('make row:', data['gene_reaction'][genome_id]);
    let row_rxn_ids = {}
    var e_tr = $('<tr>', {})
    var e_td_genome = $('<td>', {})
    e_td_genome.append($('<div>', {}).append($('<span>', {'class' : 'badge badge-success'}).text(genome_id))
                                     .append($('<br>'))
                                     .append(genome_data['name']))
    
    _.each(data['genomes'][genome_id]['source'], function(source_data, source_id) {
      var e_div = $('<div>', {}).append($('<span>', {'class' : 'badge badge-secondary'}).text(source_id))
      _.each(source_data, function(gpr_data) {
        row_rxn_ids[gpr_data['rxn_id']] = true;
        e_div.append($('<br>')).append(gpr_data['rxn_id'])
        e_div.append(': ').append(gpr_data['gpr'])
      });
      e_td_genome.append(e_div)
    });
    //console.log(genome_data)
    //e_td_genome.html(genome_id + ' ' + genome_data['name'])
    e_tr.append(e_td_genome)
    _.each(data['orthologs'], function(genome_orthologs, ortholog_id) {
      var e_td_orth = $('<td>', {})
      if (genome_orthologs[genome_id]) {
        let genes_found = []
        _.each(data['genomes'][genome_id]['source'], function(model_data, model_id) {
            _.each(model_data, function(d) {
                genes_found = genes_found.concat(_.keys(d['genes']))
                //console.log('genome_orthologs', model_id, d['genes'])
            });
        });
        console.log(genome_id, genes_found)
        _.each(genome_orthologs[genome_id], function(gene_function, gene_id) {
          data['gene_reaction'][genome_id] = data['gene_reaction'][genome_id] || {}
          let created_controls = {};

          let default_opt = 'opt_null';
          if (template_rxns && template_rxns['genes'] && template_rxns['genes'][gene_id + '@' + genome_id]) {
            default_opt = template_rxns['genes'][gene_id + '@' + genome_id];
          }
          console.log(genome_id, gene_id, default_opt)
          let controls = ortholog_create_control_group({
              'opt_score1' : 'fas fa-star', 'opt_score2' : 'fas fa-star-half-alt', 'opt_score3' : 'far fa-star',
              'opt_rej' : 'fas fa-ban', 'opt_null' : 'fas fa-question'},
            default_opt,
            {
              'target_genome_id' : genome_id,
              'target_gene_id' : gene_id,
              'gene_function' : gene_function,
              'target_reaction_id' : seed_ids,
            }, created_controls);
          controls.click(function() {
            cluster_trigger = false;
          });
          _.each(created_controls, function(c, control_id) {
            ortholog_controls[ortholog_id]['row_controls'][control_id].push(c);
          });
            let gene_id_ct = $('<div>').html(gene_id)
            let missing_rxns = _.difference(data['gene_reaction'][genome_id][gene_id], _.keys(row_rxn_ids));
            let t_start = "";
            let t_end = "";
            if (genes_found.indexOf(gene_id) >= 0) {
              t_start = t_start + "<b>";
              t_end = "</b>" + t_end;
            }
            if (missing_rxns.length > 0) {
              t_start = t_start + "<i>";
              t_end = "</i>" + t_end;
            }
            gene_id_ct.html(t_start + gene_id + t_end);
            //let gene_function_ct2 = $('<div>').html(missing_rxns.join(' '))
            let other_rxn_ct = $('<div>').html('<i>+' + missing_rxns.length + ' reactions</i>')
            let gene_function_ct = $('<div>').html(gene_function)
            e_td_orth.append($('<div>', {}).append(gene_id_ct).append(other_rxn_ct)
                                           //.append($('<br>'))
                                           .append(gene_function_ct)
                                           //.append($('<br>'))
                                           .append(controls))
        });
      }
      e_tr.append(e_td_orth)
    });

    e_table.append(e_tr)
  });

  console.log(ortholog_controls);

  _.each(ortholog_controls, function(v, ortholog_id) {
    _.each(ortholog_controls[ortholog_id]['col_controls'], function(c, control_id) {
      c.on("change", function(e) {
        _.each(ortholog_controls[ortholog_id]['row_controls'][control_id], function(row_c) {
          console.log('now click')
          row_c.click();
        });
      });
    });
  });

  base_container.append(e_table)
  container.append(base_container)
  _.each(databases, function(uri, db) {
    if (refs[db]) {
          var database_link_el = $('<div>', {'class' : 'e-block'})
          _.each(refs[db], function(ref) {
            var ref_el = $('<button>', {'class' : 'seed-button-ref btn btn-sm btn-secondary', 'text' : ref})
            ref_el.on("click", function(e) {
              window.open(uri + ref, '_blank');
            })
            database_link_el.append(ref_el)
            database_link_el.append(' ')
          })
          container.append(database_link_el)
        }
  });
}