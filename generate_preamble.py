import sys

preamble = """
__pr = require("%s"); __pr.openModule(__pr);
__ch = require("%s"); __pr.openModule(__ch);
""" % ("./probabilistic/index", sys.argv[1])

outfn = sys.argv[2]

fh = open(outfn, 'w')
fh.write(preamble)
fh.close()

