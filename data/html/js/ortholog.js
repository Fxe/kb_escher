var tinier = escher.libs.tinier
var tooltip_style = {
  'min-width': '40px',
  'min-height': '10px',
  'border-radius': '2px',
  'border': '1px solid #b58787',
  'padding': '7px',
  'background-color': '#fff',
  'text-align': 'left',
  'font-size': '16px',
  'font-family': 'sans-serif',
  'color': '#111',
  'box-shadow': '4px 6px 20px 0px rgba(0, 0, 0, 0.4)',
}



var model_panel = {
    'SEED (cytosol)' : 'data/TempModels/seed_c.json',
    'SEED (extracell)' : 'data/TempModels/seed_e.json',
    'SEED (mitochondria)' : 'data/TempModels/seed_m.json',
    'SEED (cytosol > extracell)' : 'data/TempModels/seed_c_e.json',
    'SEED (cytosol > mitochondria)' : 'data/TempModels/seed_c_m.json'
}



var get_ortholog_annotation_from_rxn = function(rxn_id, cb) {
    return $.getJSON("/annotation/api/annotation/ortholog/" + rxn_id, function(e) {
        if (cb) {
            cb(e);
        }
    })
}

var get_ortholog_data = function(ids) {
  console.log('get_ortholog_data', ids)
  if (ids && ids.length > 0) {
    let seed_id = ids[0]
    if (seed_id.startsWith('rxn')) {
      if (seed_id.indexOf('_') > 0) {
        seed_id = seed_id.substring(0, seed_id.indexOf('_'))
      }
      console.log('get_ortholog_data', seed_id)
      api.get_ortholog_annotation_from_rxn(seed_id, function(ret) {
        api.get_template_reaction_gene(env.config.target_template, seed_id, function (annotation_data) {
          console.log('get_template_reaction_gene', annotation_data);
          render_tooltip_ortholog({'seed.reaction' : [seed_id]}, ret, $('#tooltip_container'), annotation_data)
        });
      });
/*
      get_ortholog_annotation_from_rxn(seed_id, function(e) {
        render_tooltip_ortholog({'seed.reaction' : [seed_id]}, e, $('#tooltip_container'), {})
        console.log(e)
      })

 */
    }
  }
}

var tooltip_metabolite = function(args) {
      tinier.render(
        args.el,
        // Create a new div element inside args.el
        tinier.createElement(
          'div',
          // Style the text based on our tooltip_style object
          { style: tooltip_style, id: 'tooltip_container'},
          'Metabolite',
        
          tinier.createElement(
            'br'
          ),
          tinier.createElement(
            'b',
            {},
            args.state['name']
          ),
          // Update the text to read out the identifier biggId
          '' //JSON.stringify(args.state)
        ),
      )
}

var tooltip_reaction = function(args) {
      tinier.render(
        args.el,
        tinier.createElement(
          'div',
          {style: tooltip_style},
          args.state.biggId + ": " + args.state.name
        ),
        // Create a new div element inside args.el
        tinier.createElement(
          'div',
          // Style the text based on our tooltip_style object
          { style: tooltip_style, id: 'tooltip_container'},
          '[Ortholog]',
        
          tinier.createElement(
            'br'
          ),
          tinier.createElement(
            'b',
            {},
            'Loading...'
          ),
          // Update the text to read out the identifier biggId
          '' //JSON.stringify(args.state)
        ),
      )
}

var tooltip = function (args) {
    let map_rxn_id = args.state.biggId
    let model_rxns = _.filter(e_model.reactions, function(x) {return x.id == map_rxn_id})
    let seed_ids = []

  if (args.state.type == 'reaction' && args.state.biggId.startsWith("rxn")) {
    seed_ids.push(args.state.biggId)
  }
    
    console.log(seed_ids, args.state)
    
  if (args.state.type == 'metabolite') {
    tooltip_metabolite(args)
  } else if  (args.state.type == 'reaction') {
    tooltip_reaction(args)
    get_ortholog_data(seed_ids)
  }
}

/*
var label_ids = true;
var toggle_label = function() {
  label_ids = !label_ids
  if (label_ids) {
    e_builder.settings.set_option('identifiers_on_map', 'bigg_id')
  } else {
    e_builder.settings.set_option('identifiers_on_map', 'name')
  }
  e_builder.map.draw_everything()
}*/

var e_model;
var e_map;
var e_builder;
var e_options;

const escher_widget = new WidgetEscherModelseed($('#top_bar'), e_builder)
const api = new CurationAPI();
const env = new CurationEnvironment(api, [
  new WidgetSystemStatus($('#top_bar')),
  escher_widget,
]);

$(function() {
  env.load_config();
  env.init_ui();
  /*
    $('#display_toggle').click(function(e) {
    if (label_ids) {
      $(this).html('<i class="fas fa-eye"></i> Name')
    } else {
      $(this).html('<i class="fas fa-eye"></i> ID')
    }
    toggle_label()
  })

   */
    
    console.log('ortholog.js')
    $.getJSON("data/TempModels/test_fungi.json", function(map_data) {
        $.getJSON("data/TempModels/seed_c.json", function(model_data) {
          e_model = model_data
          e_map = map_data
          
              //var a2 = document.getElementById("download_map");
    //a2.href = URL.createObjectURL(new Blob([JSON.stringify(e_map)]));
          
          e_options = {
            //menu: '',
            fill_screen: false,
            tooltip_component: tooltip,
          }

          e_builder = escher.Builder(e_map, e_model, null, d3.select('#map_container'), e_options)
          escher_widget.escher_builder = e_builder
          //let widget_escher_modelseed = new WidgetEscherModelseed($('#top_bar'), e_builder);
          //widget_escher_modelseed.init_container();
        });
    });


});