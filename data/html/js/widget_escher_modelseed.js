var load_model = function(map_path, cb) {
  $.getJSON(map_path, function(model_data) {
    e_model = model_data;
    //e_builder.load_model(e_model, true);
    cb(model_data)
  });
};

class WidgetEscherModelseed {

  constructor(container, escher_builder, has_modelselect = true, has_display_toggle = true) {
    this.escher_map = null;
    this.escher_model = null;
    this.toggle_escher_label = null;
    this.escher_builder = escher_builder;
    this.container = container;
    this.escher_display = "bigg_id"
    this.options = {
      'z' : 'Generic',
      'c' : 'Cytosol',
      'm' : 'Mitochondria',
      //'e' : 'Extracellular',
      'c_e' : 'Cytosol > Extracellular',
      'c_m' : 'Cytosol > Mitochondria',
    };
    this.options_path = {
      'z' : 'data/ModelSEED2.json',
      'c' : 'data/TempModels/seed_c.json',
      'm' : 'data/TempModels/seed_m.json',
      //'e' : 'data/TempModels/seed_e.json',
      'c_e' : 'data/TempModels/seed_c_e.json',
      'c_m' : 'data/TempModels/seed_c_m.json',
    };

    this.has_modelselect = has_modelselect;

    this.has_display_toggle = has_display_toggle;
    this.diplay_ids = true;
  }

  change_model(model) {
    if (this.escher_builder && model) {
      this.escher_model = model;
      this.escher_builder.load_model(this.escher_model, true);
    }
  }

  update() {

  }

  toggle_display() {
    this.escher_builder.settings.set_option('identifiers_on_map', this.escher_display);
    this.escher_builder.map.draw_everything()
  }

  toggle_label() {
    this.diplay_ids = !this.diplay_ids
    if (this.diplay_ids) {
      this.escher_display = "bigg_id"
      this.toggle_display()
    } else {
      this.escher_display = "name"
      this.toggle_display()
    }
    
  }
    
  load_catalog(dataset_id_list, fn_success) {
      load_catalog_it(dataset_id_list, {}, fn_success)
  }
    
  load_catalog_it(dataset_id_list, catalog_result, fn_success) {
      if (dataset_id_list.length > 0) {
        let dataset_id = dataset_id_list.pop()
        
        this.api.get_escher_map_list(dataset_id, function(res) {
            catalog_result[dataset_id] = res;
            this.load_catalog_it(dataset_id_list, catalog_result, cb)
        })
    } else {
        if (fn_success) {
            fn_success(catalog_result);
        }
    }
  }

  init_container() {
    let that = this;

    if (this.container) {
      if (this.has_modelselect) {
        let el_select = $('<select>', {});
        _.each(this.options, function(text, value) {
          el_select.append(new Option(text, value, false, false));
        });
        this.container.append($('<label>', {}).html('Biochemistry: '))
          .append(el_select);
        el_select.select2();
        el_select.on('select2:select', function (e) {
          let data = e.params.data;
          load_model(that.options_path[data.id], function(model_data) {
            console.log('changed to', data.id);
            that.change_model(model_data);
            that.update();
          });
        });
      }

      if (this.has_display_toggle) {
        this.toggle_escher_label = $('<button>', {'class' : 'btn btn-seed-sm btn-dark'}).append($('<i>', {'class' : 'fas fa-cog'}))
          .append(' ID ');
        this.toggle_escher_label.click(function(e) {
          //should be on update
          if (that.diplay_ids) {
            $(this).html('<i class="fas fa-eye"></i> Name');
          } else {
            $(this).html('<i class="fas fa-eye"></i> ID');
          }
          that.toggle_label();
        })

        this.container.append(' Display: ')
          .append(this.toggle_escher_label);
      }
    }

  }
}