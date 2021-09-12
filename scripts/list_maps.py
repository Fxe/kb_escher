import escher
import modelseedpy_escher

escher_seed = modelseedpy_escher.EscherManager(escher)

print(escher_seed.escher.get_cache_dir())

for m in escher_seed.list_maps('ModelSEED'):
    print(m)