class EscherTooltipAnnotation {
  constructor(tinier, curation_api, env, container_id = 'tooltip_container') {
    this.tinier = tinier
    this.container_id = container_id;
    this.curation_api = curation_api;
    this.biochem_api = null;
    this.chem_api = null;
    this.env = env;
    //default user tagged as system
    this.default_option = "opt_null";
    this.system_users = {
      'system' : true
    }
    this.control_options = {
      'opt_score1' : 'fas fa-star',
      'opt_score2' : 'fas fa-star-half-alt',
      'opt_score3' : 'far fa-star',
      'opt_rej' : 'fas fa-ban',
      'opt_null' : 'fas fa-question'
    };
    this.source_alias = {
      'KBASE_RAST' : 'Legacy RAST'
    }
    this.active_xhr = 0;
  }

  is_busy() {
    return this.active_xhr != 0;
  }

  render_function(function_str, metadata) {
    //https://enzyme.expasy.org/EC/1.1.1.1
    function_str = function_str.replace(/([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)/gm,
      '<a href="https://www.kegg.jp/dbget-bin/www_bget?ec:$1" target="_blank">$1</a> <a href="https://enzyme.expasy.org/EC/$1" target="_blank"><img src="https://web.expasy.org/favicon.ico" /></a>')
    if (metadata.subsystems && _.size(metadata.subsystems) > 0) {
      //console.log('render_function', metadata.subsystems, _.size(metadata.subsystems))
      let ss = "";
      _.each(metadata.subsystems, function(ss_data, ss_source) {
        ss += ss_source + "; ";
        if (ss_data[0]) {
          ss += ': ' + ss_data[0]
        }

      })
      function_str = '<span class="e-subsystem" data-toggle="tooltip" title="' + ss + '">' + function_str + '</span>'
      let el = $(function_str)
      el.tooltip();
      return el
    }

    return function_str;
  }

  get_annotation_status_old(api, template_id, rxns, result, fn_success, fn_error) {
    rxn_id = rxns.pop()
    if (rxn_id) {
      api.get_template_reaction_annotation_status(template_id, rxn_id, function(e) {
        result[rxn_id] = e
        get_annotation_status(api, template_id, rxns, result, fn_success, fn_error)
      }).fail(function() {
        if (fn_error) {
          fn_error()
        }
      });
    } else {
      if (fn_success) {
        fn_success(result);
      }
    }
  }

  set_annotation(function_id, reaction_id, user_id, template_id, logic) {
    this.curation_api = post_template_reaction_function(function_id, reaction_id, user_id, template_id, logic)
  }

  set_annotation_temp(function_id, reaction_id, logic) {
    set_annotation(function_id, reaction_id, env.config['user'], env.config['target_template'], logic)
  }

  create_control_group(opts, def_opt, target_id, seed_id, user, is_system) {
    if (!def_opt) {
      def_opt = this.default_option;
    }
    //console.log('create_control_group', target_id, def_opt, user, is_system)
    let curation_decorator = ""
    if (user && is_system) {
      curation_decorator = "seed-annotation-auto-group"
    } else if (user) {
      curation_decorator = "seed-annotation-curated-group"
    } else {
      curation_decorator = "seed-annotation-none-group"
    }
    let base = $('<div>', {'class' : 'btn-group btn-group-toggle ' + curation_decorator, 'data-toggle' : 'buttons'})
    if (user) {
      base.append($('<div>', {'class' : 'seed-annotation-control-label', 'text' : user}))
    }
    _.each(opts, function(k, v) {
      let label_class = {'class' : 'btn btn-seed-sm btn-warning'}
      if (def_opt === v) {
        label_class['class'] += ' active'
      }
      var label = $('<label>', label_class)
      var input = $('<input>', {'type' : 'radio', 'name' : 'options', 'autocomplete' : 'off'})
      var icon = $('<i>', {'class' : k})
      label.append(input)
      label.append(icon)

      label.on("change", function(e) {
        set_annotation_temp(target_id, seed_id, v);
      });

      base.append(label)
    })

    return base;
  }

  get_annotation_status(template_id, rxns, result, cb, fn_fail) {
    //console.log(rxns);
    let rxn_id = rxns.pop()
    let that = this;
    if (rxn_id) {
      this.curation_api.get_template_reaction_annotation_status(template_id, rxn_id, function(e) {
        result[rxn_id] = e
        that.get_annotation_status(template_id, rxns, result, cb, fn_fail)
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

  ttt2(rxn_ids, template_id, genome_set_id) {
    let rxn_id = rxn_ids[0];
    let that = this
    let ct = $('#' + this.container_id);
    if (ct.length) {
      _.each(rxn_ids, function(rxn_id) {
        let rxn_annotation_container = $('<div>', {'class' : 'container'}).html('<i class="fas fa-spinner fa-spin"></i> Loading: ' + rxn_id);
        ct.append(rxn_annotation_container);
        that.active_xhr += 1;
        that.curation_api.post_template_annotation_reaction_status(template_id, rxn_id, genome_set_id, function(e) {
          rxn_annotation_container.html('');
          rxn_annotation_container.append(that.escher_tooltip_annotation(
            rxn_id,
            'seed.reaction',
            e.annotation,
            e.curation,
            e.function_rxns,
            true));
          //console.log('post_template_annotation_reaction_status', e);
        }, undefined, function (e) {
          console.log('@@@', e)
          rxn_annotation_container.html('<span class="badge badge-danger"><i class="fas fa-bug"></i> Error: ' + rxn_id + '</span> Try refresh the page. If this problem persist contact page admin.');
        }).always(function() {
          that.active_xhr -= 1;
          console.log('done', rxn_id, 'remaing:', that.loading_count);
        });

      });
    }

    /*
*/
  }
  ttt(rxn_ids, template_id) {
    let rxn_id = rxn_ids[0];
    let that = this
    api.get_annotation_reaction(rxn_id, function(e1) {
      that.get_annotation_status(template_id, [rxn_id], {}, function(e2) {
        let function_ids = [];
        _.each(e1, function(function_data, function_name) {
          function_ids.push(function_data['id']);
        });
        api.post_template_function_rxns(env.config['target_template'], function_ids, function(e3) {
          //console.log('get_annotation_reaction', e1);
          //console.log('get_template_reaction_annotation_status', e2);
          //console.log('post_template_function_rxns', e3);
          that.escher_tooltip_annotation({'seed.reaction' : [rxn_id]}, e1, $('#view_container'), e2, e3, true)
        })
      });
    }).done(function() {
      console.log('next!')
    });
  }

  build_link_span(text, href) {
    return $('<a>', {
      //'text' : text,
      'href' : href,
      'class' : 'badge badge-sq badge-success badge-annotation-evi',
      'target' : '_blank'
    }).html(text);
  }

  render_source_tag(data) {
    //<a href="#" class="badge badge-success">Success</a>
    //var source_tag = $('<span>', {'text' : '', 'class' : 'label label-annotation-evi'})
    var source = data['source']
    //console.log('render_source', data)
    if (source[0] == 'KEGG') {
      let href = 'https://www.kegg.jp/dbget-bin/www_bget?ko:' + source[1];
      return $('<a>', {
        'text' : source[1] + ' ('+ data['score'] + ')',
        'href' : href,
        'class' : 'badge badge-sq badge-success badge-annotation-evi',
        'target' : '_blank'
      }); //'<a href= target="_blank">' + source[1] + '</a>' + ' ('+ data['score'] + ')'
    }
    if (source[0] == 'template') {
      return $('<span>', {'text' : source[1], 'class' : 'label label-annotation-evi'});
    }
    return source
  }

  build_source_tags(source_tags) {

  }



  build_annotation_row(default_opt, seed_id, annotation, annotation_id, subsystems, source, evidence, user, is_system, other_rxns) {
    let that = this;
    let control_group = this.create_control_group(this.control_options, default_opt, annotation_id, seed_id, user, is_system);
    let annotation_label = this.render_function(annotation, {subsystems : subsystems});
    let source_tags = $('<div>', {'class' : 'float-left'});
    _.each(source, function(data, text) {
      if (that.source_alias[text]) {
        text = that.source_alias[text]    
      }
      source_tags.append($('<span>',
        {
          'text' : text + ' (' + data[0] + '/' + data[1] + ')',
          'class' : 'label label-annotation-source'
        }));
      source_tags.append(' ')
    });
    if (other_rxns) {
      _.each(other_rxns, function(url, text) {
        source_tags.append(that.build_link_span(text, url));
        source_tags.append(' ')
      });
    }
    let row_container = $('<div>', {'class' : 'seed-annotation-group'})
      .append($('<div>', {'class' : 'float-left'}).append(control_group))
      .append($('<div>', {'class' : 'float-left'}).append(annotation_label))
      .append(source_tags);
    return row_container;
  }

  get_last_users(template_rxns) {
    let result = {}
    if (!template_rxns || !template_rxns.log) {
      return result;
    }
    _.each(template_rxns.log, function(log) {
      let target_id = log.target;
      if (!result[target_id]) {
        result[target_id] = {
          user : undefined,
          timestamp : 0,
          action : undefined
        }
      }
      if (log.timestamp > result[target_id].timestamp) {
        result[target_id].timestamp = log.timestamp;
        result[target_id].user = log.user_id;
        result[target_id].action = log.action;
      }
    });

    return result;
  }

  build_reaction_section(rxn_id, database_id, rxn_data, wide) {
    let container_section = $('<div>', {'class' : 'seed-annotation-group'})
    container_section.append(this.build_link_span(rxn_id, 'http://modelseed.org/biochem/reactions/' + rxn_id));
    return container_section
  }

  //https://www.uniprot.org/uniprot/?query=AMED_2634&sort=score
  escher_tooltip_annotation(rxn_id, database_id, data, template_rxns, other_rxns, wide) {
    let that = this;
    let result_container = $('<div>');

    result_container.append(this.build_reaction_section(rxn_id, database_id, {}, wide));


    let curation_data = this.get_last_users(template_rxns);

    //console.log(template_rxns);
    //console.log(other_rxns);
    //console.log(curation_data);

    let kegg_kos = {}
    _.each(data, function(annotation_data, function_name) {
      _.each(annotation_data.hits, function(hit) {
        if (hit['source'][0] == 'KEGG') {
          kegg_kos[hit['source'][1]] = true;
        }
      });
    });

    _.each(data, function(annotation_data, function_name) {
      let annotation_str = function_name;
      let annotation_id = annotation_data.id;

      let subsystems = annotation_data.subsystems;
      let annotation_source = annotation_data.sources;
      let user = undefined;
      let default_opt = that.default_option;
      if (template_rxns) {
        default_opt = template_rxns['functions'][annotation_id];
      }
      let others = {}
      if (other_rxns[annotation_id]) {
        _.each(other_rxns[annotation_id], function(other_rxn_opt, other_rxn_id) {
          if (other_rxn_id !== rxn_id) {
            let icon = $('<div>').append($('<i>', {'class' : that.control_options[other_rxn_opt]}))
            console.log(icon.html() + ' ' + other_rxn_id)
            others[icon.html() + ' ' + other_rxn_id] = 'view_annotation.html?rxn=' + other_rxn_id
          }
        });
      }
      if (curation_data[annotation_id]) {
        user = curation_data[annotation_id].user;
      }
      let annotation_row = that.build_annotation_row(
        default_opt,
        rxn_id,
        annotation_str,
        annotation_id,
        subsystems,
        annotation_source,
        {},
        user,
        that.system_users[user],
        others);
      result_container.append(annotation_row);

      let row_container = $('<div>', {'class' : 'seed-annotation-group-second'})
      _.each(annotation_data.hits, function(hit) {
        row_container.append(that.render_source_tag(hit));
        row_container.append(' ')
      });
      result_container.append(row_container);
    });


    if (wide) {
      let ko_icons = $('<div>', {'class' : 'float-left', 'style' : 'padding: 5px'});
      let ko_container = $('<div>', {'class' : 'seed-annotation-group', style : 'height: 50px;'})

      ko_container.append(ko_icons)
      _.each(kegg_kos, function(v, ko_id) {
        ko_icons.append(that.build_link_span(ko_id, 'https://www.kegg.jp/dbget-bin/www_bget?ko:' + ko_id))
                .append(' ');
      });


      let input_add_ko = $('<input>', {'class' : 'e-block', placeholder : "KEGG KO ID"});
      let button_add_ko = $('<button>', {'class' : 'btn btn-outline-secondary', 'text' : '+'});
      button_add_ko.click(function() {
        if (input_add_ko.val()) {
          that.curation_api.post_template_annotation_reaction_ko(that.env.config['target_template'], rxn_id, input_add_ko.val(), that.env.config['user'], true, function(e) {
            if (e) {
              ko_icons.append(that.build_link_span(input_add_ko.val(), 'https://www.kegg.jp/dbget-bin/www_bget?ko:' + input_add_ko.val()))
                      .append(' ');
            } else {
              alert('KO ' + input_add_ko.val() + ' not in database');
            }
            console.log('post_template_annotation_reaction_ko', e)

          }, undefined, function() {
            alert('error: ' + input_add_ko.val());
          });
        }
      })

      ko_container.append($('<div>', {'class' : 'float-left'}).append(
        $('<div>', {'class' : 'input-group mb-3'})
          .append($('<div>', {'class' : 'input-group-prepend'}).append($('<span>', {'class' : 'input-group-text', 'text' : 'Add'})))
          .append(input_add_ko)
          .append($('<div>', {'class' : 'input-group-append'}).append(button_add_ko))));

      result_container.append(ko_container);
    }

    return result_container;
    /*
    _.each(data, function(v, function_name) {
      var annotation_el = $('<div>', {'class' : 'e-block'})

      var default_opt = "opt_null"
      if (template_rxns) {
        //console.log('escher_tooltip_annotation', 'template_rxns', template_rxns)
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
      annotation_el.append(render_function(function_name, v))
      _.each(v.sources, function(source_data, source_id) {

        annotation_el.append(' ')
        annotation_el.append($('<span>',
          {
            'text' : source_id + ' (' + source_data[0] + '/' + source_data[1] + ')',
            'class' : 'label label-annotation-source'
          }))

        //console.log(source_id, source_data)
      })
      if (other_rxns) {
        if (v['id'] && other_rxns[v['id']]) {
          _.each(other_rxns[v['id']], function(other_rxn_id_score, other_rxn_id) {
            let other_rxn_label = $('<span>',
              {
                'class' : 'label label-annotation-evi'
              })
            other_rxn_label.append($('<a>',
              {
                'href' : 'view_annotation.html?rxn=' + other_rxn_id,
                'target' : '_blank',
                'text' : other_rxn_id
              }))
            if (seed_ids.indexOf(other_rxn_id) < 0) {
              annotation_el.append(' ')
                .append(other_rxn_label)
            }
          });
        }
        //_.each()
      }

      annotation_el.append('<br>')
      //console.log(function_name, v);
      _.each(v.hits, function(hit) {
        //var source_tag = $('<span>', {'text' : '', 'class' : 'label label-annotation-evi'})
        //source_tag.append(render_source(hit))

        annotation_el.append(that.render_source_tag(hit));
        annotation_el.append(' ')
        if (hit['source'][0] == 'KEGG') {
          sources[hit['source'][1]] = true;
        }
      })

      container.append(annotation_el)
      container.append('<br>')
    });
    */



/*
    _.each(databases, function(uri, db) {
      if (ref[1] == db) {
        var database_link_el = $('<div>', {'class' : 'e-block'})

          var ref_el = $('<button>', {'class' : 'seed-button-ref btn btn-sm btn-secondary', 'text' : ref})
          ref_el.on("click", function(e) {
            window.open(uri + ref, '_blank');
          })
          database_link_el.append(ref_el)
          database_link_el.append(' ')
        container.append(database_link_el)
      }
    })*/
    //var template = "yay!"
    //console.log(data)
    //container.append(tooltip_el)
  }

  tooltip(args) {

  }
}







