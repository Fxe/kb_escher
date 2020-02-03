    var databases = {
      'seed.reaction' : 'https://identifiers.org/seed.reaction/'
    }

var get_annotation_status = function(template_id, rxns, result, cb, fn_fail) {
    rxn_id = rxns.pop()
    if (rxn_id) {
        get_template_reaction_annotation_status(template_id, rxn_id, function(e) {
            result[rxn_id] = e
            get_annotation_status(template_id, rxns, result, cb)
        }).fail(function() {
    if (fn_fail) {
        fn_fail()
    }
  });
    } else {
        if (cb) {
            cb(result);
        }
    }
}

var get_template_reaction_annotation_status = function(template_id, rxn_id, cb) {
    return $.getJSON("/annotation/api/template/" + template_id + "/reaction/" + rxn_id, function(e) {
        if (cb) {
          console.log('eeee', e);
            cb(e);
        }
    })
}

var get_server_status = function(cb) {
    return $.getJSON("/annotation/api/status", function(e) {
        if (cb) {
            cb(e);
        }
    })
}

var set_annotation = function(function_id, reaction_id, user_id, template_id, logic) {
    post_annotation(function_id, reaction_id, user_id, template_id, logic)
}

var set_annotation_temp = function(function_id, reaction_id, logic) {
    set_annotation(function_id, reaction_id, env.config['user'], env.config['target_template'], logic)
}

var post_annotation = function(function_id, reaction_id, user_id, template_id, logic) {
    data = {
        'function_id' : function_id,
        'user_id' : user_id,
        'template_id' : template_id,
        'logic' : logic
    }
    $.post("/annotation/api/template/" + template_id + "/reaction/" + reaction_id, data, function(o) {
        console.log(o)
    }, 'json');
}

var render_function = function(function_str, metadata) {
    
    function_str = function_str.replace(/([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)/gm, 
                                        '<a href="https://www.kegg.jp/dbget-bin/www_bget?ec:$1" target="_blank">$1</a>')
    if (metadata.subsystems && _.size(metadata.subsystems) > 0) {
        console.log(metadata.subsystems, _.size(metadata.subsystems))
        ss = ""
        _.each(metadata.subsystems, function(ss_data, ss_source) {
            ss += ss_source;
            if (ss_data[0]) {
                ss += ': ' + ss_data[0]
            }
                
        })
        function_str = '<span class="e-subsystem" data-toggle="tooltip" title="' + ss + '">' + function_str + '</span>'
        el = $(function_str)
        el.tooltip();
        return el
    }
    
    return function_str;
}

var render_source = function(data) {
  var source = data['source']
  //console.log('render_source', data)
    if (source[0] == 'KEGG') {
        return '<a href="https://www.kegg.jp/dbget-bin/www_bget?ko:' + source[1] +'" target="_blank">' + source[1] + '</a>' + ' ('+ data['score'] + ')'
    }
    if (source[0] == 'template') {
        return source[1]
    }
    
    return source
}
var wut = 1

var create_control_group = function(opts, def_opt, id, seed_ids) {
  console.log('create_control_group', def_opt, id, seed_ids)
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
        
        label.on("change", function(e) {
          _.each(seed_ids, function(seed_id) {
            set_annotation_temp(id, seed_id, v);
          });
          //console.log('change', k, v, id, seed_ids, $(this).attr('class'))
          //if($(this).hasClass('active')) { console.log('check', v)}
        });
        
        base.append(label)
    })
    
    return base;
}

var render_tooltip = function(refs, data, container, template_rxns, wide) {
    seed_ids = []
    if (refs['seed.reaction']) {
        seed_ids = refs['seed.reaction']
    }
      container.html("")
      _.each(data, function(v, function_name) {
        var annotation_el = $('<div>', {'class' : 'e-block'})
        var check_el = $('<input>', {'type' : 'checkbox'})
        //console.log(v['id'])
        /*
        if (template_rxns) {
          var checked = false;
            _.each(template_rxns, function(template_rxn_data, rxn_id) {
                if (template_rxn_data && template_rxn_data['functions'].indexOf(v['id']) >= 0) {
                    checked = true;
                }
            })
          check_el.attr('checked',checked)
        }*/
        //check_el.attr('checked',true)
        check_el.on("click", function(e) {
          if($(this).is(':checked')) {
            console.log(v['id'])
            _.each(seed_ids, function(seed_id) {
                //set_annotation_temp(v['id'], seed_id, true);
            })
          } else {
            _.each(seed_ids, function(seed_id) {
                //set_annotation_temp(v['id'], seed_id, false);
            })
          }
        });
        var default_opt = "opt_null"
        if (template_rxns) {
          //console.log(template_rxns)
          _.each(template_rxns, function(template_rxn_data, rxn_id) {
            if (template_rxn_data && template_rxn_data['functions'] && template_rxn_data['functions'][v['id']]) {
              default_opt = template_rxn_data['functions'][v['id']]
            }
            //default_opt = template_rxn_data['log'][template_rxn_data['log'].length - 1]['action']
            //console.log(template_rxn_data['log'][template_rxn_data['log'].length - 1])
          });
        }

        var controls = create_control_group({
            'opt_score1' : 'fas fa-star', 'opt_score2' : 'fas fa-star-half-alt', 'opt_score3' : 'far fa-star',
            'opt_rej' : 'fas fa-ban', 'opt_null' : 'fas fa-question'}, default_opt, v['id'], seed_ids)
        annotation_el.append(controls)
        //annotation_el.append(check_el)
        annotation_el.append(render_function(function_name, v))
        _.each(v.sources, function(source_data, source_id) {
            annotation_el.append(' ')
            annotation_el.append($('<span>',
                                   {'text' : source_id + ' (' + source_data[0] + '/' + source_data[1] + ')',
                                    'class' : 'label label-annotation-source'}))

            //console.log(source_id, source_data)
        })
        annotation_el.append('<br>')
        //console.log(function_name, v);
        _.each(v.hits, function(hit) {
          var source_tag = $('<span>', {'text' : '', 'class' : 'label label-annotation-evi'})
          source_tag.append(render_source(hit))
          annotation_el.append(source_tag)
          annotation_el.append(' ')
        })

        container.append(annotation_el)
        container.append('<br>')
      });

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
      })
      var template = "yay!"
      //console.log(data)
      //container.append(tooltip_el)
    }

    var server_render_tooltip = function(seed_id, container, template_rxns) {
      container.html("loading...");
      $.getJSON("/annotation/api/annotation/rxn/" + seed_id, function(e) {
        render_tooltip({'seed.reaction' : [seed_id]}, e, container, template_rxns)
      })
    }
    
var list_genome_sets = function(cb) {
    return $.getJSON("/annotation/api/annotation/genome_set", function(e) {
        if (cb) {
            cb(e);
        }
    })
}

var get_genome_set = function(genome_set_id, cb) {
    return $.getJSON("/annotation/api/annotation/genome_set/" + genome_set_id, function(e) {
        if (cb) {
            cb(e);
        }
    })
}