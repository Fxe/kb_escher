
class CurationAPI {

  constructor() {
    this.base = '/annotation/api';
  }

  get_server_status(cb) {
    return $.getJSON(this.base + "/status", function(e) {
      if (cb) {
        cb(e);
      }
    })
  }

  get_modelseed_compound(seed_id, fn_success) {
    return $.getJSON(this.base + "/biochem/cpd/" + seed_id, function(ret_val) {
      if (fn_success) {
        fn_success(ret_val);
      }
    })
  }
  get_modelseed_reaction(seed_id, fn_success) {
    return $.getJSON(this.base + "/biochem/rxn/" + seed_id, function(ret_val) {
      if (fn_success) {
        fn_success(ret_val);
      }
    })
  }
    
  get_escher_map_list(dataset_id, fn_success) {
    return $.getJSON(this.base + "/escher/dataset/" + dataset_id + "/map", function(ret_val) {
      if (fn_success) {
        fn_success(ret_val);
      }
    })
  }

  get_escher_map(dataset_id, map_id, fn_success) {
    return $.getJSON(this.base + "/escher/dataset/" + dataset_id + "/map/" + map_id, function(ret_val) {
      if (fn_success) {
        fn_success(ret_val);
      }
    })
  }

  get_ortholog_annotation_from_rxn(rxn_id, fn_success) {
    return $.getJSON(this.base + "/annotation/ortholog/" + rxn_id, function(e) {
      if (fn_success) {
        fn_success(e);
      }
    })
  }

  get_annotation_reaction(rxn_id, fn_success) {
    return $.getJSON(this.base + "/annotation/rxn/" + rxn_id, function(e) {
      if (fn_success) {
        fn_success(e);
      }
    })
  }


  get_template_reaction_annotation_status(template_id, rxn_id, fn_success) {
    return $.getJSON(this.base + "/template/" + template_id + "/reaction/" + rxn_id, function(e) {
      if (fn_success) {
        fn_success(e);
      }
    })
  }

  get_genome_set(genome_set_id, fn_success, fn_always, fn_error) {
    return $.getJSON(this.base + "/annotation/genome_set/" + genome_set_id, function(e) {
      if (fn_success) {
        fn_success(e);
      }
    })
  }

  get_genome_set_list(fn_success, fn_always, fn_error) {
    return $.getJSON(this.base + "/annotation/genome_set", function(e) {
      if (fn_success) {
        fn_success(e);
      }
    })
  }

  get_template_reaction_gene(template_id, rxn_id, fn_success) {
    return $.getJSON(this.base + "/template/" + template_id + "/reaction/" + rxn_id + "/gene", function(e) {
      if (fn_success) {
        fn_success(e);
      }
    })
  }

  post_get_annotation_reaction_custom(rxn_id, fn_success) {
    return $.getJSON(this.base + "/annotation/rxn/" + rxn_id, function(e) {
      if (fn_success) {
        fn_success(e);
      }
    })
  }
  //"/template/<template_id>/annotation/reaction/<rxn_id>/ko/<ko_id>"
  post_template_annotation_reaction_ko(template_id, reaction_id, ko_id, user, value, fn_success, fn_always, fn_error) {
    let params = {
      'user' : user,
      'value' : value
    }
    return this.post("/template/" + template_id + "/annotation/reaction/" + reaction_id + "/ko/" + ko_id, params, fn_success, fn_always, fn_error)
  }

  post_template_annotation_reaction_status(template_id, reaction_id, genome_set_id, fn_success, fn_always, fn_error) {
    let params = {}
    if (genome_set_id) {
      params['genome_set_id'] = genome_set_id;
    }
    return this.post("/template/" + template_id + "/annotation/reaction/" + reaction_id + "/status", params, fn_success, fn_always, fn_error)
  }

  post_template_reaction_function(function_id, reaction_id, user_id, template_id, logic, fn_success, fn_always, fn_error) {
    let params = {
      'function_id' : function_id,
      'user_id' : user_id,
      'template_id' : template_id,
      'logic' : logic
    }
    return this.post("/template/" + template_id + "/reaction" + reaction_id, params, fn_success, fn_always, fn_error);
  }

  post_template_function_rxns(template_id, params, fn_success, fn_always, fn_error) {
    return this.post("/template/" + template_id + "/functions_rxn", params, fn_success, fn_always, fn_error);
  };

  post_build_grid(params, fn_success, fn_always, fn_error) {
    return this.post("/escher/build/grid", params, fn_success, fn_always, fn_error);
  };

  post_escher_cluster(params, fn_success, fn_always, fn_error) {
    return this.post("/escher/cluster", params, fn_success, fn_always, fn_error);
  }
    
  post_escher_cluster_merge(params, fn_success, fn_always, fn_error) {
    return this.post("/escher/merge", params, fn_success, fn_always, fn_error);
  }

  post_template_reaction_gene(template_id, rxn_id, params, fn_success, fn_always, fn_error) {
    return this.post("/template/" + template_id + "/reaction/" + rxn_id + "/gene", params, fn_success, fn_always, fn_error);
  }

  post_template_model_compound_reference(template_id, mspi_id, params, fn_success, fn_always, fn_error) {
    return this.post("/template/" + template_id + "/model_compound/" + mspi_id + "/map", params, fn_success, fn_always, fn_error);
  }

  post_template_model_reaction_reference(template_id, mrxn_id, params, fn_success, fn_always, fn_error) {
    return this.post("/template/" + template_id + "/model_reaction/" + mrxn_id + "/map", params, fn_success, fn_always, fn_error);
  }

  post(url, body, fn_success, fn_always, fn_error) {
    return $.ajax({
      url: this.base + url,
      type: "POST",
      dataType: "json", // expected format for response
      contentType: "application/json; charset=utf-8", // send as JSON
      data: JSON.stringify(body),

      complete: function(o) {
        console.log('complete!')
        if (fn_always) {
          fn_always(o);
        }
      },
      success: function(o) {
        console.log('success!')
        if (fn_success) {
          fn_success(o);
        }
      },
      error: function(o) {
        console.log('error!')
        if (fn_error) {
          fn_error(o);
        }
      },
    });
  }
}