import cobrakbase
import json
import modelseed_escher
import math
from cobrakbase.core import KBaseFBAModel
from cobrakbase.core.converters import KBaseFBAModelToCobraBuilder
from modelseed_escher.core import EscherMap
from modelseed_escher.convert_utils import move_to_compartment

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
        
        self.base_maps = {}
        self.model_alias = {}
        self.model_names = {}
        self.model_cache = {}
        self.viewer_config = {
            'map_list' : False,
            'menu' : 'zoom',
            'tooltip_component' : None
        }
        
        if not config == None:
            self.setup_config(config)
            
            
    def get_object_from_ref(self, ref_str):
        ref = self.kbase_api.get_object_info_from_ref(ref_str)
        data = self.kbase_api.get_object(ref.id, ref.workspace_id)
        return data
    
    def setup_config(self, config):
        column_size = int(config['column_size'])
        grid_cells = len(config['grid_maps'])
        self.grid_size = (column_size, math.ceil(grid_cells / column_size))
        
        for grid_cell in config['grid_maps']:
            print(grid_cell)
            map_id = None
            if not grid_cell['map_id'] == 'custom':
                map_id = grid_cell['map_id']
                if not map_id in self.base_maps:
                    em = self.escher_api.get_map('ModelSEED', 
                                                 'ModelSEED', 
                                                 map_id)
                    self.base_maps[map_id] = em
                    
            else:
                ref = self.kbase_api.get_object_info_from_ref(grid_cell['user_map_id'])
                map_id = 'custom.' + ref.id
                if not map_id in self.base_maps:
                    map_data = self.get_object_from_ref(grid_cell['user_map_id'])
                    em = modelseed_escher.core.EscherMap([map_data['metadata'], 
                                                          map_data['layout']])
                    self.base_maps[map_id] = em
            
            if not grid_cell['model_id'] in self.model_cache:
                ref = self.kbase_api.get_object_info_from_ref(grid_cell['model_id'])
                data = self.get_object_from_ref(grid_cell['model_id'])
                self.model_cache[grid_cell['model_id']] = KBaseFBAModel(data)
                self.model_names[grid_cell['model_id']] = ref.id
                if 'model_alias' in grid_cell:
                    self.model_alias[grid_cell['model_id']] = grid_cell['model_alias']
            
            self.em_data.append({
                'map_id' : map_id,
                'model_id' : grid_cell['model_id'],
                'cmp' : 'c0'
            })
        
    def build(self):
        self.em_list = []
        grid_cell_num = 0
        for grid_cell in self.em_data:
            escher_map = self.base_maps[grid_cell['map_id']]
            fbamodel = self.model_cache[grid_cell['model_id']]
            cmp_id = grid_cell['cmp']
            alias = str(grid_cell_num)
            if grid_cell['model_id'] in self.model_alias:
                alias = self.model_alias[grid_cell['model_id']]
            em_cell = self.build_grid_cell(escher_map, fbamodel, 
                                                cmp_id = cmp_id, alias = alias)
            self.em_list.append(em_cell)
            grid_cell_num +=1

        grid = modelseed_escher.EscherGrid()
        grid_map = grid.build(self.em_list, self.grid_size)
        self.grid_map = grid_map
        return self.grid_map
    
    def export(self, folder = '/kb/module/data/html/data/'):
        with open(folder + '/map_config.json', 'w') as fh:
            fh.write(json.dumps({
                'x' : self.grid_size[0],
                'y' : self.grid_size[1],
                'maps' : list(map(lambda x : ';'.join([
                    self.model_names[x['model_id']], 
                    'c0', 'z', 
                    x['map_id']]
                ), self.em_data))
            }))
        
        
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
        move_to_compartment(cmp_id, em)

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