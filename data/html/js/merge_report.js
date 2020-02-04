
const render_cell = function() {}

const render_database_cell = function(data) {
    console.log('render_database_cell', data)
    let database_cell = $('<div>')
    
    if (data['seed.compound']) {
        let uri = 'http://modelseed.org/biochem/compounds/'
        _.each(data['seed.compound'], function(seed_id) {
            let db_token = $('<span>', 
                             {
                'class' : 'btn btn-primary btn-seed-sm',
                'style' : 'width: 80px;'
            }).html(seed_id)
            db_token.click(function() {
               window.open(uri + seed_id, '_blank');
            });
            database_cell.append($('<div>', {'style' : 'padding: 2px;'}).append(db_token))
            //database_cell.append($('<br>'))
        });
    }
    //database_cell.html(JSON.stringify(data))
    return database_cell
}

const render_report = function(data, container) {
    container.html("");
    //let report_ct = $('<div>', {'class' : 'border_test report-table'})
    let table = $('<table>', {'class' : 'table report-table'})
    
    //header
    
    let tr = $('<tr>')
    tr.append($('<th>', {'scope' : 'col'}).html('ModelSEED'))
      .append($('<th>', {'scope' : 'col'}));
    
    let model_order = []
    
    _.each(data['models'], function(model_id) {
        tr.append($('<th>', {'scope' : 'col'}).html(model_id));
        model_order.push(model_id);
    });
    
    let thead = $('<thead>', {'class': 'thead-light'}).append(tr);
    table.append(thead);
    
    _.each(data.records, function(record) {
        let tbody = $('<tbody>');
        //let td_database = ;
        
        let first = true;
        _.each(record.model_data, function(record_row, cmp_id) {
            let tr = $('<tr>');
            if (first) {
                let td_db = $('<td>', {'rowspan' : _.size(record.model_data)})
                if (record.database['seed.compound']) {
                    td_db.html(render_database_cell(record.database))
                }
                //console.log(record.database)
                tr.append(td_db)
            }
            tr.append($('<td>').html(cmp_id));
            _.each(model_order, function(model_id) {
                if (record_row[model_id]) {
                    tr.append($('<td>').html(record_row[model_id]));
                } else {
                    tr.append($('<td>'));
                }
            });
            tbody.append(tr);
            first = false;
        })
        table.append(tbody);
    });
    
    container.append(table);
    //container.replaceWith(report_ct);
};