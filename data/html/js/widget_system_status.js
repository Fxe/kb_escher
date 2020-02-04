class WidgetSystemStatus {

  constructor(container) {
    this.container = container;

    this.label_user = null;
    this.label_namespace = null;

    this.label_server = null;
    this.label_neo4j = null;
    this.label_mongo_atlas = null;
  }

  init_container() {
    if (this.container) {
      this.label_user = $('<span>', {'class' : 'badge badge-primary'}).html('offline')
      this.label_namespace = $('<span>', {'class' : 'badge badge-primary'}).html('offline')

      this.label_server = $('<span>', {'class' : 'badge badge-danger'}).html('offline')
      this.label_neo4j = $('<span>', {'class' : 'badge badge-danger'}).html('offline')
      this.label_mongo_atlas = $('<span>', {'class' : 'badge badge-danger'}).html('offline')

      this.container.append(' User: ')
        .append(this.label_user)
        .append(' Template: ')
        .append(this.label_namespace)

      this.container.append(' Server: ')
        .append(this.label_server)
        .append(' Database: ')
        .append(this.label_neo4j)
        .append(' Cloud: ')
        .append(this.label_mongo_atlas)
    }
  }

  update_server_label(label_container, v) {
    if (label_container) {
      if (v) {
        label_container.removeClass("badge-danger")
        label_container.addClass("badge-success")
        label_container.html('alive')
      } else {
        label_container.removeClass("badge-success")
        label_container.addClass("badge-danger")
        label_container.html('offline')
      }
    }
  }

  update(env) {
    if (env && env.server_status) {
      this.update_server_label(this.label_server, env.server_status['server']);
      this.update_server_label(this.label_neo4j, env.server_status['neo4j']);
      this.update_server_label(this.label_mongo_atlas, env.server_status['mongo_atlas']);
    }
    if (env && env.config) {
      if (this.label_user) {
        if (env.config['user']) {
          this.label_user.html(env.config['user'])
        } else {
          this.label_user.html('error')
        }
      }
      if (this.label_namespace) {
        if (env.config['target_template']) {
          this.label_namespace.html(env.config['target_template'])
        } else {
          this.label_namespace.html('error')
        }
      }

    }
  }
}