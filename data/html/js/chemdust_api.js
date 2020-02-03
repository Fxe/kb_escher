class ChemAPI {

  constructor() {

    this.base = '/annotation/';
    //this.base = 'http://192.168.1.21:8080/ChemDUST/';
  }

  get_depict(structure, structure_type, params, fn_success, fn_always, fn_error) {

    if (structure) {

      let body = {
        "width" : 300,
        "height" : 300,
        "carbon_symbol" : params['carbon_symbol'] || false,
        "atom_color" : params['atom_color'] || true,
        "atom_number" : params['atom_number'] || false,
        "aromatic_display" : false,
        "structure" : structure
      }
      //console.log(body);
      return $.post({
        //type: "POST",
        //url: this.base + '/api/render/svg/' + structure_type,
        url: this.base + '/api/biochem/depict/' + structure_type + '/svg',
        //crossDomain: true,
        dataType: 'text',
        data: JSON.stringify(body),
        contentType:"application/json; charset=utf-8",
        //jsonpCallback: 'MyJSONPCallback', // specify the callback name if you're hard-coding it
        success: function(data) {
          if (fn_success) {
            fn_success(data);
          }
        }
      });
    }

    return null
  }
}