import escher
import modelseed_escher

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

def adapt_map_to_model(em, cmp_id, suffix, fbamodel):
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