import cobrakbase
import json
import modelseed_escher
import math
from cobrakbase.core import KBaseFBAModel
from cobrakbase.core.converters import KBaseFBAModelToCobraBuilder
from modelseed_escher.core import EscherMap
from modelseed_escher.convert_utils import move_to_compartment 
from modelseed_escher.convert_utils import move_to_compartment2 #improved version to add '0' index

def is_empty(s):
    if s == None:
        return True
    if type(s) == list:
        return len(s) < 1
    if len(s.strip()) == 0:
        return True
    return False

class KBaseEscher:
    
    def __init__(self, config, kbase_api, escher_api):
        self.kbase_api = kbase_api
        self.escher_api = escher_api
        
        self.grid_map = None #base map
        
        self.em_list = []
        self.em_data = []
        self.grid_size = None
        self.grid_config = {
            'x' : 1,
            'y' : 1,
            'maps' : []
        }
        
        self.global_rxn_data = None
        self.global_cpd_data = None
        self.global_gene_data = None
        self.grid_models = []
        self.warnings = []
        
        self.object_cache = {}
        self.base_maps = {}
        self.model_alias = {}
        self.model_names = {}
        self.model_cache = {}
        self.viewer_config = {
            'gene_mode' : False,
            'map_list' : False,
            'menu' : 'zoom',
            'tooltip_component' : None,
            'default_rxn_data' : None,
            'default_cpd_data' : None,
            'default_gene_data' : None
        }
        
        if not config == None:
            self.setup_config(config)
            
    def get_chemical_abundance_data(self, data, dataset):
        row_attributemapping_ref = data['row_attributemapping_ref']
        mapping = self.object_cache[row_attributemapping_ref]

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
                result[k] = v
                if k in mapping['instances']:
                    for attr_val in mapping['instances'][k]:
                        if attr_val.startswith('cpd'):
                            for maybe_seed_id in attr_val.split(';'):
                                result[maybe_seed_id] = v
                #if k in mapping['instances'] and len(mapping['instances'][k]) > 5 and len(mapping['instances'][k][5]) > 0:
                #    result[mapping['instances'][k][5]] = v
                #else:
                #    result[k] = v

        return result
    
    def get_expression_data(self, data, dataset):
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
            
    def get_object_from_ref(self, ref_str):
        ref = self.kbase_api.get_object_info_from_ref(ref_str)
        data = self.kbase_api.get_object(ref.id, ref.workspace_id)
        return data
    
    def setup_config(self, config):
        if 'gene_mode' in config and config['gene_mode']:
            self.viewer_config['gene_mode'] = True
        column_size = int(config['column_size'])
        grid_cells = len(config['grid_maps'])
        self.grid_size = (column_size, math.ceil(grid_cells / column_size))
        
        grid_cell_num = 0
        
        for grid_cell in config['grid_maps']:
            print(grid_cell)
            map_id = None
            rxn_data = None
            cpd_data = None
            gene_data = None
            if not grid_cell['map_id'] == 'custom':
                map_id = grid_cell['map_id']
                if not map_id in self.base_maps:
                    em = self.escher_api.get_map('ModelSEED', 
                                                 'ModelSEED', 
                                                 map_id)
                    self.base_maps[map_id] = em
                    
            else:
                user_map_ref = grid_cell['user_map_id'][0]
                ref = self.kbase_api.get_object_info_from_ref(user_map_ref)
                map_id = 'custom.' + ref.id
                if not map_id in self.base_maps:
                    map_data = self.get_object_from_ref(user_map_ref)
                    em = modelseed_escher.core.EscherMap([map_data['metadata'], 
                                                          map_data['layout']])
                    self.base_maps[map_id] = em
            
            if not grid_cell['model_id'] in self.model_cache:
                ref = self.kbase_api.get_object_info_from_ref(grid_cell['model_id'])
                data = self.get_object_from_ref(grid_cell['model_id'])
                self.model_cache[grid_cell['model_id']] = KBaseFBAModel(data)
                self.model_names[grid_cell['model_id']] = ref.id

            alias = str(grid_cell_num)
            
            if 'model_alias' in grid_cell and len(grid_cell['model_alias'].strip()) > 0:
                alias = grid_cell['model_alias']

            
            grid_cell_num +=1
            
            if not is_empty(grid_cell['object_ids']):
                fba_ref = grid_cell['object_ids'][0]
                if not grid_cell['object_ids'][0] in self.object_cache:
                    self.object_cache[fba_ref] = self.get_object_from_ref(fba_ref)
                rxn_data = fba_ref
            
            if not is_empty(grid_cell['cpd_abundance']) and not is_empty(grid_cell['cpd_abundance_dataset']):
                cpd_abundance_ref = grid_cell['cpd_abundance'][0]
                if not cpd_abundance_ref in self.object_cache:
                    self.object_cache[cpd_abundance_ref] = self.get_object_from_ref(cpd_abundance_ref)
                row_attributemapping_ref = self.object_cache[cpd_abundance_ref]['row_attributemapping_ref']
                if not row_attributemapping_ref in self.object_cache:
                    self.object_cache[row_attributemapping_ref] = self.get_object_from_ref(row_attributemapping_ref)
                cpd_data = (cpd_abundance_ref, grid_cell['cpd_abundance_dataset'])
                
            if not is_empty(grid_cell['gene_expression']) and not is_empty(grid_cell['gene_expression_dataset']):
                gene_expr_ref = grid_cell['gene_expression'][0]
                if not gene_expr_ref in self.object_cache:
                    self.object_cache[gene_expr_ref] = self.get_object_from_ref(gene_expr_ref)
                    
                gene_data = (gene_expr_ref, grid_cell['gene_expression_dataset'])
            export_full_model = False
            if 'export_full_model' in grid_cell and grid_cell['export_full_model']:
                export_full_model = True
            self.em_data.append({
                'map_id' : map_id,
                'model_id' : grid_cell['model_id'],
                'cmp' : 'c0',
                'alias' : alias,
                'rxn_data' : rxn_data,
                'cpd_data' : cpd_data,
                'gene_data' : gene_data,
                'export_full_model' : export_full_model
            })
        
    def build(self):
        self.em_list = []
        self.global_rxn_data = {}
        self.global_cpd_data = {}
        self.global_gene_data = {}
        
        for grid_cell in self.em_data:
            print(grid_cell)
            escher_map = self.base_maps[grid_cell['map_id']]
            fbamodel = self.model_cache[grid_cell['model_id']]
            cmp_id = grid_cell['cmp']
            alias = grid_cell['alias']
            em_cell = self.build_grid_cell(escher_map, fbamodel, 
                                                cmp_id = cmp_id, alias = alias)
            

            rxn_ids = self.get_rxn_in_model(fbamodel, em_cell, cmp_id, alias, grid_cell['export_full_model'])
            em_model = self.get_grid_model(rxn_ids, alias, fbamodel, alias)
            self.em_list.append(em_cell)
            self.grid_models.append(em_model)
            try:
                if grid_cell['rxn_data']:
                    odata = self.object_cache[grid_cell['rxn_data']]
                    fba = cobrakbase.core.KBaseFBA(odata)
                    flux_dist = {}
                    for o in fba.data['FBAReactionVariables']:
                        rxn_id = o['modelreaction_ref'].split('/')[-1]
                        flux_dist[rxn_id + '@' + grid_cell['alias']] = o['value']
                    if grid_cell['export_full_model']:
                        for k in flux_dist:
                            self.global_rxn_data[k] = flux_dist[k]
                    else:
                        map_rxn_ids = set(map(lambda x : x[1]['bigg_id'], em_cell.escher_graph['reactions'].items()))
                        f_dict = dict(filter(lambda x : x[0] in map_rxn_ids, flux_dist.items()))
                        for k in f_dict:
                            self.global_rxn_data[k] = f_dict[k]
            except Exception as e:
                self.warnings.append("failed to add rxn_data")
                
            try:
                if grid_cell['cpd_data']:
                    cpd_mat = self.object_cache[grid_cell['cpd_data'][0]]
                    cpd_data = self.get_chemical_abundance_data(cpd_mat, grid_cell['cpd_data'][1])
                    if cpd_data == None or len(cpd_data) == 0:
                        self.warnings.append("Unable to map ModelSEED identifiers")
                    else:
                        cpd_data = dict(map(lambda x : (x[0] + '_' + cmp_id + '@' + alias, x[1]), cpd_data.items()))

                        filter_cpds = dict(filter(lambda x : 'bigg_id' in x[1], em_cell.escher_graph['nodes'].items()))
                        map_cpd_ids = set(map(lambda x : x[1]['bigg_id'], filter_cpds.items()))
                        for k in cpd_data:
                            if k in map_cpd_ids:
                                self.global_cpd_data[k] = cpd_data[k]
            except Exception as e:
                self.warnings.append("failed to add cpd_data")
                       
            try:
                if grid_cell['gene_data']:
                    gene_mat = self.object_cache[grid_cell['gene_data'][0]]
                    gene_data = self.get_expression_data(gene_mat, grid_cell['gene_data'][1])
                    gene_data = dict(map(lambda x : (x[0] + '@' + alias, x[1]), gene_data.items()))
                    for k in gene_data:
                        self.global_gene_data[k] = gene_data[k]
            except:
                self.warnings.append("failed to add gene_data")
                
        grid = modelseed_escher.EscherGrid()
        grid_map = grid.build(self.em_list, self.grid_size)
        self.grid_map = grid_map
        return self.grid_map
    
    def export(self, folder = '/kb/module/data/html/data/'):
        if not self.global_rxn_data == None and not len(self.global_rxn_data) == 0:
            self.viewer_config['default_rxn_data'] = 'global_rxn_data.json'
            with open(folder + '/global_rxn_data.json', 'w') as fh:
                fh.write(json.dumps(self.global_rxn_data))
                
        if not self.global_cpd_data == None and not len(self.global_cpd_data) == 0:
            self.viewer_config['default_cpd_data'] = 'global_cpd_data.json'
            with open(folder + '/global_cpd_data.json', 'w') as fh:
                fh.write(json.dumps(self.global_cpd_data))
                
        if not self.global_gene_data == None and not len(self.global_gene_data) == 0:
            self.viewer_config['default_gene_data'] = 'global_gene_data.json'
            with open(folder + '/global_gene_data.json', 'w') as fh:
                fh.write(json.dumps(self.global_gene_data))

        self.viewer_config['grid_config'] = {
                'x' : self.grid_size[0],
                'y' : self.grid_size[1],
                'maps' : list(map(lambda x : ';'.join([
                    self.model_names[x['model_id']], 
                    x['cmp'], 'z', 
                    x['map_id']]
                ), self.em_data))
            }
        
        with open(folder + '/models/model.json', 'w') as fh:
            fh.write(json.dumps(self.merge_models(self.grid_models, 'master')))
        
        with open(folder + '/viewer_config.json', 'w') as fh:
            fh.write(json.dumps(self.viewer_config))

        for map_id in self.base_maps:
            with open(folder + '/map_base/' + map_id + '.json', 'w') as fh:
                fh.write(json.dumps(self.base_maps[map_id].escher_map))
        if not self.grid_map == None:
            with open(folder + '/escher_map.json', 'w') as fh:
                fh.write(json.dumps(self.grid_map.escher_map))
    
    def build_grid_cell(self, escher_map, fbamodel, cmp_id = 'c0', alias = None):
        em = self.adapt_map_to_model(escher_map, cmp_id, str(alias), fbamodel)
        return em
    
    def adapt_map_to_model(self, em, cmp_id, suffix, fbamodel):
        em = em.clone()
        #adapt map to compartment
        move_to_compartment2(cmp_id, em, '0')

        map_cpd_set = set()
        map_rxn_set = set()
        for node_uid in em.nodes:
            node = em.escher_graph['nodes'][node_uid]
            if node['node_type'] == 'metabolite':
                map_cpd_set.add(node['bigg_id'])
        for rxn_uid in em.escher_graph['reactions']:
            rxn_node = em.escher_graph['reactions'][rxn_uid]
            map_rxn_set.add(rxn_node['bigg_id'])

        model_cpds = set(map(lambda x : x.id, fbamodel.metabolites))
        model_rxns = set(map(lambda x : x.id, fbamodel.reactions))

        map_cpd_delete = map_cpd_set - model_cpds
        map_rxn_delete = map_rxn_set - model_rxns

        #remove metabolites / reactions
        em.delete_reactions(map_rxn_delete)
        em.delete_metabolites(map_cpd_delete)

        #add suffix
        cpd_remap = dict(map(lambda x : (x, x + '@' + suffix), map_cpd_set))
        rxn_remap = dict(map(lambda x : (x, x + '@' + suffix), map_rxn_set))
        em.swap_ids(cpd_remap, rxn_remap)
        #update rev
        #TODO: I WAS HERE!

        return em
    
    def get_rxn_in_model(kb_escher, fbamodel, em, cmp_id, alias, all_rxn = False):
        map_rxn_set = set()
        map_to_original = {}
        model_rxns = set(map(lambda x : x.id, fbamodel.reactions))
        model_rxns_alias = set(map(lambda x : x.id + '@' + alias, fbamodel.reactions))
        for k in model_rxns:
            map_to_original[k + '@' + alias] = k
        if all_rxn:
            return model_rxns
        for rxn_uid in em.escher_graph['reactions']:
            rxn_node = em.escher_graph['reactions'][rxn_uid]
            map_rxn_set.add(rxn_node['bigg_id'])
        return set(map(lambda x : map_to_original[x], map_rxn_set & model_rxns_alias))
    
    def merge_models(self, models, model_id):
        m = {
                'id' : model_id,
                'compartments' : {},
                'metabolites' : [],
                'reactions' : [],
                'genes' : []
            }
        for model in models:
            m['metabolites'] += model['metabolites']
            m['reactions'] += model['reactions']
            m['genes'] += model['genes']
        return m
    
    def get_grid_model(self, rxn_ids, suffix, fbamodel, model_id):
        m = {
            'id' : model_id,
            'compartments' : {},
            'metabolites' : [],
            'reactions' : [],
            'genes' : []
        }
        gene_ids = {}
        rxn_cpd_ids = set()
        for rxn_id in rxn_ids:
            rxn = fbamodel.get_reaction(rxn_id)
            gpr = rxn.get_gpr()
            #add suffix to GPR
            gpr = list(map(lambda x : set(map(lambda i : "{}@{}".format(i, suffix), x)), gpr))
            for and_rule in gpr:
                for gene_id in and_rule:
                    gene_ids[gene_id] = None
            gpr_str = rxn.get_gpr_string(gpr)
            #print(rxn_id, gpr)
            s = rxn.stoichiometry
            metabolites = dict(map(lambda x : (x[0] + '@' + suffix, x[1]), s.items()))
            for cpd_id in s:
                rxn_cpd_ids.add(cpd_id)
            m['reactions'].append({
                'id': "{}@{}".format(rxn_id, suffix),
                 'name': '{} [{}]'.format(rxn_id, suffix),
                 'metabolites': metabolites,
                 'lower_bound': rxn.bounds[0],
                 'upper_bound': rxn.bounds[1],
                 'gene_reaction_rule': gpr_str,
                 'annotation': {}
            })
        for cpd_id in rxn_cpd_ids:
            cpd = fbamodel.get_metabolite(cpd_id)

            m['metabolites'].append({
                'id': "{}@{}".format(cpd_id, suffix),
                'name': cpd.name,
                'compartment': cpd.compartment,
                'charge': 1,
                'formula': 'C12H14N2O2',
                'annotation': {}})

        for gene_id in gene_ids:
            m['genes'].append({
                'id': gene_id, 'name': gene_id, 'annotation': {}
            })

        return m