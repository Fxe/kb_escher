import escher
import modelseed_escher

escher_seed = modelseed_escher.EscherManager(escher)

for m in escher_seed.list_maps('ModelSEED'):
    print(m)