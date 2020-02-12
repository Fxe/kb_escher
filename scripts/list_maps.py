import escher
import modelseed_escher

escher_seed = modelseed_escher.EscherManager(escher)

print(escher_seed.escher.get_cache_dir())

for m in escher_seed.list_maps('ModelSEED'):
    print(m)