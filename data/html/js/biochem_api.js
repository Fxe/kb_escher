class BiochemistryAPI {

  constructor() {
    this.database_modules = {}
  }

  get_compound(id, database, fn_success) {
    console.log(id, database);
    if (!database) {
      database = this.detect_database(id);
    }

    if (database && this.database_modules[database]) {
      //console.log('get_compound', id, database);
      if (database === 'seed.compound') {
        id = this.detect_id(id);

        return this.database_modules[database].get_compound(id, database, fn_success)
      } else {
        return this.database_modules[database].get_compound(id, database, fn_success)
      }

    }
      
    return false;
  }

  detect_compartment(id) {
    if (id && id.indexOf('_') > 0) {
      return id.substring(id.indexOf('_') + 1);
    }
    return null;
  }

  detect_id(id) {
    if (id && id.indexOf('_') > 0) {
      return id.substring(0, id.indexOf('_') );
    }
    return id;
  }

  detect_database(id) {
    if (id && id.substring(0, 3) === 'cpd') {
      return 'seed.compound';
    }

    return null;
  }
}