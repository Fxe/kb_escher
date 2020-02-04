
//var _ = require('');

var list_maps = function(dataset_id, cb) {
  $.getJSON('/annotation/api/escher/dataset/' + dataset_id +'/map',function(d) {
    //e_model = model_data;
    //e_builder.load_model(e_model, true);
    cb(d);
  });
};

var get_model_data = function(model_id, cb) {
  $.getJSON('/annotation/api/model/' + model_id + '/cmp',function(d) {
    //e_model = model_data;
    //e_builder.load_model(e_model, true);
    cb(d);
  });
};

const cluster_map = function(map_data, grid_data, cb) {
  api.post_escher_cluster({'escher_map' : map_data, 'grid' : grid_data},
    function(report) {
      render_report(report, $('#cluster_report_container'))
      $('#modal_builder').modal('hide')
      $('#modal_report').modal('show')
      console.log(report);
    })
};

const cluster_merge_map = function(map_data, grid_data, cb) {
  api.post_escher_cluster_merge({'escher_map' : map_data, 'grid' : grid_data},
    function(escher_map) {
      if(cb){
          cb(escher_map)
      }
      
      //console.log(escher_map);
    })
};



const post_build = function(build_params, fn_success, fn_always, fn_error) {
  $.ajax({
    url: "/annotation/api/escher/build/grid",
    type: "POST",
    dataType: "json", // expected format for response
    contentType: "application/json", // send as JSON
    data: JSON.stringify(build_params),

    complete: function(o) {
      if (fn_always) {
        fn_always(o);
      }
    },
    success: function(o) {
      if (fn_success) {
        console.log(typeof o)
        fn_success(o);
      }
    },
    error: function(o) {
      if (fn_error) {
        fn_error(o);
      }
    },
  });
};

var map_target_options = [
  {
    id: 'map',
    text: 'MODELSEED.asdasdas'
  }
];

const get_shadow_grid_layout = function(canvas, config) {
  let shadow_grid_layout = {};
  let w = canvas.width / config.x;
  let h = canvas.height / config.y;

  let index = 0;
  for (let xx = 0; xx < config.y; xx++) {
    for (let yy = 0; yy < config.x; yy++) {
      if (config.maps[index]) {
        let map_config = config.maps[index].split(';')
        let map_id = map_config[3];
        if (!shadow_grid_layout[map_id]) {
          shadow_grid_layout[map_id] = [];
        }
        shadow_grid_layout[map_id].push([yy, xx, w, h, map_config[2]]);
      }
      index++;
    }
  }

  return shadow_grid_layout
};

var model_options = [];
var cmp_model_options = [];

var select_model_comp = null;
var select_target_map = null;
var select_target_comp = null;
var select_model = null;
var select_build_list = null;

var e_map = null;
//var shadow_grid_layout = null;
var is_init= false;
var widget_escher_modelseed = null;
var current_grid_layout = null;

var current_build_config = null;
var current_canvas = null;

const api = new CurationAPI();
const env = new CurationEnvironment(api, [
  new WidgetSystemStatus($('#top_bar')),
  //escher_widget,
]);

