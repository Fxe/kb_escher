
const LOCALSTORAGE_KEY = 'config';

class CurationEnvironment {

  constructor(api, ui) {
    this.config = null;
    this.server_status = null;
    this.api = api;
    this.ui = ui || [];

    let that = this;
    if (this.api) {
      this.api.get_server_status(function(e) {
        that.server_status = e;
        that.update_ui();
      });
    }
  }

  init_ui() {
    let that = this;
    this.ui.forEach(function(w) {
      w.init_container(that);
    });
  }

  update_ui() {
    let that = this;
    this.ui.forEach(function(w) {
      w.update(that);
    });
  }
    
  reset_config() {
    localStorage.removeItem(LOCALSTORAGE_KEY);
    this.load_config();
  }

  load_config() {
    this.config = this.load_config_from_localstorage();
    if (!this.config['user']) {
      console.log('[user] not set');
      this.config['user'] = prompt("Please enter your username", "curator_1");
    }
    if (!this.config['genome_set']) {
      console.log('[genome_set] not set');
    }
      
    this.save_config_to_localstarage();
    this.update_ui();
  }

  set_config_template_id(template_id) {
    let cfg = this.load_config_from_localstorage();
    cfg.target_template = template_id
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(cfg))
    this.update_ui();
  }

  load_config_from_localstorage() {

    let cfg = {
      'user' : null,
      'genome_set' : null,
      'target_template' : 'fungi',
      'kbase_token' : null
    }

    if (!localStorage.getItem(LOCALSTORAGE_KEY)) {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(cfg))
    }

    return JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY))
  }

  save_config_to_localstarage() {
    if (this.config) {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(this.config))
    }

    return this.config;
  }
}

