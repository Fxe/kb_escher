import json
import escher
import modelseed_escher
import cobrakbase
from cobrakbase.core.converters import KBaseFBAModelToCobraBuilder
from modelseed_escher.convert_utils import move_to_compartment
#{'workspace_id': 37534, 'map_ids': ['dfsdfsdf'], 'grid_x': '1', 'grid_y': '1', 'model_objects': [{'object_ids': ['37534/91/1'], 'model_id': '37534/90/3'}, {'object_ids': ['37534/92/1'], 'model_id': '37534/89/1'}], 'report_height': '800', 'workspace_name': 'filipeliu:narrative_1580723870549', 'model_ids': ['37534/90/3', '37534/89/1']}



def dump_chemical_abundance_datasets(model_id, datasets, map_decorators):
    for dataset_id in datasets:
        if not model_id in map_decorators:
            map_decorators[model_id] = {}
        if not 'compound' in map_decorators[model_id]:
            map_decorators[model_id]['compound'] = {}
        if not 'chemical_abundance' in map_decorators[model_id]['compound']:
            map_decorators[model_id]['compound']['chemical_abundance'] = []
        
        filename = '{}_{}.json'.format(model_id, dataset_id)
        filepath = '../data/html/data/datasets/{}'.format(filename)
        
        map_decorators[model_id]['compound']['chemical_abundance'].append({
            'id' : dataset_id,
            'path' : filename
        })
        with open(filepath, 'w') as fh:
            fh.write(json.dumps(datasets[dataset_id]))
    return map_decorators

def dump_expression_datasets(model_id, datasets, map_decorators):
    for dataset_id in datasets:
        if not model_id in map_decorators:
            map_decorators[model_id] = {}
        if not 'gene' in map_decorators[model_id]:
            map_decorators[model_id]['gene'] = {}
        if not 'expression' in map_decorators[model_id]['gene']:
            map_decorators[model_id]['gene']['expression'] = []
        
        filename = '{}_{}.json'.format(model_id, dataset_id)
        filepath = '../data/html/data/datasets/{}'.format(filename)
        
        map_decorators[model_id]['gene']['expression'].append({
            'id' : dataset_id,
            'path' : filename
        })
        with open(filepath, 'w') as fh:
            fh.write(json.dumps(datasets[dataset_id]))
    return map_decorators 

def get_chemical_abundance_data(data, dataset, mapping):
    col_index = None
    result = {}
    try:
        col_index = data['data']['col_ids'].index(dataset)
    except ValueError:
        return None
    
    for i in range(len(data['data']['row_ids'])):
        k = data['data']['row_ids'][i]
        v = data['data']['values'][i][col_index]
        if not v == None:
            if k in mapping['instances'] and len(mapping['instances'][k][5]) > 0:
                result[mapping['instances'][k][5]] = v
            else:
                result[k] = v
    
    return result

def get_all_chemical_abundance_data(data, mapping):
    result = {}
    for dataset in data['data']['col_ids']:
        chemical_abundance = get_chemical_abundance_data(data, dataset, mapping)
        if len(chemical_abundance) > 0:
            result[dataset] = chemical_abundance
        
    return result

def get_expression_data(data, dataset):
    col_index = None
    result = {}
    try:
        col_index = data['data']['col_ids'].index(dataset)
    except ValueError:
        return None
    
    for i in range(len(data['data']['row_ids'])):
        k = data['data']['row_ids'][i]
        v = data['data']['values'][i][col_index]
        result[k] = v
    
    return result

def get_all_expression_data(data):
    result = {}
    for dataset in data['data']['col_ids']:
        result[dataset] = get_expression_data(data, dataset)
    
    return result

def scan_content(escher_map, fbamodel, fba):
    map_cpd_set = set()
    map_rxn_set = set()
    for node_uid in map_data.nodes:
        node = map_data.escher_graph['nodes'][node_uid]
        if node['node_type'] == 'metabolite':
            map_cpd_set.add(node['bigg_id'])
    for rxn_uid in map_data.escher_graph['reactions']:
        rxn_node = map_data.escher_graph['reactions'][rxn_uid]
        map_rxn_set.add(rxn_node['bigg_id'])
    
    cpd_in_map_count = len(map_cpd_set & set(map(lambda x : x.get_seed_id(), fbamodel.metabolites)))
    rxn_in_map_count = len(map_rxn_set & set(map(lambda x : x.data['reaction_ref'].split('/')[-1].split('_')[0], fbamodel.reactions)))

    gene_in_map_count = 0
    return {
        'map_cpd' : len(map_cpd_set),
        'cpd_in_map_count' : cpd_in_map_count,
        'map_rxn' : len(map_rxn_set),
        'rxn_in_map_count' : rxn_in_map_count
    }



def setup_viewer_data(params, api, data_path):
    models = {
        'iML1515' : fbamodel1,
        'KBase' : fbamodel2,
    }
    
    for model_ref in params['model_ids']:
        ref = api.get_object_info_from_ref(model_ref)
        model_raw = api.get_object(ref.id, ref.workspace_id)
        fbamodel = cobrakbase.core.KBaseFBAModel(model_raw)
        models[model_ref] = fbamodel
        b = cobrakbase.core.converters.KBaseFBAModelToCobraBuilder(fbamodel)
        cobra_model = b.build()
        
    for model_id in models:
        b = KBaseFBAModelToCobraBuilder(models[model_id])
        cobra_model = b.build()
        cobra_json = json.loads(cobra.io.to_json(cobra_model))
        for m in cobra_json['metabolites']:
            m['id'] += '@' + model_id
        for r in cobra_json['reactions']:
            r['id'] += '@' + model_id
            r['metabolites'] = dict(map(lambda x : (x + '@' + model_id, r['metabolites'][x]), r['metabolites']))
        with open(data_path + '/map_model/' + model_id + '.json', 'w') as fh:
            fh.write(json.dumps(cobra_json))
    
    grid = modelseed_escher.EscherGrid()
    em_list = []
    map_assembly = []
    for grid_block_data in map_assembly:
        map_id = grid_block_data['map_id']
        cmp_id = grid_block_data['cmp_id']
        model_id = grid_block_data['model_id']
        fbamodel = models[model_id]
        em = escher_seed.get_map('ModelSEED', 'ModelSEED', map_id)
        em = adapt_map_to_model(em, cmp_id, model_id, fbamodel)
        em_list.append(em)
    grid_map = grid.build(em_list, (int(params['grid_x']), int(params['grid_y'])))
    
    map_list = {}
    for m in escher_seed.list_maps('ModelSEED'):
        model_id, map_id = m.split('.')
        map_data = escher_seed.get_map('ModelSEED', model_id, map_id)
        map_list[map_id] = {}
        for model_id in models:
            map_list[map_id][model_id] = {}
            map_list[map_id][model_id] = scan_content(map_data, models[model_id], None)
    with open(data_path + '/map_list.json', 'w') as fh:
        fh.write(json.dumps(map_list))
    
    return models