//draw_shadow_map(omg, -1 * omg[1].canvas.x, -1 * omg[1].canvas.y);
$(function() {
  env.load_config();
  env.init_ui();
  $('#button_merge_seed').click(function() {
      cluster_merge_map(e_map, current_grid_layout, function(o) {
          e_map = o;
          let e_options = {
        //menu: 'zoom',
        fill_screen: false
        //tooltip_component: tooltip,
      };
      e_builder = escher.Builder(e_map, null, null, d3.select('#map_container'), e_options);
          draw_show_grid_layout(get_shadow_grid_layout(current_canvas, current_build_config), api);
          
      //console.log(o);
    });
  });  
  $('#button_merge_map').click(function() {
    cluster_map(e_map, current_grid_layout, function(o) {
      console.log(o);
    });
  });
  $('#button_add_map_option').click(function() {
    let cmp_model = [];
    let cmp_std = [];
    let model_id = 'iMM904';
    let target_maps = [];
    _.each(select_target_map.children(), function(opts) {
      if (opts.selected) {
        target_maps.push(opts.value)
      }
    });
    _.each(select_model.children(), function(opts) {
      if (opts.selected) {
        model_id = opts.value;
      }
    });
    _.each(select_target_comp.children(), function(opts) {
      if (opts.selected) {
        cmp_std.push(opts.value)
      }
    });
    _.each(select_model_comp.children(), function(opts) {
      if (opts.selected) {
        cmp_model.push(opts.value)
      }
    });

    //let target_map = 'ModelSEED.Arginine and Ornithine Degradation';

    _.each(target_maps, function(target_map) {
      if (manual_groups[model_id]) {
        _.each(manual_groups[model_id], function(model_id_propagate) {
          cmp_model = [manual_compartment_mapping[model_id_propagate][cmp_std]];
          let t = model_id_propagate + ' (' + cmp_model.join('/') + ' > ' + cmp_std.join('/') + '): ' + target_map;
          let v = model_id_propagate + ';' + cmp_model.join(':') + ';' + cmp_std.join(':') + ';' + target_map;
          select_build_list.append(new Option(t, v, false,false));
        });

      } else {
        let t = model_id + ' (' + cmp_model.join('/') + ' > ' + cmp_std.join('/') + '): ' + target_map;
        let v = model_id + ';' + cmp_model.join(':') + ';' + cmp_std.join(':') + ';' + target_map;
        select_build_list.append(new Option(t, v, false,false));
      }

    });
  });
  $('#button_remove_select').click(function() {
    _.each(select_build_list.children(), function(opts) {
      if (opts.selected) {
        opts.remove();
      }

    });
  });


  $('#button_build_map').click(function() {
    let values = $.map($('#select_build_list option') ,function(option) {
      return option.value;
    });
    let build_config = {
      maps : values,
      x : parseInt($('#input_grid_x').val()),
      y : parseInt($('#input_grid_y').val())
    };
    post_build(build_config,function(map_data) {
      e_map = map_data;
      e_map[0]['grid'] = build_config;
      //console.log(build_config);
      //console.log(map_data[1].canvas);

      let e_options = {
        //menu: 'zoom',
        fill_screen: false
        //tooltip_component: tooltip,
      };
        
      e_builder = escher.Builder(e_map, null, null, d3.select('#map_container'), e_options);
      //let w = window.open("/annotation/editor.html", '_blank');
      //w.e_map = e_map;
      let shadow_grid_layout = get_shadow_grid_layout(map_data[1].canvas, build_config);
      //
    current_build_config = build_config;
        current_canvas = map_data[1].canvas;
      current_grid_layout =  get_shadow_grid_layout(map_data[1].canvas, build_config);
      draw_show_grid_layout(shadow_grid_layout, api);

      if (is_init) {
        widget_escher_modelseed.escher_builder = e_builder;
      } else {
        is_init = true;
        widget_escher_modelseed = new WidgetEscherModelseed($('#top_bar'), e_builder, true, true);
        widget_escher_modelseed.options['iMM904'] = 'SBML: iMM904';
        widget_escher_modelseed.options_path['iMM904'] = 'data/TempModels/iMM904.json';
        widget_escher_modelseed.options['iJDZ836'] = 'SBML: iJDZ836';
        widget_escher_modelseed.options_path['iJDZ836'] = 'data/TempModels/iJDZ836.json';
        widget_escher_modelseed.options['iAL1006'] = 'SBML: iAL1006';
        widget_escher_modelseed.options_path['iAL1006'] = 'data/TempModels/iAL1006.json';
        widget_escher_modelseed.options['iCT646'] = 'SBML: iCT646';
        widget_escher_modelseed.options_path['iCT646'] = 'data/TempModels/iCT646.json';
        widget_escher_modelseed.options['iLC915'] = 'SBML: iLC915';
        widget_escher_modelseed.options_path['iLC915'] = 'data/TempModels/iLC915.json';
        widget_escher_modelseed.options['iNL895'] = 'SBML: iNL895';
        widget_escher_modelseed.options_path['iNL895'] = 'data/TempModels/iNL895.json';
        widget_escher_modelseed.options['iMA871'] = 'SBML: iMA871';
        widget_escher_modelseed.options_path['iMA871'] = 'data/TempModels/iMA871.json';
        widget_escher_modelseed.options['iRL766'] = 'SBML: iRL766';
        widget_escher_modelseed.options_path['iRL766'] = 'data/TempModels/iRL766.json';
        widget_escher_modelseed.options['iTO977'] = 'SBML: iTO977';
        widget_escher_modelseed.options_path['iTO977'] = 'data/TempModels/iTO977.json';
        widget_escher_modelseed.options['iSS884'] = 'SBML: iSS884';
        widget_escher_modelseed.options_path['iSS884'] = 'data/TempModels/iSS884.json';
          
        widget_escher_modelseed.options['yeast_6.06'] = 'SBML: yeast_6.06';
        widget_escher_modelseed.options_path['yeast_6.06'] = 'data/TempModels/yeast_6.06.json';
        widget_escher_modelseed.options['yeast_7.6'] = 'SBML: yeast_7.6';
        widget_escher_modelseed.options_path['yeast_7.6'] = 'data/TempModels/yeast_7.6.json';
          
        widget_escher_modelseed.init_container();
      }

    });
    console.log(values);
  });

  select_target_comp = $("#select_target_cmp").select2({
    width: '100%',
    placeholder: "Select standard compartment",
    multiple: true,
    allowClear: true,
    maximumSelectionLength: 2,
    data: cmp_target_options
  });

  select_build_list = $('#select_build_list');

  select_model_comp = $("#select_model_cmp").select2({
    width: '100%',
    placeholder: "Select SBML compartment",
    multiple: true,
    allowClear: true,
    maximumSelectionLength: 2,
    data: cmp_model_options,
    disabled : false,
  });

  list_maps('ModelSEED', function(e) {
    map_target_options = [];
    _.each(e, function(map_data) {
      map_target_options.push({
        id : map_data,
        text : map_data,
      });
    });

    select_target_map = $("#select_target_map").select2({
      width: '100%',
      placeholder: "Select a maps to build (max 5)",
      multiple: true,
      allowClear: true,
      maximumSelectionLength: 5,
      data: map_target_options,
    });
  });

  _.each(mock_model_fungi_list, function(m) {
    //console.log(m);
    if (!m['proxy']) {
      let text = m['entry']
      if (m['bios_tax_lineage']) {
        text += ' (' + m['bios_tax_lineage'][1] + '; ' +  m['bios_tax_lineage'][0] + ')'
      } else {
        text += ' (?)'
      }
      model_options.push({
        id : m['entry'], text : text
      });
    }
  });
  model_options.push({
    id : 'all_fungi', text : 'Set: All 17 Fungi SBML Models'
  });

  select_model = $("#select_model").select2({
    width: '100%',
    multiple: true,
    allowClear: true,
    maximumSelectionLength: 1,
    placeholder: 'Select an option',
    data: model_options
  });

  select_model.on('select2:select', function (e) {
    let data = e.params.data;
    select_model_comp.empty();
    select_model_comp.prop('disabled', false);
    if (manual_groups[data.id]) {
      select_model_comp.append(new Option('Match Standard Compartment', '*', true, true));
    } else {
      get_model_data(data.id, function(model_data) {
        _.each(model_data, function(o) {
          console.log(o);
          let t = o.name + ' (' + o.id + ')';
          select_model_comp.append(new Option(t, o.id, false, false));
        });
        console.log(model_data);
      });
    }

  });

  $('#modal_builder').modal();
});